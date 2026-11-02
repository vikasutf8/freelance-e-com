import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkout as checkoutCart } from '../api/cart';
import { getApiErrorMessage } from '../api/errors';
import { CartItem } from '../components/CartItem';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/Loading';
import { UPIScanner } from '../components/UPIScanner';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Payment } from '../types';
import { formatCurrency } from '../utils/format';

export function Cart() {
  const {
    cart,
    isLoading,
    isRefreshing,
    error,
    updateItem,
    removeItem,
    refreshCart,
  } = useCart();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const { addToast } = useToast();

  const handleUpdate = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(itemId);
    try {
      await updateItem(itemId, quantity);
    } catch (updateError) {
      addToast({
        title: 'Could not update your bag',
        message: getApiErrorMessage(updateError),
        tone: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: number, name: string) => {
    setUpdatingId(itemId);
    try {
      await removeItem(itemId);
      addToast({
        title: 'Removed from your bag',
        message: `${name} is no longer in your ritual.`,
        tone: 'info',
      });
    } catch (removeError) {
      addToast({
        title: 'Could not remove this item',
        message: getApiErrorMessage(removeError),
        tone: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const startCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const nextPayment = await checkoutCart();
      setPayment(nextPayment);
    } catch (checkoutError) {
      addToast({
        title: 'Checkout could not be started',
        message: getApiErrorMessage(checkoutError),
        tone: 'error',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePaid = (settledPayment: Payment) => {
    setPayment(settledPayment);
  };

  const closePayment = () => {
    const wasPaid = payment?.status === 'success';
    setPayment(null);

    if (wasPaid) {
      void refreshCart().catch((refreshError: unknown) => {
        addToast({
          title: 'Your bag could not be refreshed',
          message: getApiErrorMessage(refreshError),
          tone: 'error',
        });
      });
    }
  };

  if (isLoading) {
    return (
      <div className="store-container py-16">
        <PageLoader label="Gathering your ritual" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <div className="border-b border-purelis-line bg-purelis-cream/60">
          <div className="store-container py-3 text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
            <Link to="/" className="transition hover:text-purelis-forest">Home</Link>
            <span className="mx-2">/</span>
            <span>Your bag</span>
          </div>
        </div>
        <div className="store-container py-16 md:py-20">
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is quietly waiting"
            message={
              error ??
              'Nothing here yet. Discover a cleanser, a serum, or a complete ritual made for your skin.'
            }
            action={
              <Link to="/#collection" className="btn-purelis">
                Explore the collection
                <ArrowRight size={14} />
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (!cart) return null;

  const itemLabel = cart.itemCount === 1 ? '1 item' : `${cart.itemCount} items`;

  return (
    <div>
      <div className="border-b border-purelis-line bg-purelis-cream/60">
        <div className="store-container py-3 text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
          <Link to="/" className="transition hover:text-purelis-forest">Home</Link>
          <span className="mx-2">/</span>
          <span>Your bag</span>
        </div>
      </div>

      <div className="store-container py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-purelis">Your skin ritual</p>
            <h1 className="mt-3 font-serif text-[34px] font-semibold text-purelis-ink md:text-[42px]">
              Your bag
            </h1>
            <p className="mt-2 text-xs text-purelis-muted">
              {itemLabel} selected
              {isRefreshing ? ' · refreshing' : ''}
            </p>
          </div>
          <Link
            to="/#collection"
            className="inline-flex items-center gap-2 border-b border-purelis-forest/35 pb-1 font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-purelis-forest transition hover:border-purelis-forest"
          >
            <ArrowLeft size={13} />
            Continue shopping
          </Link>
        </div>

        {error ? (
          <div className="mt-6 border border-[#B8674F]/25 bg-[#F7EDE8] px-4 py-3 text-xs text-[#8E4E39]">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          <section aria-label="Cart items">
            <div className="border-t border-purelis-line">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  isUpdating={updatingId === item.id}
                  onUpdate={(quantity) => void handleUpdate(item.id, quantity)}
                  onRemove={() => void handleRemove(item.id, item.product.name)}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-5 border border-purelis-line bg-purelis-cream/50 p-4">
              <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.06em] text-purelis-muted">
                <Truck size={14} className="text-purelis-leaf" />
                Free shipping over ₹499
              </span>
              <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.06em] text-purelis-muted">
                <ShieldCheck size={14} className="text-purelis-leaf" />
                Secure UPI checkout
              </span>
              <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.06em] text-purelis-muted">
                <Sparkles size={14} className="text-purelis-leaf" />
                Cruelty-free always
              </span>
            </div>
          </section>

          <aside className="border border-purelis-line bg-purelis-cream/65 p-6 lg:sticky lg:top-28">
            <p className="font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-purelis-leaf">
              Order summary
            </p>
            <h2 className="mt-2 font-serif text-2xl text-purelis-ink">
              Almost yours.
            </h2>

            <dl className="mt-6 space-y-3.5 border-b border-purelis-line pb-5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-purelis-muted">Subtotal ({itemLabel})</dt>
                <dd className="font-medium text-purelis-ink">{formatCurrency(cart.total)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-purelis-muted">Shipping</dt>
                <dd className="font-medium text-purelis-forest">Complimentary</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-purelis-muted">Taxes</dt>
                <dd className="font-medium text-purelis-ink">Included</dd>
              </div>
            </dl>

            <div className="flex items-end justify-between gap-4 py-5">
              <div>
                <p className="font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-purelis-ink">
                  Total
                </p>
                <p className="mt-1 text-[9px] text-purelis-muted">Inclusive of all taxes</p>
              </div>
              <p className="font-serif text-2xl font-semibold text-purelis-forest">
                {formatCurrency(cart.total)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={isCheckingOut || cart.items.length === 0}
              className="btn-purelis w-full"
            >
              {isCheckingOut ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <QrCode size={15} />
              )}
              {isCheckingOut ? 'Preparing checkout' : 'Pay with UPI'}
            </button>

            <p className="mt-3 text-center text-[9px] leading-5 text-purelis-muted">
              A UPI QR code will be generated. Scan, pay, and your ritual is on
              its way.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 border-t border-purelis-line pt-4 text-[8.5px] uppercase tracking-[0.08em] text-purelis-muted">
              <ShieldCheck size={13} className="text-purelis-leaf" />
              100% secure demo checkout
            </div>
          </aside>
        </div>
      </div>

      <UPIScanner
        payment={payment}
        onClose={closePayment}
        onPaid={handlePaid}
      />
    </div>
  );
}
