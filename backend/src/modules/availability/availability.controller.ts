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

// Routed under /coaches/* to match the client's resource model.
@ApiTags('Availability')
@ApiBearerAuth('JWT')
@Controller('coaches')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Public()
  @Get(':coachId/availability')
  @ApiOperation({ summary: "Get a coach's slots within a date window" })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (YYYY-MM-DD)' })
  async getCoachAvailability(
    @Param('coachId', ParseUUIDPipe) coachId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.availabilityService.getCoachAvailability(coachId, from, to);
  }

  @Get('me/slots')
  @ApiOperation({ summary: "Get the current coach's slots within a date window" })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getMySlots(
    @CurrentUser() user: CurrentUserPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.availabilityService.getMySlots(user.sub, from, to);
  }

  @Post('me/slots')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a single availability slot' })
  async createSlot(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateSlotDto,
  ) {
    return this.availabilityService.createSlot(user.sub, dto);
  }

  @Post('me/slots/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple availability slots' })
  async createBulkSlots(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateBulkSlotsDto,
  ) {
    return this.availabilityService.createBulkSlots(user.sub, dto);
  }

  @Delete('me/slots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an availability slot' })
  async deleteSlot(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.availabilityService.deleteSlot(user.sub, id);
  }
}
