import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 4, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cartId: number;

  @ApiPropertyOptional({
    example: 'yourupi@bank',
    description:
      'UPI ID used for the mock payment. Defaults to the existing payment UPI ID or the UPI_ID environment variable.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[\w.-]+@[\w.-]+$/, {
    message: 'upiId must look like name@bank',
  })
  upiId?: string;
}
