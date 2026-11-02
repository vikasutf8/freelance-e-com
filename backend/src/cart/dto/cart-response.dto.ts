import { ApiProperty } from '@nestjs/swagger';

export class CartProductDto {
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
    description: 'Relative product image URL, resolved against the API origin.',
  })
  imageUrl: string | null;

  @ApiProperty({ example: 25 })
  stock: number;
}

export class CartItemResponseDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({
    example: 2499.99,
    description: 'Unit price captured when the item was added.',
  })
  priceAtAdd: number;

  @ApiProperty({ example: 4999.98 })
  subtotal: number;

  @ApiProperty({ type: CartProductDto })
  product: CartProductDto;
}

export class CartResponseDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ type: () => [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ example: 4999.98 })
  total: number;

  @ApiProperty({ example: 2 })
  itemCount: number;
}
