import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { EcpayWebhookDto } from './dto/ecpay-webhook.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a payment order for a booking' })
  async createPayment(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(user.sub, dto);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ECPay payment webhook (public)' })
  async handleWebhook(
    @Body() dto: EcpayWebhookDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.paymentService.handleWebhook(dto);
      // ECPay expects plain text response
      res.setHeader('Content-Type', 'text/plain');
      return res.send(result);
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(400).send('0|Error');
    }
  }

  @Get('booking/:bookingId')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get payment by booking ID' })
  async getPaymentByBooking(
    @CurrentUser() user: CurrentUserPayload,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.paymentService.getPaymentByBooking(user.sub, bookingId);
  }
}
