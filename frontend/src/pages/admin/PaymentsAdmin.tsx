import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  QrCode,
  RefreshCw,
  Search,
  SearchX,
  ShieldCheck,
  Trash2,
  Upload,
  Wallet,
  XCircle,
} from 'lucide-react';
import { getApiErrorMessage } from '../../api/errors';
import {
  confirmPayment,
  getPaymentConfig,
  listPayments,
  rejectPayment,
  removePaymentQr,
  uploadPaymentQr,
} from '../../api/payments';
import { AdminPageHeader, ConfirmDialog } from '../../components/AdminUI';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import type {
  AdminPayment,
  PaginatedPayments,
  PaymentConfig,
  PaymentStatus,
} from '../../types';
import { cn } from '../../utils/cn';
import {
  formatCurrency,
  formatDateTime,
  formatOrderNumber,
} from '../../utils/format';
import { resolveMediaUrl } from '../../utils/media';

const PAGE_SIZE = 10;
const QR_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Could not read the image'));
    reader.readAsDataURL(file);
  });
}

type StatusFilter = PaymentStatus | 'all';

const filters: Array<{ label: string; value: StatusFilter }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'success' },
  { label: 'Rejected', value: 'failed' },
];

function statusBadge(status: PaymentStatus) {
  if (status === 'success') {
    return {
      label: 'Confirmed',
      className: 'bg-calm-mist text-calm-sage',
      icon: Check,
    };
  }
  if (status === 'failed') {
    return {
      label: 'Rejected',
      className: 'bg-[#F5E9E4] text-[#9B6049]',
      icon: XCircle,
    };
  }
  return {
    label: 'Pending',
    className: 'bg-[#F5EFE2] text-[#8B7045]',
    icon: Clock,
  };
}

export function PaymentsAdmin() {
  const [result, setResult] = useState<PaginatedPayments | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminPayment | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminPayment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [isQrBusy, setIsQrBusy] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;

    getPaymentConfig()
      .then((config) => {
        if (active) setPaymentConfig(config);
      })
      .catch(() => {
        // Payments still work; the generated UPI QR is the fallback.
      });

    return () => {
      active = false;
    };
  }, []);

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

    listPayments({
      page,
      limit: PAGE_SIZE,
      status: filter === 'all' ? undefined : filter,
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
  }, [page, filter, search, reloadKey]);

  const totalPages = result?.meta.totalPages ?? 0;
  const awaitingUtr =
    result?.data.filter((payment) => payment.status === 'pending' && !payment.utr)
      .length ?? 0;
  const qrImageUrl = resolveMediaUrl(paymentConfig?.qrImageUrl);

  const handleConfirm = async () => {
    if (!confirmTarget || isBusy) return;
    setIsBusy(true);
    try {
      await confirmPayment(confirmTarget.id);
      addToast({
        title: 'Payment confirmed',
        message: `Order created for ${formatCurrency(confirmTarget.amount)}.`,
        tone: 'success',
      });
      setConfirmTarget(null);
      setReloadKey((key) => key + 1);
    } catch (confirmError) {
      addToast({
        title: 'Could not confirm payment',
        message: getApiErrorMessage(confirmError),
        tone: 'error',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleQrFile = async (file: File | undefined) => {
    if (!file || isQrBusy) return;

    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      addToast({
        title: 'Unsupported image',
        message: 'Upload a PNG or JPEG screenshot of the payment QR.',
        tone: 'error',
      });
      if (qrFileInputRef.current) qrFileInputRef.current.value = '';
      return;
    }

    if (file.size > QR_IMAGE_MAX_BYTES) {
      addToast({
        title: 'Image is too large',
        message: 'Use an image smaller than 2 MB.',
        tone: 'error',
      });
      if (qrFileInputRef.current) qrFileInputRef.current.value = '';
      return;
    }

    setIsQrBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const updated = await uploadPaymentQr(dataUrl);
      setPaymentConfig(updated);
      addToast({
        title: 'Payment QR updated',
        message: 'Customers now see this image at checkout.',
        tone: 'success',
      });
    } catch (qrError) {
      addToast({
        title: 'Could not upload the QR image',
        message: getApiErrorMessage(qrError),
        tone: 'error',
      });
    } finally {
      setIsQrBusy(false);
      if (qrFileInputRef.current) qrFileInputRef.current.value = '';
    }
  };

  const handleRemoveQr = async () => {
    if (isQrBusy) return;
    setIsQrBusy(true);
    try {
      const updated = await removePaymentQr();
      setPaymentConfig(updated);
      addToast({
        title: 'Payment QR removed',
        message: 'The generated UPI QR will be shown instead.',
        tone: 'info',
      });
    } catch (qrError) {
      addToast({
        title: 'Could not remove the QR image',
        message: getApiErrorMessage(qrError),
        tone: 'error',
      });
    } finally {
      setIsQrBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || isBusy) return;
    setIsBusy(true);
    try {
      await rejectPayment(rejectTarget.id, rejectReason.trim() || undefined);
      addToast({
        title: 'Payment rejected',
        message: 'No order was created and the cart stays intact.',
        tone: 'info',
      });
      setRejectTarget(null);
      setRejectReason('');
      setReloadKey((key) => key + 1);
    } catch (rejectError) {
      addToast({
        title: 'Could not reject payment',
        message: getApiErrorMessage(rejectError),
        tone: 'error',
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Payments"
        title="UPI verification"
        description="Confirm money received in your UPI app before an order is created. Rejected payments keep the customer cart intact."
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

      <section className="mt-7 rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-calm-sand/50 bg-white">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Uploaded payment QR"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <QrCode size={30} className="mx-auto text-calm-muted" />
                <p className="mt-1.5 px-2 font-display text-[7px] uppercase tracking-[0.12em] text-calm-muted">
                  Generated QR
                </p>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[8px] font-semibold uppercase tracking-[0.16em] text-calm-sage">
              Payment QR
            </p>
            <h2 className="mt-1 font-serif text-xl text-calm-ink">
              Image shown to customers
            </h2>
            <p className="mt-1.5 max-w-xl text-[11px] leading-5 text-calm-muted">
              Upload the QR from your UPI app (PNG or JPEG, up to 2 MB). It
              replaces the generated QR at checkout while UTR verification stays
              the same. UPI ID: <span className="font-medium text-calm-body">{paymentConfig?.upiId ?? '—'}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={qrFileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) =>
                  void handleQrFile(event.target.files?.[0])
                }
              />
              <button
                type="button"
                onClick={() => qrFileInputRef.current?.click()}
                disabled={isQrBusy}
                className="btn-calm"
              >
                <Upload size={13} />
                {isQrBusy
                  ? 'Uploading'
                  : qrImageUrl
                    ? 'Replace image'
                    : 'Upload QR image'}
              </button>
              {qrImageUrl ? (
                <button
                  type="button"
                  onClick={() => void handleRemoveQr()}
                  disabled={isQrBusy}
                  className="btn-calm-secondary"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
        <div className="rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-calm-sage text-white">
              <Wallet size={18} strokeWidth={1.5} />
            </span>
            <span className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-muted">
              Matching
            </span>
          </div>
          <p className="mt-5 font-serif text-3xl text-calm-ink">
            {result?.meta.total ?? '—'}
          </p>
          <p className="mt-1 text-[10px] leading-5 text-calm-muted">
            Payments in this view
          </p>
        </div>
        <div className="rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F0E4D8] text-[#9C6B4B]">
              <Clock size={18} strokeWidth={1.5} />
            </span>
            <span className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-muted">
              Awaiting UTR
            </span>
          </div>
          <p className="mt-5 font-serif text-3xl text-calm-ink">{awaitingUtr}</p>
          <p className="mt-1 text-[10px] leading-5 text-calm-muted">
            Pending without a reference on this page
          </p>
        </div>
        <div className="col-span-2 rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card xl:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-calm-mist text-calm-sage">
              <ShieldCheck size={18} strokeWidth={1.5} />
            </span>
            <span className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-muted">
              How it works
            </span>
          </div>
          <p className="mt-4 text-[10px] leading-5 text-calm-body">
            Customer pays to your UPI ID and submits the 12-digit UTR. Match it
            in your bank statement, then confirm to create the order.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-white/60 bg-calm-ivory shadow-card">
        <div className="flex flex-col gap-3 border-b border-calm-sand/35 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Payment filters">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                onClick={() => {
                  setFilter(item.value);
                  setPage(1);
                }}
                className={cn(
                  'rounded-full px-3.5 py-2 font-display text-[8px] font-semibold uppercase tracking-[0.1em] transition',
                  filter === item.value
                    ? 'bg-calm-sage text-white'
                    : 'text-calm-muted hover:bg-white hover:text-calm-ink',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-full border border-calm-sand/60 bg-white/75 px-4 lg:w-72">
            <Search size={14} className="shrink-0 text-calm-muted" />
            <span className="sr-only">Search payments</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Email, payment ID or UTR"
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
              title="Could not load payments"
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
              icon={search ? SearchX : Wallet}
              title={search ? 'No payments match' : 'Nothing to verify'}
              message={
                search
                  ? 'Try a different customer email, payment ID or UTR.'
                  : 'Pending UPI payments will appear here with the UTR submitted by the customer.'
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
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-calm-sand/35 text-[8px] uppercase tracking-[0.14em] text-calm-muted">
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">UTR</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Review
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-calm-sand/25">
                  {result.data.map((payment) => {
                    const badge = statusBadge(payment.status);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={payment.id} className="transition hover:bg-white/45">
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-medium text-calm-ink">
                            #{formatOrderNumber(payment.id)}
                          </p>
                          <p className="mt-0.5 font-mono text-[8.5px] text-calm-muted">
                            Cart {payment.cartId}
                          </p>
                        </td>
                        <td className="max-w-[220px] px-4 py-3.5">
                          <p className="truncate text-[11px] text-calm-body">
                            {payment.customerEmail ?? 'Removed account'}
                          </p>
                          <p className="mt-0.5 text-[8.5px] text-calm-muted">
                            User #{payment.userId}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-calm-ink">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          {payment.utr ? (
                            <span className="font-mono text-[10px] text-calm-ink">
                              {payment.utr}
                            </span>
                          ) : (
                            <span className="text-[10px] text-calm-muted">
                              Not submitted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[10px] text-calm-muted">
                          <time dateTime={payment.createdAt}>
                            {formatDateTime(payment.createdAt)}
                          </time>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[7.5px] font-semibold uppercase tracking-[0.1em]',
                              badge.className,
                            )}
                          >
                            <BadgeIcon size={9} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {payment.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setConfirmTarget(payment)}
                                disabled={!payment.utr}
                                title={
                                  payment.utr
                                    ? 'Confirm payment and create order'
                                    : 'Waiting for the customer to submit a UTR'
                                }
                                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-calm-sage px-3 text-[8px] font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                <Check size={11} />
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectTarget(payment);
                                  setRejectReason('');
                                }}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#9B6049] transition hover:bg-[#F5E9E4]"
                              >
                                <XCircle size={11} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <p className="text-right text-[10px] text-calm-muted">
                              {payment.reviewedAt
                                ? formatDateTime(payment.reviewedAt)
                                : '—'}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <nav
                className="flex items-center justify-between gap-4 border-t border-calm-sand/35 px-5 py-4"
                aria-label="Payment pages"
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

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="Confirm this payment?"
        description={
          confirmTarget
            ? `Only confirm after ${formatCurrency(confirmTarget.amount)} from ${confirmTarget.customerEmail ?? 'this customer'} is visible in your bank or UPI app. This creates the order, reduces stock, and clears the cart.`
            : ''
        }
        confirmLabel="Confirm & create order"
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => void handleConfirm()}
        isBusy={isBusy}
      />

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => {
          if (!isBusy) setRejectTarget(null);
        }}
        title="Reject this payment?"
        description={
          rejectTarget
            ? 'The payment is marked failed, no order is created, and the customer cart stays intact.'
            : undefined
        }
        size="sm"
        tone="calm"
      >
        <label
          htmlFor="reject-reason"
          className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-ink"
        >
          Reason <span className="text-calm-muted">(optional)</span>
        </label>
        <textarea
          id="reject-reason"
          rows={3}
          maxLength={255}
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="UTR not found in the bank statement"
          className="mt-2 w-full resize-none rounded-2xl border border-calm-sand/70 bg-white/80 px-4 py-3 text-sm text-calm-ink outline-none transition placeholder:text-calm-muted focus:border-calm-sage focus:ring-2 focus:ring-calm-sage/15"
        />
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setRejectTarget(null)}
            disabled={isBusy}
            className="btn-calm-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleReject()}
            disabled={isBusy}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#A75B44] px-7 text-sm font-medium text-white shadow-raised transition hover:bg-[#924C37] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isBusy ? <Clock size={15} className="animate-spin" /> : null}
            {isBusy ? 'Working' : 'Reject payment'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
