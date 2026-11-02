import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode } from '../payment-mode';

export class PaymentConfigResponseDto {
  @ApiProperty({ example: 'yourupi@bank' })
  upiId: string;

  @ApiProperty({ example: 'Purelis' })
  payeeName: string;

  @ApiProperty({ example: 'Order payment' })
  note: string;

  @ApiProperty({ enum: ['mock', 'manual'], example: 'manual' })
  mode: PaymentMode;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '/payments/config/qr?v=1767225600000',
    description:
      'Uploaded payment QR image. When present, the storefront shows this image instead of the generated UPI QR.',
  })
  qrImageUrl: string | null;
}
