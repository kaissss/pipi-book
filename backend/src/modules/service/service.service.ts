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
    if (!coach.isApproved) {
      throw new ForbiddenException('Coach profile must be approved before creating services');
    }

    const service = await this.serviceRepository.create({
      coach: { connect: { id: coach.id } },
      title: dto.title,
      duration: dto.duration,
      price: dto.price,
      description: dto.description,
      isActive: dto.isActive ?? true,
    });

    this.logger.log({
      message: 'Service created',
      serviceId: service.id,
      coachId: coach.id,
    });

    return this.toResponseDto(service);
  }

  async getService(serviceId: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }
    return this.toResponseDto(service);
  }

  async getCoachServices(
    coachId: string,
    activeOnly: boolean = true,
  ): Promise<ServiceResponseDto[]> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }

    const services = await this.serviceRepository.findByCoachId(
      coachId,
      activeOnly,
    );
    return services.map(this.toResponseDto);
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
      ...(dto.title && { title: dto.title }),
      ...(dto.duration !== undefined && { duration: dto.duration }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    this.logger.log({ message: 'Service updated', serviceId });
    return this.toResponseDto(updated);
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

  private toResponseDto(service: any): ServiceResponseDto {
    return {
      id: service.id,
      coachId: service.coachId,
      title: service.title,
      duration: service.duration,
      price: Number(service.price),
      description: service.description,
      isActive: service.isActive,
      createdAt: service.createdAt,
    };
  }
}
