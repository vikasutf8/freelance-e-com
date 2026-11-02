import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Leaf,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errors';
import { getProduct, listProducts } from '../api/products';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/Loading';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { getProductCategory } from '../utils/product';

const accordionItems = [
  {
    title: 'Key ingredients',
    content:
      'Botanical extracts and skin-kind actives selected for daily use. Free from parabens, sulphates and unnecessary fillers.',
  },
  {
    title: 'How to use',
    content:
      'Apply to clean skin as part of your morning or evening ritual. Use gentle, upward motions and follow with your favourite moisturizer.',
  },
  {
    title: 'Shipping & returns',
    content:
      'Free shipping on orders over ₹499. Easy 14-day returns on unopened products. Every order is packed in recyclable materials.',
  },
];

function ProductAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-purelis-line">
      {accordionItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.title} className="border-b border-purelis-line">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-purelis-ink">
                {item.title}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  'shrink-0 text-purelis-leaf transition duration-300',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all duration-300',
                isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-lg text-xs leading-6 text-purelis-muted">
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId < 1) {
      setError('This product could not be found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuantity(1);

    getProduct(productId)
      .then((nextProduct) => {
        if (!active) return;
        setProduct(nextProduct);
        return listProducts(1, 100).then((response) => {
          if (!active) return;
          const category = getProductCategory(nextProduct.name);
          setRelated(
            response.data
              .filter(
                (item) =>
                  item.id !== nextProduct.id &&
                  getProductCategory(item.name) === category,
              )
              .slice(0, 4),
          );
        });
      })
      .catch((loadError: unknown) => {
        if (active) setError(getApiErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const requireUser = () => {
    addToast({
      title: 'Sign in to add to your bag',
      message: 'Your selected ritual will be waiting in your account.',
      tone: 'info',
    });
    navigate('/login', {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const addToBag = async (goToCart = false) => {
    if (!product) return;
    if (!user) {
      requireUser();
      return;
    }

    if (goToCart) setIsBuying(true);
    else setIsAdding(true);

    try {
      await addItem(product.id, quantity);
      addToast({
        title: 'Added to your bag',
        message: `${quantity} × ${product.name} is ready when you are.`,
        tone: 'success',
      });
      if (goToCart) navigate('/cart');
    } catch (addError) {
      addToast({
        title: 'Could not add this item',
        message: getApiErrorMessage(addError),
        tone: 'error',
      });
    } finally {
      setIsAdding(false);
      setIsBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="store-container py-16">
        <PageLoader label="Unveiling your ritual" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="store-container py-16">
        <EmptyState
          icon={Package}
          title="This product has moved on"
          message={error ?? 'The product you are looking for is no longer available.'}
          action={
            <Link to="/" className="btn-purelis">
              Return to the collection
            </Link>
          }
        />
      </div>
    );
  }

  const category = getProductCategory(product.name);
  const inStock = product.stock > 0;

  return (
    <div>
      <div className="border-b border-purelis-line bg-purelis-cream/60">
        <div className="store-container flex items-center gap-2 overflow-x-auto py-3 text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
          <Link to="/" className="transition hover:text-purelis-forest">Home</Link>
          <span>/</span>
          <Link to="/#collection" className="transition hover:text-purelis-forest">Shop</Link>
          <span>/</span>
          <span>{category}</span>
          <span>/</span>
          <span className="whitespace-nowrap font-medium text-purelis-ink">{product.name}</span>
        </div>
      </div>

      <section className="store-container grid gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-16">
        <div>
          <div className="relative overflow-hidden border border-purelis-line bg-purelis-sage-soft">
            <ProductImage
              name={product.name}
              imageUrl={product.imageUrl}
              className="aspect-square"
            />
            <div className="absolute left-4 top-4 bg-white/90 px-3 py-1.5 font-display text-[8px] font-semibold uppercase tracking-[0.12em] text-purelis-forest backdrop-blur-sm">
              {category}
            </div>
            {inStock ? (
              <div className="absolute right-4 top-4 flex items-center gap-2 bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-purelis-leaf" />
                <span className="font-display text-[8px] font-semibold uppercase tracking-[0.1em] text-purelis-forest">
                  In stock
                </span>
              </div>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-3 divide-x divide-purelis-line border border-purelis-line bg-white">
            {[
              { icon: Leaf, label: 'Vegan formula' },
              { icon: ShieldCheck, label: 'Dermatologist tested' },
              { icon: Package, label: 'Recyclable pack' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 px-3 py-4 text-center">
                <Icon size={18} strokeWidth={1.4} className="text-purelis-leaf" />
                <span className="font-display text-[7.5px] font-semibold uppercase tracking-[0.08em] text-purelis-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:py-2">
          <Link
            to="/#collection"
            className="inline-flex items-center gap-2 self-start font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-purelis-muted transition hover:text-purelis-forest"
          >
            <ArrowLeft size={13} />
            Back to the collection
          </Link>

          <p className="eyebrow-purelis mt-7">{category}</p>
          <h1 className="mt-3 max-w-xl font-serif text-[34px] leading-[1.15] text-purelis-ink sm:text-[42px]">
            {product.name}
          </h1>
          <p className="mt-4 font-serif text-2xl font-semibold text-purelis-forest">
            {formatCurrency(product.price)}
          </p>

          <p className="mt-5 max-w-xl text-sm leading-7 text-purelis-muted">
            {product.description ||
              'A considered everyday essential, formulated to support your skin gently and beautifully.'}
          </p>

          <div className="mt-7 border-t border-purelis-line pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-purelis-ink">
                  Quantity
                </p>
                <p className="mt-1 text-[11px] text-purelis-muted">
                  {inStock ? `${product.stock} available` : 'Currently sold out'}
                </p>
              </div>
              <div className="flex h-11 items-center border border-purelis-line bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="grid h-full w-11 place-items-center text-purelis-ink transition hover:bg-purelis-cream disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>
                <span className="grid h-full w-11 place-items-center border-x border-purelis-line text-xs font-medium" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="grid h-full w-11 place-items-center text-purelis-ink transition hover:bg-purelis-cream disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void addToBag(false)}
                disabled={!inStock || isAdding || isBuying}
                className="btn-purelis"
              >
                {isAdding ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                {isAdding ? 'Adding' : 'Add to cart'}
              </button>
              <button
                type="button"
                onClick={() => void addToBag(true)}
                disabled={!inStock || isAdding || isBuying}
                className="btn-purelis-light"
              >
                {isBuying ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {isBuying ? 'Preparing' : 'Buy now'}
              </button>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, title: 'Free shipping', text: 'Orders over ₹499' },
              { icon: RotateCcw, title: 'Easy returns', text: 'Within 14 days' },
              { icon: ShieldCheck, title: 'Secure UPI', text: 'Safe checkout' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-purelis-line bg-purelis-cream/55 p-3">
                <Icon size={16} strokeWidth={1.4} className="text-purelis-leaf" />
                <p className="mt-2 font-display text-[8px] font-semibold uppercase tracking-[0.07em] text-purelis-ink">
                  {title}
                </p>
                <p className="mt-1 text-[9px] text-purelis-muted">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <ProductAccordion />
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-purelis-line bg-[#FCFCF7] py-14 md:py-16">
          <div className="store-container">
            <div className="text-center">
              <p className="eyebrow-purelis">Complete the ritual</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold uppercase tracking-[0.04em] text-purelis-ink md:text-[28px]">
                You may also love
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
