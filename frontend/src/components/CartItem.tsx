import { LoaderCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CartItem as CartItemType } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { ProductImage } from './ProductImage';

export function CartItem({
  item,
  onUpdate,
  onRemove,
  isUpdating = false,
}: {
  item: CartItemType;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}) {
  const canIncrease = item.quantity < item.product.stock;
  const canDecrease = item.quantity > 1;

  return (
    <article
      className={cn(
        'grid grid-cols-[92px_1fr] gap-4 border-b border-purelis-line py-6 transition sm:grid-cols-[124px_1fr] sm:gap-6',
        isUpdating && 'opacity-65',
      )}
    >
      <Link
        to={`/products/${item.productId}`}
        className="aspect-square overflow-hidden bg-purelis-sage-soft"
        aria-label={`View ${item.product.name}`}
      >
        <ProductImage
          name={item.product.name}
          imageUrl={item.product.imageUrl}
          decorative
        />
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/products/${item.productId}`}
              className="line-clamp-2 text-sm font-medium leading-5 text-purelis-ink hover:text-purelis-forest sm:text-[15px]"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-xs text-purelis-muted">
              {formatCurrency(item.priceAtAdd)} each
            </p>
            {item.product.stock <= 5 ? (
              <p className="mt-1.5 font-display text-[8px] uppercase tracking-[0.08em] text-purelis-leaf">
                Only {item.product.stock} left
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={isUpdating}
            aria-label={`Remove ${item.product.name} from cart`}
            className="grid h-8 w-8 shrink-0 place-items-center text-purelis-muted transition hover:bg-purelis-cream hover:text-purelis-forest disabled:opacity-40"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex h-9 items-center border border-purelis-line">
            <button
              type="button"
              onClick={() => onUpdate(item.quantity - 1)}
              disabled={!canDecrease || isUpdating}
              aria-label={`Decrease quantity of ${item.product.name}`}
              className="grid h-full w-9 place-items-center text-purelis-ink transition hover:bg-purelis-cream disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={13} />
            </button>
            <span
              className="grid h-full w-9 place-items-center border-x border-purelis-line text-xs font-medium"
              aria-live="polite"
            >
              {isUpdating ? (
                <LoaderCircle size={13} className="animate-spin text-purelis-leaf" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              type="button"
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={!canIncrease || isUpdating}
              aria-label={`Increase quantity of ${item.product.name}`}
              className="grid h-full w-9 place-items-center text-purelis-ink transition hover:bg-purelis-cream disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={13} />
            </button>
          </div>
          <p className="text-sm font-semibold text-purelis-ink">
            {formatCurrency(item.subtotal)}
          </p>
        </div>
      </div>
    </article>
  );
}
