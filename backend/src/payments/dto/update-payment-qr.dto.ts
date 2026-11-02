import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { PRODUCT_IMAGE_DATA_URL_MAX_LENGTH } from '../../common/utils/product-image.util';

export class UpdatePaymentQrDto {
  @ApiProperty({
    description:
      'Base64 PNG or JPEG data URL of the payment QR image. Maximum decoded size is 2 MB.',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
  })
  @IsString()
  @MaxLength(PRODUCT_IMAGE_DATA_URL_MAX_LENGTH)
  image: string;
}
