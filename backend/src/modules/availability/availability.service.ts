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

// Backend slot lifecycle -> client-facing status.
const SLOT_STATUS_MAP: Record<string, string> = {
  OPEN: 'AVAILABLE',
  BOOKED: 'BOOKED',
  LOCKED: 'BLOCKED',
};

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly coachRepository: CoachRepository,
  ) {}

  async createSlot(userId: string, dto: CreateSlotDto): Promise<SlotResponseDto> {
    const coach = await this.requireCoach(userId);
    const { start, end } = this.validateRange(dto.startTime, dto.endTime);

    const slot = await this.availabilityRepository.create({
      coach: { connect: { id: coach.id } },
      startTime: start,
      endTime: end,
    });

    this.logger.log({ message: 'Slot created', slotId: slot.id, coachId: coach.id });
    return toResponseDto(slot);
  }

  async createBulkSlots(
    userId: string,
    dto: CreateBulkSlotsDto,
  ): Promise<{ created: number }> {
    const coach = await this.requireCoach(userId);

    const data = dto.slots.map((slot) => {
      const { start, end } = this.validateRange(slot.startTime, slot.endTime);
      return { coachId: coach.id, startTime: start, endTime: end };
    });

    const result = await this.availabilityRepository.createMany(data);
    this.logger.log({ message: 'Bulk slots created', coachId: coach.id, count: result.count });
    return { created: result.count };
  }

  // Public: slots for a coach in a date window (booking calendar).
  async getCoachAvailability(
    coachId: string,
    from?: string,
    to?: string,
  ): Promise<SlotResponseDto[]> {
    const coach = await this.coachRepository.findById(coachId);
    if (!coach) {
      throw new NotFoundException(`Coach ${coachId} not found`);
    }
    const slots = await this.availabilityRepository.findByCoach({
      coachId,
      ...this.parseWindow(from, to),
    });
    return slots.map(toResponseDto);
  }

  // The current coach's own slots in a window (schedule management).
  async getMySlots(
    userId: string,
    from?: string,
    to?: string,
  ): Promise<SlotResponseDto[]> {
    const coach = await this.requireCoach(userId);
    const slots = await this.availabilityRepository.findByCoach({
      coachId: coach.id,
      ...this.parseWindow(from, to),
    });
    return slots.map(toResponseDto);
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

  private async requireCoach(userId: string) {
    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }
    return coach;
  }

  private parseWindow(from?: string, to?: string): { from?: Date; to?: Date } {
    const window: { from?: Date; to?: Date } = {};
    if (from) {
      window.from = new Date(from);
    }
    if (to) {
      // Make `to` inclusive of the whole day it names.
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      window.to = end;
    }
    return window;
  }

  private validateRange(startIso: string, endIso: string): { start: Date; end: Date } {
    const start = new Date(startIso);
    const end = new Date(endIso);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid start or end datetime');
    }
    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    if (durationMinutes <= 0) {
      throw new BadRequestException('End time must be after start time');
    }
    if (durationMinutes < 15) {
      throw new BadRequestException('Slot duration must be at least 15 minutes');
    }
    return { start, end };
  }
}

function toResponseDto(slot: any): SlotResponseDto {
  return {
    id: slot.id,
    coachId: slot.coachId,
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
    status: SLOT_STATUS_MAP[slot.status] ?? slot.status,
  };
}
