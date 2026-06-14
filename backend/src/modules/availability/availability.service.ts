import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { CoachRepository } from '../coach/coach.repository';
import { CreateSlotDto, CreateBulkSlotsDto } from './dto/create-slot.dto';
import { SlotResponseDto } from './dto/slot-response.dto';
import { SlotNotFoundException } from '../../common/exceptions/booking.exceptions';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly coachRepository: CoachRepository,
  ) {}

  async createSlot(
    userId: string,
    dto: CreateSlotDto,
  ): Promise<SlotResponseDto> {
    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }

    this.validateTimeRange(dto.startTime, dto.endTime);

    const slot = await this.availabilityRepository.create({
      coach: { connect: { id: coach.id } },
      date: new Date(dto.date),
      startTime: this.parseTime(dto.startTime),
      endTime: this.parseTime(dto.endTime),
    });

    this.logger.log({
      message: 'Slot created',
      slotId: slot.id,
      coachId: coach.id,
      date: dto.date,
    });

    return this.toResponseDto(slot);
  }

  async createBulkSlots(
    userId: string,
    dto: CreateBulkSlotsDto,
  ): Promise<{ created: number }> {
    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }

    dto.slots.forEach((s) => this.validateTimeRange(s.startTime, s.endTime));

    const data = dto.slots.map((s) => ({
      coachId: coach.id,
      date: new Date(s.date),
      startTime: this.parseTime(s.startTime),
      endTime: this.parseTime(s.endTime),
    }));

    const result = await this.availabilityRepository.createMany(data);

    this.logger.log({
      message: 'Bulk slots created',
      coachId: coach.id,
      count: result.count,
    });

    return { created: result.count };
  }

  async getSlotsByCoachAndDate(
    coachId: string,
    date: string,
  ): Promise<SlotResponseDto[]> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }

    const slots = await this.availabilityRepository.findByCoachAndDate(
      coachId,
      date,
    );
    return slots.map(this.toResponseDto);
  }

  async getOpenSlots(
    coachId: string,
    fromDate?: string,
  ): Promise<SlotResponseDto[]> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }

    const slots = await this.availabilityRepository.findOpenSlotsByCoach(
      coachId,
      fromDate,
    );
    return slots.map(this.toResponseDto);
  }

  async deleteSlot(userId: string, slotId: string): Promise<void> {
    const slot = await this.availabilityRepository.findById(slotId);
    if (!slot) {
      throw new SlotNotFoundException(slotId);
    }

    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach || coach.id !== slot.coachId) {
      throw new ForbiddenException('You are not authorized to delete this slot');
    }

    if (slot.status === 'BOOKED') {
      throw new ForbiddenException('Cannot delete a booked slot');
    }

    await this.availabilityRepository.delete(slotId);
    this.logger.log({ message: 'Slot deleted', slotId });
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('End time must be after start time');
    }

    if (endMinutes - startMinutes < 15) {
      throw new BadRequestException('Slot duration must be at least 15 minutes');
    }
  }

  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private toResponseDto(slot: any): SlotResponseDto {
    return {
      id: slot.id,
      coachId: slot.coachId,
      date: slot.date instanceof Date
        ? slot.date.toISOString().split('T')[0]
        : slot.date,
      startTime: slot.startTime instanceof Date
        ? `${slot.startTime.getHours().toString().padStart(2, '0')}:${slot.startTime.getMinutes().toString().padStart(2, '0')}`
        : slot.startTime,
      endTime: slot.endTime instanceof Date
        ? `${slot.endTime.getHours().toString().padStart(2, '0')}:${slot.endTime.getMinutes().toString().padStart(2, '0')}`
        : slot.endTime,
      status: slot.status,
      lockedUntil: slot.lockedUntil,
      createdAt: slot.createdAt,
    };
  }
}
