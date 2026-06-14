import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateSlotDto, CreateBulkSlotsDto } from './dto/create-slot.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Availability')
@ApiBearerAuth('JWT')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('slots')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a single availability slot' })
  async createSlot(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateSlotDto,
  ) {
    return this.availabilityService.createSlot(user.sub, dto);
  }

  @Post('slots/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple availability slots' })
  async createBulkSlots(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateBulkSlotsDto,
  ) {
    return this.availabilityService.createBulkSlots(user.sub, dto);
  }

  @Public()
  @Get('coach/:coachId')
  @ApiOperation({ summary: "Get coach's available slots" })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  async getCoachSlots(
    @Param('coachId', ParseUUIDPipe) coachId: string,
    @Query('date') date?: string,
    @Query('fromDate') fromDate?: string,
  ) {
    if (date) {
      return this.availabilityService.getSlotsByCoachAndDate(coachId, date);
    }
    return this.availabilityService.getOpenSlots(coachId, fromDate);
  }

  @Delete('slots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an availability slot' })
  async deleteSlot(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.availabilityService.deleteSlot(user.sub, id);
  }
}
