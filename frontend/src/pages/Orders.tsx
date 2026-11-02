import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errors';
import { listOrders } from '../api/orders';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/Loading';
import { ProductArtwork } from '../components/ProductArtwork';
import type { Order, PaginatedOrders } from '../types';
import { cn } from '../utils/cn';
import {
  formatCurrency,
  formatDateTime,
  formatOrderNumber,
  pluralize,
} from '../utils/format';

const PAGE_SIZE = 6;

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="overflow-hidden border border-purelis-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-purelis-line bg-purelis-cream/55 px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl text-purelis-ink">
              Order #{formatOrderNumber(order.id)}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purelis-sage-soft px-2.5 py-1 font-display text-[7.5px] font-semibold uppercase tracking-[0.12em] text-purelis-forest">
              <Check size={9} />
              {order.status}
            </span>
          </div>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.06em] text-purelis-muted">
            <time dateTime={order.createdAt}>
              {formatDateTime(order.createdAt)}
            </time>
            <span className="mx-2">·</span>
            {pluralize(order.itemCount, 'item')}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-purelis-muted">
            Order total
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-purelis-forest">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-purelis-line/70">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 px-5 py-4"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden border border-purelis-line bg-purelis-sage-soft">
              <ProductArtwork
                name={item.productName}
                decorative
                className="h-full w-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              {item.productId ? (
                <Link
                  to={`/products/${item.productId}`}
                  className="line-clamp-2 text-[13px] font-medium text-purelis-ink transition hover:text-purelis-forest"
                >
                  {item.productName}
                </Link>
              ) : (
                <p className="line-clamp-2 text-[13px] font-medium text-purelis-ink">
                  {item.productName}
                </p>
              )}
              <p className="mt-1 text-[10px] text-purelis-muted">
                {formatCurrency(item.unitPrice)} × {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-xs font-medium text-purelis-ink">
              {formatCurrency(item.subtotal)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-purelis-line bg-purelis-cream/35 px-5 py-3">
        <p className="text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
          Paid via UPI
          <span className="mx-2">·</span>
          Reference {formatOrderNumber(order.paymentId)}
        </p>
        <p className="text-[9px] uppercase tracking-[0.08em] text-purelis-forest">
          {order.customerEmail}
        </p>
      </div>
    </article>
  );
}

export function Orders() {
  const [result, setResult] = useState<PaginatedOrders | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listOrders({ page, limit: PAGE_SIZE });
      setResult(response);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="border-b border-purelis-line bg-purelis-cream/60">
        <div className="store-container py-3 text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
          <Link to="/" className="transition hover:text-purelis-forest">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Order history</span>
        </div>
      </div>

      <div className="store-container py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow-purelis">Your account</p>
            <h1 className="mt-3 font-serif text-[34px] font-semibold text-purelis-ink md:text-[42px]">
              Order history
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-purelis-muted">
              Every ritual you have brought home, kept together in one calm
              place.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => void loadOrders()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 border-b border-purelis-forest/35 pb-1 font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-purelis-forest transition hover:border-purelis-forest disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={cn(isLoading && 'animate-spin')}
              />
              Refresh
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 border-b border-purelis-forest/35 pb-1 font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-purelis-forest transition hover:border-purelis-forest"
            >
              <ShoppingBag size={12} />
              Your bag
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {isLoading && !result ? (
            <div className="py-16">
              <PageLoader label="Gathering your orders" />
            </div>
          ) : error ? (
            <EmptyState
              icon={AlertTriangle}
              title="Could not load your orders"
              message={error}
              action={
                <button
                  type="button"
                  onClick={() => void loadOrders()}
                  className="btn-purelis"
                >
                  Try again
                </button>
              }
            />
          ) : result && result.data.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Your order history is still unwritten"
              message="When you complete a UPI checkout, your order and its details will be kept here."
              action={
                <Link to="/#collection" className="btn-purelis">
                  Explore the collection
                  <ArrowRight size={14} />
                </Link>
              }
            />
          ) : result ? (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-purelis-line pb-3">
                <p className="font-display text-[9px] font-semibold uppercase tracking-[0.14em] text-purelis-leaf">
                  {pluralize(result.meta.total, 'order')}
                </p>
                {result.meta.totalPages > 1 ? (
                  <p className="text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
                    Page {result.meta.page} of {result.meta.totalPages}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 space-y-5">
                {result.data.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>

              {result.meta.totalPages > 1 ? (
                <nav
                  className="mt-8 flex items-center justify-between gap-4 border-t border-purelis-line pt-5"
                  aria-label="Order history pages"
                >
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1 || isLoading}
                    className="inline-flex items-center gap-2 border border-purelis-line px-4 py-2.5 font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-purelis-ink transition hover:border-purelis-forest hover:text-purelis-forest disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ArrowLeft size={12} />
                    Previous
                  </button>
                  <span className="flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.1em] text-purelis-muted">
                    <PackageCheck size={13} className="text-purelis-leaf" />
                    {result.meta.page} / {result.meta.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page >= result.meta.totalPages || isLoading}
                    className="inline-flex items-center gap-2 border border-purelis-line px-4 py-2.5 font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-purelis-ink transition hover:border-purelis-forest hover:text-purelis-forest disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Next
                    <ArrowRight size={12} />
                  </button>
                </nav>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
