import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CoachRepository } from './coach.repository';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { CoachResponseDto } from './dto/coach-response.dto';

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

    const coach = await this.coachRepository.create({
      user: { connect: { id: userId } },
      nickname: dto.nickname,
      introduction: dto.introduction,
      experience: dto.experience,
      certifications: dto.certifications || [],
      hourlyPrice: dto.hourlyPrice,
    });

    this.logger.log({ message: 'Coach profile created', coachId: coach.id, userId });
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

  async listApprovedCoaches(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: CoachResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [coaches, total] = await Promise.all([
      this.coachRepository.findAll({ skip, take: limit, isApproved: true }),
      this.coachRepository.count(true),
    ]);

    return {
      data: coaches.map(this.toResponseDto),
      total,
      page,
      limit,
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
      ...(dto.nickname && { nickname: dto.nickname }),
      ...(dto.introduction !== undefined && { introduction: dto.introduction }),
      ...(dto.experience !== undefined && { experience: dto.experience }),
      ...(dto.certifications && { certifications: dto.certifications }),
      ...(dto.hourlyPrice !== undefined && { hourlyPrice: dto.hourlyPrice }),
    });

    this.logger.log({ message: 'Coach profile updated', coachId: coach.id });
    return this.toResponseDto(updated);
  }

  async approveCoach(coachId: string): Promise<CoachResponseDto> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }

    const approved = await this.coachRepository.approve(coachId);
    this.logger.log({ message: 'Coach approved', coachId });
    return this.toResponseDto(approved);
  }

  private toResponseDto(coach: any): CoachResponseDto {
    return {
      id: coach.id,
      userId: coach.userId,
      nickname: coach.nickname,
      introduction: coach.introduction,
      experience: coach.experience,
      certifications: coach.certifications,
      hourlyPrice: Number(coach.hourlyPrice),
      isApproved: coach.isApproved,
      createdAt: coach.createdAt,
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
