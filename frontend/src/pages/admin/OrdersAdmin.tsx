import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  PackageSearch,
  ReceiptText,
  RefreshCw,
  Search,
  SearchX,
} from 'lucide-react';
import { getApiErrorMessage } from '../../api/errors';
import { listOrders } from '../../api/orders';
import { AdminPageHeader } from '../../components/AdminUI';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import type { Order, PaginatedOrders } from '../../types';
import { cn } from '../../utils/cn';
import {
  formatCurrency,
  formatDateTime,
  formatOrderNumber,
  pluralize,
} from '../../utils/format';

const PAGE_SIZE = 10;

export function OrdersAdmin() {
  const [result, setResult] = useState<PaginatedOrders | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    listOrders({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
    })
      .then((response) => {
        if (active) setResult(response);
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
  }, [page, search, reloadKey]);

  const totalPages = result?.meta.totalPages ?? 0;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Orders"
        title="Order history"
        description="Every completed UPI order, with the customer and a permanent snapshot of what was bought."
        action={
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={isLoading}
            className="btn-calm-secondary"
          >
            <RefreshCw
              size={14}
              className={cn(isLoading && 'animate-spin')}
            />
            Refresh
          </button>
        }
      />

      <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <div className="rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
          <p className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-muted">
            Matching orders
          </p>
          <p className="mt-3 font-serif text-3xl text-calm-ink">
            {result?.meta.total ?? '—'}
          </p>
          <p className="mt-1 text-[10px] text-calm-muted">
            {search ? 'Across all pages' : 'Complete order history'}
          </p>
        </div>
        <div className="rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
          <p className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-muted">
            On this page
          </p>
          <p className="mt-3 font-serif text-3xl text-calm-ink">
            {result?.data.length ?? '—'}
          </p>
          <p className="mt-1 text-[10px] text-calm-muted">
            {totalPages > 1 ? `Page ${page} of ${totalPages}` : 'A single page'}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-white/60 bg-calm-ivory shadow-card">
        <div className="flex flex-col gap-3 border-b border-calm-sand/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-calm-ink">
              The ledger
            </p>
            <p className="mt-1 text-[10px] text-calm-muted">
              Search by customer email, order ID or product name
            </p>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-full border border-calm-sand/60 bg-white/75 px-4 sm:w-72">
            <Search size={14} className="shrink-0 text-calm-muted" />
            <span className="sr-only">Search orders</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Order, customer or product"
              className="min-w-0 flex-1 bg-transparent text-xs text-calm-ink outline-none"
            />
          </label>
        </div>

        {isLoading && !result ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-2.5 w-1/5" />
                </div>
                <div className="skeleton h-3 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={AlertTriangle}
              title="Could not load orders"
              message={error}
              action={
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="btn-calm"
                >
                  Try again
                </button>
              }
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : result && result.data.length === 0 ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={search ? SearchX : ReceiptText}
              title={search ? 'No orders match' : 'No orders yet'}
              message={
                search
                  ? 'Try a different customer email, order ID or product name.'
                  : 'Completed UPI checkouts will appear here with an immutable item snapshot.'
              }
              action={
                search ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="btn-calm-secondary"
                  >
                    Clear search
                  </button>
                ) : undefined
              }
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : result ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-calm-sand/35 text-[8px] uppercase tracking-[0.14em] text-calm-muted">
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Placed</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-calm-sand/25">
                  {result.data.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-white/45"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-calm-ink">
                          #{formatOrderNumber(order.id)}
                        </p>
                        <p className="mt-0.5 font-mono text-[8.5px] text-calm-muted">
                          Payment {formatOrderNumber(order.paymentId)}
                        </p>
                      </td>
                      <td className="max-w-[220px] px-4 py-3.5">
                        <p className="truncate text-[11px] text-calm-body">
                          {order.customerEmail ?? 'Removed account'}
                        </p>
                        <p className="mt-0.5 text-[8.5px] text-calm-muted">
                          User #{order.userId}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-[10px] text-calm-body">
                        {pluralize(order.itemCount, 'item')}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-calm-ink">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3.5 text-[10px] text-calm-muted">
                        <time dateTime={order.createdAt}>
                          {formatDateTime(order.createdAt)}
                        </time>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-calm-mist px-2.5 py-1 font-display text-[7.5px] font-semibold uppercase tracking-[0.1em] text-calm-sage">
                          <Check size={9} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            aria-label={`View items in order ${formatOrderNumber(order.id)}`}
                            className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[8px] font-medium text-calm-muted transition hover:bg-white hover:text-calm-ink"
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <nav
                className="flex items-center justify-between gap-4 border-t border-calm-sand/35 px-5 py-4"
                aria-label="Order pages"
              >
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || isLoading}
                  className="btn-calm-secondary !h-10 !px-5"
                >
                  <ArrowLeft size={13} />
                  Previous
                </button>
                <span className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || isLoading}
                  className="btn-calm-secondary !h-10 !px-5"
                >
                  Next
                  <ArrowRight size={13} />
                </button>
              </nav>
            ) : null}
          </>
        ) : null}
      </section>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder
            ? `Order #${formatOrderNumber(selectedOrder.id)}`
            : 'Order'
        }
        description={
          selectedOrder
            ? `${selectedOrder.customerEmail ?? 'Removed account'} · ${formatDateTime(selectedOrder.createdAt)}`
            : undefined
        }
        size="md"
        tone="calm"
      >
        {selectedOrder ? (
          <div>
            <ul className="divide-y divide-calm-sand/35">
              {selectedOrder.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-medium text-calm-ink">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[10px] text-calm-muted">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                      {item.productId
                        ? ` · Product #${item.productId}`
                        : ' · Product removed'}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-medium text-calm-ink">
                    {formatCurrency(item.subtotal)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-calm-sand/45 pt-4">
              <div>
                <p className="font-display text-[8px] font-semibold uppercase tracking-[0.16em] text-calm-muted">
                  Paid total
                </p>
                <p className="mt-1 text-[10px] text-calm-muted">
                  {pluralize(selectedOrder.itemCount, 'item')} · UPI
                </p>
              </div>
              <p className="font-serif text-2xl text-calm-ink">
                {formatCurrency(selectedOrder.total)}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-calm-mist/70 px-4 py-3 text-[10px] leading-5 text-calm-body">
              <PackageSearch size={14} className="shrink-0 text-calm-sage" />
              Item names and prices are saved at payment time, so this history
              remains accurate even if the catalog changes later.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
