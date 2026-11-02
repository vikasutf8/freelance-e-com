import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Mechanical Keyboard' })
  name: string;

  @ApiProperty({ example: 2499.99 })
  price: number;

  @ApiProperty({
    type: String,
    example: 'Hot-swappable keyboard with PBT keycaps.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    type: String,
    example: '/products/1/image?v=1762000000',
    nullable: true,
    description:
      'Relative URL for the uploaded image. Resolve it against the API origin. Null when the product uses generated artwork.',
  })
  imageUrl: string | null;

  @ApiProperty({ example: 25 })
  stock: number;

  @ApiProperty({ type: Number, example: 1, nullable: true })
  createdBy: number | null;
}
