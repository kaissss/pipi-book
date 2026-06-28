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
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { InitPaymentDto } from './dto/init-payment.dto';
import { EcpayWebhookDto } from './dto/ecpay-webhook.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @Post('init')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Initialize a payment and return the ECPay form data' })
  async initPayment(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: InitPaymentDto,
  ) {
    return this.paymentService.initPayment(user.sub, dto);
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

  @Public()
  @Post('result')
  @ApiOperation({ summary: 'ECPay browser return (POST) — finalizes and redirects to the app' })
  async paymentResult(@Body() body: EcpayWebhookDto, @Res() res: Response) {
    // ECPay POSTs the result to the buyer's browser here. The authoritative
    // update is the server-to-server webhook (ReturnURL); process this too as a
    // best-effort fallback, then 303-redirect (GET) back into the SPA.
    try {
      await this.paymentService.handleWebhook(body);
    } catch {
      // ignore — webhook is the source of truth
    }
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    return res.redirect(303, `${frontendUrl}/member/bookings`);
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
