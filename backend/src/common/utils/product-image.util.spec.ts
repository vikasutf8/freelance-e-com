import { BadRequestException } from '@nestjs/common';
import {
  buildProductImageUrl,
  MAX_PRODUCT_IMAGE_BYTES,
  parseProductImageDataUrl,
} from './product-image.util';

const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const JPEG_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';

describe('product image utilities', () => {
  it('parses a valid PNG data URL', () => {
    const image = parseProductImageDataUrl(PNG_DATA_URL);

    expect(image.mimeType).toBe('image/png');
    expect(image.data.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  });

  it('parses a valid JPEG data URL', () => {
    const image = parseProductImageDataUrl(JPEG_DATA_URL);

    expect(image.mimeType).toBe('image/jpeg');
    expect(image.data.subarray(0, 3)).toEqual(
      Buffer.from([0xff, 0xd8, 0xff]),
    );
  });

  it('rejects unsupported image formats', () => {
    expect(() =>
      parseProductImageDataUrl('data:image/gif;base64,R0lGODlhAQAB'),
    ).toThrow(BadRequestException);
  });

  it('rejects images whose bytes do not match the declared format', () => {
    expect(() =>
      parseProductImageDataUrl(`data:image/png;base64,${JPEG_DATA_URL.split(',')[1]}`),
    ).toThrow('Image content does not match');
  });

  it('rejects images above the 2 MB decoded limit', () => {
    const oversized = Buffer.alloc(MAX_PRODUCT_IMAGE_BYTES + 1);
    oversized.set([0xff, 0xd8, 0xff], 0);

    expect(() =>
      parseProductImageDataUrl(
        `data:image/jpeg;base64,${oversized.toString('base64')}`,
      ),
    ).toThrow('Image exceeds the 2 MB limit');
  });

  it('builds a versioned image URL only when an image exists', () => {
    expect(
      buildProductImageUrl({
        id: 4,
        imageMimeType: 'image/jpeg',
        imageUpdatedAt: new Date('2026-11-01T10:00:00.000Z'),
      }),
    ).toBe('/products/4/image?v=1793527200');

    expect(
      buildProductImageUrl({ id: 4, imageMimeType: null }),
    ).toBeNull();
  });
});
