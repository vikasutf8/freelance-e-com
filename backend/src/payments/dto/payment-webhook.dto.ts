import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class PaymentWebhookDto {
  @ApiProperty({ example: 7, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  paymentId: number;

  @ApiProperty({
    enum: [PaymentStatus.SUCCESS, PaymentStatus.FAILED],
    example: PaymentStatus.SUCCESS,
  })
  @IsIn([PaymentStatus.SUCCESS, PaymentStatus.FAILED])
  status: PaymentStatus.SUCCESS | PaymentStatus.FAILED;

  @ApiPropertyOptional({
    example: 'pay_RZP_9f2c1',
    description: 'Provider-side transaction reference.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerReference?: string;

  @ApiPropertyOptional({
    description:
      'Provider signature. Not verified in mock mode; real providers must be configured before go-live.',
  })
  @IsOptional()
  @IsString()
  signature?: string;
}
