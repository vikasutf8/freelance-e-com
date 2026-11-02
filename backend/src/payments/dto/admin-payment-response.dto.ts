import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { PaymentResponseDto } from './payment-response.dto';

export class AdminPaymentResponseDto extends PaymentResponseDto {
  @ApiProperty({ example: 2 })
  userId: number;

  @ApiProperty({
    type: String,
    example: 'member@example.com',
    nullable: true,
  })
  customerEmail: string | null;

  @ApiProperty({ example: 2 })
  itemCount: number;
}

export class PaginatedPaymentsResponseDto {
  @ApiProperty({ type: () => [AdminPaymentResponseDto] })
  data: AdminPaymentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
