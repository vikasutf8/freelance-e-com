import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PRODUCT_IMAGE_DATA_URL_MAX_LENGTH } from '../../common/utils/product-image.util';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Mechanical Keyboard', maxLength: 255 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 2499.99, minimum: 0.01, maximum: 99999999.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  price: number;

  @ApiPropertyOptional({
    example: 'Hot-swappable keyboard with PBT keycaps.',
    maxLength: 5000,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'Base64 PNG or JPEG data URL. Maximum decoded size is 2 MB. Send null to remove an existing image.',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(PRODUCT_IMAGE_DATA_URL_MAX_LENGTH)
  image?: string | null;

  @ApiProperty({ example: 25, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;
}
