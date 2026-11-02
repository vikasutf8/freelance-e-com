import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode } from '../payment-mode';
import { PaymentStatus } from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 4 })
  cartId: number;

  @ApiProperty({ example: 'yourupi@bank' })
  upiId: string;

  @ApiProperty({ example: 4999.98 })
  amount: number;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: 'upi://pay?pa=yourupi@bank&am=4999.98&cu=INR',
    description: 'UPI deep link. The frontend renders it as a QR code.',
  })
  upiLink: string;

  @ApiProperty({
    type: String,
    example: '123456789012',
    nullable: true,
    description:
      '12-digit UPI reference submitted by the customer after paying.',
  })
  utr: string | null;

  @ApiProperty({
    type: String,
    example: 'UTR not found in the store bank statement.',
    nullable: true,
    description: 'Reason shown to the customer when a payment is rejected.',
  })
  failureReason: string | null;

  @ApiProperty({
    type: String,
    example: '2026-01-15T10:35:00.000Z',
    nullable: true,
    description: 'When an admin confirmed or rejected the payment.',
  })
  reviewedAt: Date | null;

  @ApiProperty({
    enum: ['mock', 'manual'],
    example: 'manual',
    description:
      'mock settles immediately with a developer button; manual waits for admin verification of the submitted UTR.',
  })
  mode: PaymentMode;
}
