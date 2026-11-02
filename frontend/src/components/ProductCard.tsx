import { useState } from 'react';
import { LoaderCircle, Plus, ShoppingBag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { getProductCategory } from '../utils/product';
import { ProductImage } from './ProductImage';

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isOutOfStock = product.stock <= 0;

  const handleAdd = async () => {
    if (isOutOfStock || isAdding) return;
    if (!user) {
      addToast({
        title: 'Sign in to start your bag',
        message: 'Your chosen ritual will be saved to your account.',
        tone: 'info',
      });
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      addToast({
        title: 'Added to your bag',
        message: `${product.name} is ready when you are.`,
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Could not add this item',
        message: getApiErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article
      className={cn(
        'group flex flex-col border border-purelis-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(27,42,22,0.08)]',
        className,
      )}
    >
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-purelis-sage-soft"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          name={product.name}
          imageUrl={product.imageUrl}
          decorative
          className="h-full w-full transition duration-700 ease-out group-hover:scale-[1.035]"
        />
        <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 font-display text-[8px] font-semibold uppercase tracking-[0.12em] text-purelis-forest backdrop-blur-sm">
          {getProductCategory(product.name)}
        </span>
        {isOutOfStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-purelis-ink/80 py-2 text-center font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
            Sold out
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute right-3 top-3 bg-purelis-cream/95 px-2.5 py-1 font-display text-[8px] font-medium uppercase tracking-[0.08em] text-purelis-forest">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 text-center">
        <Link
          to={`/products/${product.id}`}
          className="line-clamp-2 text-[13px] font-medium leading-5 text-purelis-ink transition hover:text-purelis-forest"
        >
          {product.name}
        </Link>
        <p className="mt-1.5 text-sm font-semibold tracking-wide text-purelis-ink">
          {formatCurrency(product.price)}
        </p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || isAdding}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-purelis-forest bg-purelis-forest px-4 py-2.5 font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-purelis-forest-deep disabled:cursor-not-allowed disabled:border-purelis-line disabled:bg-purelis-cream disabled:text-purelis-muted"
        >
          {isAdding ? (
            <LoaderCircle size={13} className="animate-spin" />
          ) : isOutOfStock ? (
            <ShoppingBag size={13} />
          ) : (
            <Plus size={13} />
          )}
          {isAdding ? 'Adding' : isOutOfStock ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
