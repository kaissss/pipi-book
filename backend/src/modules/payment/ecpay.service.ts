import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EcpayOrderParams {
  merchantTradeNo: string;
  merchantTradeDate: string;
  totalAmount: number;
  tradeDesc: string;
  itemName: string;
  // Server-to-server webhook URL; falls back to config when omitted.
  returnURL?: string;
  // POSTed to by ECPay after payment; falls back to config.
  orderResultURL?: string;
  choosePayment?: string;
  // GET return-to-merchant link; falls back to the configured frontend URL.
  clientBackURL?: string;
}

export interface EcpayFormData {
  formUrl: string;
  params: Record<string, string>;
  checkMacValue: string;
}

@Injectable()
export class EcpayService {
  private readonly logger = new Logger(EcpayService.name);

  constructor(private readonly configService: ConfigService) {}

  private get merchantId(): string {
    return this.configService.get<string>('ecpay.merchantId') ?? '';
  }

  private get hashKey(): string {
    return this.configService.get<string>('ecpay.hashKey') ?? '';
  }

  private get hashIv(): string {
    return this.configService.get<string>('ecpay.hashIv') ?? '';
  }

  private get apiUrl(): string {
    return this.configService.get<string>('ecpay.apiUrl') ?? '';
  }

  /**
   * Generate ECPay SHA256 HMAC CheckMacValue.
   * Steps:
   *  1. Sort params alphabetically (case-insensitive)
   *  2. Concatenate as HashKey=key&param1=val1...&HashIV=iv
   *  3. URL-encode (lowercase, ECPay-specific encoding rules)
   *  4. SHA256 hash → uppercase hex
   */
  generateCheckMacValue(params: Record<string, string>): string {
    // Remove CheckMacValue if present
    const { CheckMacValue: _, ...rest } = params;

    // Sort params alphabetically (case-insensitive)
    const sorted = Object.keys(rest)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = rest[key];
        return acc;
      }, {});

    // Build query string
    const queryString = Object.entries(sorted)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    // Wrap with HashKey and HashIV
    const raw = `HashKey=${this.hashKey}&${queryString}&HashIV=${this.hashIv}`;

    // URL-encode (lowercase)
    const encoded = this.ecpayUrlEncode(raw);

    // SHA256 hash → uppercase
    const hash = crypto
      .createHash('sha256')
      .update(encoded)
      .digest('hex')
      .toUpperCase();

    this.logger.debug({ message: 'Generated CheckMacValue', hash: hash.slice(0, 8) + '...' });
    return hash;
  }

  /**
   * Verify ECPay webhook CheckMacValue.
   */
  verifyCheckMacValue(params: Record<string, string>): boolean {
    const received = params.CheckMacValue;
    if (!received) {
      this.logger.warn('CheckMacValue missing from webhook payload');
      return false;
    }

    const expected = this.generateCheckMacValue(params);
    const valid = expected === received;

    if (!valid) {
      this.logger.warn({
        message: 'CheckMacValue mismatch',
        expected: expected.slice(0, 8) + '...',
        received: received.slice(0, 8) + '...',
      });
    }

    return valid;
  }

  /**
   * Build ECPay order params for form submission.
   */
  buildOrderParams(order: EcpayOrderParams): EcpayFormData {
    const returnURL =
      order.returnURL || this.configService.get<string>('ecpay.returnUrl');
    const orderResultURL =
      order.orderResultURL ||
      this.configService.get<string>('ecpay.orderResultUrl');

    const clientBackURL =
      order.clientBackURL ||
      this.configService.get<string>('app.frontendUrl');

    const params: Record<string, string> = {
      MerchantID: this.merchantId,
      MerchantTradeNo: order.merchantTradeNo,
      MerchantTradeDate: order.merchantTradeDate,
      PaymentType: 'aio',
      TotalAmount: String(Math.round(order.totalAmount)),
      TradeDesc: order.tradeDesc,
      ItemName: order.itemName,
      ReturnURL: returnURL ?? '',
      ChoosePayment: this.mapPaymentMethod(order.choosePayment || 'Credit'),
      EncryptType: '1',
      // OrderResultURL is POSTed to by ECPay → must be a backend endpoint.
      ...(orderResultURL && { OrderResultURL: orderResultURL }),
      // ClientBackURL is a GET "return to merchant" link → safe for the SPA.
      ...(clientBackURL && { ClientBackURL: clientBackURL }),
    };

    const checkMacValue = this.generateCheckMacValue(params);

    this.logger.log({
      message: 'ECPay order params built',
      merchantTradeNo: order.merchantTradeNo,
      amount: order.totalAmount,
    });

    return {
      formUrl: this.apiUrl,
      params,
      checkMacValue,
    };
  }

  /**
   * Generate merchant trade number from booking ID.
   * ECPay allows max 20 chars.
   */
  generateMerchantTradeNo(bookingId: string): string {
    const timestamp = Date.now().toString().slice(-8);
    const shortId = bookingId.replace(/-/g, '').slice(0, 12);
    return `CB${shortId}${timestamp}`.slice(0, 20);
  }

  /**
   * Format date for ECPay: yyyy/MM/dd HH:mm:ss
   */
  formatTradeDate(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private mapPaymentMethod(method: string): string {
    const map: Record<string, string> = {
      CREDIT_CARD: 'Credit',
      ATM: 'ATM',
      CVS: 'CVS',
      BARCODE: 'BARCODE',
      Credit: 'Credit',
      ALL: 'ALL',
    };
    return map[method] || 'Credit';
  }

  /**
   * ECPay-specific URL encoding:
   * - lowercase
   * - replace %20 with +
   * - ECPay does NOT encode: . - _ * ! ( )
   */
  private ecpayUrlEncode(str: string): string {
    return encodeURIComponent(str)
      .toLowerCase()
      .replace(/%20/g, '+')
      .replace(/%21/g, '!')
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
      .replace(/%2a/g, '*')
      .replace(/%2d/g, '-')
      .replace(/%2e/g, '.')
      .replace(/%5f/g, '_');
  }
}
