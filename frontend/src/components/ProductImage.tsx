import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../utils/media';
import { cn } from '../utils/cn';
import { ProductArtwork } from './ProductArtwork';

interface ProductImageProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  decorative?: boolean;
}

export function ProductImage({
  name,
  imageUrl,
  className,
  decorative = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const source = resolveMediaUrl(imageUrl);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  if (!source || failed) {
    return (
      <ProductArtwork
        name={name}
        decorative={decorative}
        className={className}
      />
    );
  }

  return (
    <img
      src={source}
      alt={decorative ? '' : name}
      aria-hidden={decorative || undefined}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
