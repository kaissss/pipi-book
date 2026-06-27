import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ServiceRepository } from './service.repository';
import { CoachRepository } from '../coach/coach.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { mapService } from '../coach/coach.service';

@Injectable()
export class ServiceService {
  private readonly logger = new Logger(ServiceService.name);

  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly coachRepository: CoachRepository,
  ) {}

  async createService(
    userId: string,
    dto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException('Coach profile not found. Create a coach profile first.');
    }

    // A coach can set up services while still PENDING approval — public
    // visibility is gated elsewhere by the coach's status, not here.
    const service = await this.serviceRepository.create({
      coach: { connect: { id: coach.id } },
      name: dto.name,
      description: dto.description ?? '',
      type: dto.type,
      durationMinutes: dto.durationMinutes,
      price: dto.price,
      currency: dto.currency ?? 'TWD',
      maxParticipants: dto.maxParticipants ?? 1,
      isActive: dto.isActive ?? true,
    });

    this.logger.log({
      message: 'Service created',
      serviceId: service.id,
      coachId: coach.id,
    });

    return mapService(service);
  }

  async getService(serviceId: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }
    return mapService(service);
  }

  async getCoachServices(
    coachId: string,
    activeOnly: boolean = true,
  ): Promise<ServiceResponseDto[]> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }

    const services = await this.serviceRepository.findByCoachId(coachId, activeOnly);
    return services.map(mapService);
  }

  async updateService(
    userId: string,
    serviceId: string,
    dto: Partial<CreateServiceDto>,
  ): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach || coach.id !== service.coachId) {
      throw new ForbiddenException('You are not authorized to update this service');
    }

    const updated = await this.serviceRepository.update(serviceId, {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.type && { type: dto.type }),
      ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.currency && { currency: dto.currency }),
      ...(dto.maxParticipants !== undefined && { maxParticipants: dto.maxParticipants }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    this.logger.log({ message: 'Service updated', serviceId });
    return mapService(updated);
  }

  async deleteService(userId: string, serviceId: string): Promise<void> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach || coach.id !== service.coachId) {
      throw new ForbiddenException('You are not authorized to delete this service');
    }

    await this.serviceRepository.softDelete(serviceId);
    this.logger.log({ message: 'Service deactivated', serviceId });
  }
}
