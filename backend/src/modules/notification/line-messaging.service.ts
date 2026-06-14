import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface LineTextMessage {
  type: 'text';
  text: string;
}

export interface LinePushPayload {
  to: string;
  messages: LineTextMessage[];
}

@Injectable()
export class LineMessagingService {
  private readonly logger = new Logger(LineMessagingService.name);
  private readonly lineApiBase = 'https://api.line.me/v2/bot';

  constructor(private readonly configService: ConfigService) {}

  private get channelAccessToken(): string {
    return this.configService.get<string>(
      'line.messagingChannelAccessToken',
    );
  }

  async pushMessage(lineUserId: string, message: string): Promise<void> {
    const payload: LinePushPayload = {
      to: lineUserId,
      messages: [{ type: 'text', text: message }],
    };

    try {
      await axios.post(`${this.lineApiBase}/message/push`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.channelAccessToken}`,
        },
      });

      this.logger.log({
        message: 'LINE push message sent',
        lineUserId,
        preview: message.slice(0, 50),
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to send LINE push message',
        lineUserId,
        error: error.response?.data || error.message,
        statusCode: error.response?.status,
      });
      // Do not rethrow — notification failures should not break business flows
    }
  }

  async pushMulticast(lineUserIds: string[], message: string): Promise<void> {
    const payload = {
      to: lineUserIds,
      messages: [{ type: 'text', text: message }],
    };

    try {
      await axios.post(`${this.lineApiBase}/message/multicast`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.channelAccessToken}`,
        },
      });

      this.logger.log({
        message: 'LINE multicast message sent',
        recipients: lineUserIds.length,
        preview: message.slice(0, 50),
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to send LINE multicast',
        error: error.response?.data || error.message,
      });
    }
  }

  buildBookingConfirmationMessage(params: {
    coachNickname: string;
    date: string;
    startTime: string;
    endTime: string;
    serviceTitle: string;
    amount: number;
  }): string {
    return (
      `✅ 預約確認\n\n` +
      `教練: ${params.coachNickname}\n` +
      `服務: ${params.serviceTitle}\n` +
      `日期: ${params.date}\n` +
      `時間: ${params.startTime} - ${params.endTime}\n` +
      `金額: NT$${params.amount}\n\n` +
      `感謝您的預約！`
    );
  }

  buildBookingCancellationMessage(params: {
    coachNickname: string;
    date: string;
    startTime: string;
  }): string {
    return (
      `❌ 預約取消通知\n\n` +
      `您與教練 ${params.coachNickname} 在 ${params.date} ${params.startTime} 的預約已取消。\n\n` +
      `如有疑問請聯繫客服。`
    );
  }

  buildReminderMessage(params: {
    coachNickname: string;
    date: string;
    startTime: string;
    serviceTitle: string;
  }): string {
    return (
      `⏰ 預約提醒\n\n` +
      `您明天有預約！\n` +
      `教練: ${params.coachNickname}\n` +
      `服務: ${params.serviceTitle}\n` +
      `時間: ${params.date} ${params.startTime}\n\n` +
      `請準時出席。`
    );
  }

  buildPaymentSuccessMessage(params: {
    serviceTitle: string;
    amount: number;
    ecpayTradeNo: string;
  }): string {
    return (
      `💳 付款成功\n\n` +
      `服務: ${params.serviceTitle}\n` +
      `金額: NT$${params.amount}\n` +
      `交易編號: ${params.ecpayTradeNo}\n\n` +
      `感謝您的付款！`
    );
  }
}
