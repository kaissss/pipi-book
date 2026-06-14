import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EcpayWebhookDto {
  @ApiProperty() @IsString() MerchantID: string;
  @ApiProperty() @IsString() MerchantTradeNo: string;
  @ApiProperty() @IsString() StoreID: string;
  @ApiProperty() @IsString() RtnCode: string;
  @ApiProperty() @IsString() RtnMsg: string;
  @ApiProperty() @IsString() TradeNo: string;
  @ApiProperty() @IsString() TradeAmt: string;
  @ApiProperty() @IsString() PaymentDate: string;
  @ApiProperty() @IsString() PaymentType: string;
  @ApiProperty() @IsString() PaymentTypeChargeFee: string;
  @ApiProperty() @IsString() TradeDate: string;
  @ApiProperty() @IsString() SimulatePaid: string;
  @ApiProperty() @IsString() CheckMacValue: string;
}
