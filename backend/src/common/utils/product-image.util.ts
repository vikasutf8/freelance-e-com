import { BadRequestException } from '@nestjs/common';

export const MAX_PRODUCT_IMAGE_BYTES = 2 * 1024 * 1024;
export const PRODUCT_IMAGE_DATA_URL_MAX_LENGTH = 2_800_000;

const DATA_URL_PATTERN =
  /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/;

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

export interface ParsedProductImage {
  data: Buffer;
  mimeType: 'image/png' | 'image/jpeg';
}

export function parseProductImageDataUrl(value: string): ParsedProductImage {
  const match = DATA_URL_PATTERN.exec(value);

  if (!match) {
    throw new BadRequestException(
      'Image must be a base64 PNG or JPEG data URL',
    );
  }

  const format = match[1];
  const data = Buffer.from(match[2], 'base64');

  if (data.length === 0) {
    throw new BadRequestException('Image file is empty');
  }

  if (data.length > MAX_PRODUCT_IMAGE_BYTES) {
    throw new BadRequestException('Image exceeds the 2 MB limit');
  }

  const isPng = format === 'png';
  const hasValidSignature = isPng
    ? data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
    : data.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE);

  if (!hasValidSignature) {
    throw new BadRequestException(
      'Image content does not match its declared PNG/JPEG type',
    );
  }

  return {
    data,
    mimeType: isPng ? 'image/png' : 'image/jpeg',
  };
}

export function buildProductImageUrl(product: {
  id: number;
  imageMimeType?: string | null;
  imageUpdatedAt?: Date | null;
}): string | null {
  if (!product.imageMimeType) return null;

  const version = product.imageUpdatedAt
    ? Math.floor(product.imageUpdatedAt.getTime() / 1000)
    : 0;

  return `/products/${product.id}/image?v=${version}`;
}
