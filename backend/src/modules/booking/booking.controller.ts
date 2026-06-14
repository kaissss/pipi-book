import {
  Controller,
  Get,
  Post,
  Patch,
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
import { BookingService } from './booking.service';
import { CreateBookingDto, CancelBookingDto } from './dto/create-booking.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { BookingStatus } from '@prisma/client';

@ApiTags('Bookings')
@ApiBearerAuth('JWT')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking (acquires slot lock)' })
  async createBooking(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(user.sub, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my bookings' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  async getMyBookings(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingService.getMyBookings(user.sub, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  async getBooking(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingService.getBooking(user.sub, id, user.role);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm a booking (coach or admin)' })
  async confirmBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingService.confirmBooking(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingService.cancelBooking(user.sub, id, user.role);
  }
}
