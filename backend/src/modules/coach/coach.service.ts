import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CoachStatus } from '@prisma/client';
import { CoachRepository } from './coach.repository';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { CoachResponseDto } from './dto/coach-response.dto';
import { ServiceResponseDto } from '../service/dto/service-response.dto';

export interface PaginatedCoaches {
  data: CoachResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(private readonly coachRepository: CoachRepository) {}

  async createProfile(
    userId: string,
    dto: CreateCoachDto,
  ): Promise<CoachResponseDto> {
    const existing = await this.coachRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Coach profile already exists for this user');
    }

    // Creating a profile also promotes the user to the COACH role so they can
    // reach the coach portal immediately. Public listing/booking stays gated by
    // `status` (PENDING until an admin approves).
    const coach = await this.coachRepository.createWithRolePromotion(userId, {
      user: { connect: { id: userId } },
      bio: dto.bio,
      specialties: dto.specialties ?? [],
      experience: dto.experience ?? 0,
      languages: dto.languages ?? [],
      location: dto.location,
      timezone: dto.timezone ?? 'Asia/Taipei',
      certifications: dto.certifications ?? [],
    });

    this.logger.log({
      message: 'Coach profile created and user promoted to COACH',
      coachId: coach.id,
      userId,
    });
    return this.toResponseDto(coach);
  }

  async getProfile(coachId: string): Promise<CoachResponseDto> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }
    return this.toResponseDto(coach);
  }

  async getMyProfile(userId: string): Promise<CoachResponseDto> {
    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }
    return this.toResponseDto(coach);
  }

  async listApprovedCoaches(page = 1, limit = 20): Promise<PaginatedCoaches> {
    return this.listCoaches(CoachStatus.APPROVED, page, limit);
  }

  async listCoaches(
    status: CoachStatus | undefined,
    page = 1,
    limit = 20,
  ): Promise<PaginatedCoaches> {
    const skip = (page - 1) * limit;
    const [coaches, total] = await Promise.all([
      this.coachRepository.findAll({ skip, take: limit, status }),
      this.coachRepository.count(status),
    ]);

    return {
      data: coaches.map((coach) => this.toResponseDto(coach)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateCoachDto,
  ): Promise<CoachResponseDto> {
    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }

    const updated = await this.coachRepository.update(coach.id, {
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.specialties && { specialties: dto.specialties }),
      ...(dto.experience !== undefined && { experience: dto.experience }),
      ...(dto.languages && { languages: dto.languages }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.timezone && { timezone: dto.timezone }),
      ...(dto.certifications && { certifications: dto.certifications }),
    });

    this.logger.log({ message: 'Coach profile updated', coachId: coach.id });
    return this.toResponseDto(updated);
  }

  async approveCoach(coachId: string): Promise<CoachResponseDto> {
    return this.setStatus(coachId, CoachStatus.APPROVED);
  }

  async rejectCoach(coachId: string, reason?: string): Promise<CoachResponseDto> {
    this.logger.log({ message: 'Coach rejected', coachId, reason });
    return this.setStatus(coachId, CoachStatus.REJECTED);
  }

  async suspendCoach(coachId: string): Promise<CoachResponseDto> {
    return this.setStatus(coachId, CoachStatus.SUSPENDED);
  }

  async isApproved(coachId: string): Promise<boolean> {
    const coach = await this.coachRepository.findById(coachId);
    return coach?.status === CoachStatus.APPROVED;
  }

  private async setStatus(
    coachId: string,
    status: CoachStatus,
  ): Promise<CoachResponseDto> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }
    const updated = await this.coachRepository.updateStatus(coachId, status);
    this.logger.log({ message: 'Coach status changed', coachId, status });
    return this.toResponseDto(updated);
  }

  private toResponseDto(coach: any): CoachResponseDto {
    return {
      id: coach.id,
      userId: coach.userId,
      bio: coach.bio,
      specialties: coach.specialties,
      experience: coach.experience,
      // Reviews are a future phase; expose neutral placeholders for now.
      rating: 0,
      reviewCount: 0,
      status: coach.status,
      timezone: coach.timezone,
      location: coach.location ?? undefined,
      languages: coach.languages,
      certifications: coach.certifications,
      coverImageUrl: coach.coverImageUrl ?? undefined,
      services: (coach.services ?? []).map(mapService),
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt,
      user: coach.user
        ? {
            id: coach.user.id,
            displayName: coach.user.displayName,
            avatar: coach.user.avatar,
            email: coach.user.email,
          }
        : undefined,
    };
  }
}

// Shared service mapper so coach and service modules emit an identical shape.
export function mapService(service: any): ServiceResponseDto {
  return {
    id: service.id,
    coachId: service.coachId,
    name: service.name,
    description: service.description,
    type: service.type,
    durationMinutes: service.durationMinutes,
    price: Number(service.price),
    currency: service.currency,
    maxParticipants: service.maxParticipants,
    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
