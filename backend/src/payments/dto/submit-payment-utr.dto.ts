import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class SubmitPaymentUtrDto {
  @ApiProperty({
    example: '123456789012',
    description:
      '12-digit UPI reference number (UTR/RRN) shown in the customer UPI app after a successful payment.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Matches(/^\d{12}$/, {
    message: 'UTR must be the 12-digit reference from your UPI app',
  })
  utr: string;
}
