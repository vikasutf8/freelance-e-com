import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errors';
import {
  getPayment,
  getPaymentConfig,
  simulatePayment,
  submitPaymentUtr,
} from '../api/payments';
import { useToast } from '../context/ToastContext';
import type { Payment, PaymentConfig } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { resolveMediaUrl } from '../utils/media';
import { Modal } from './Modal';

interface UPIScannerProps {
  payment: Payment | null;
  onClose: () => void;
  onPaid: (payment: Payment) => void;
}

export function UPIScanner({ payment, onClose, onPaid }: UPIScannerProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(payment);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const announcedRef = useRef(false);
  const { addToast } = useToast();

  useEffect(() => {
    setCurrentPayment(payment);
    setIsPaying(false);
    setIsSubmittingUtr(false);
    setIsRefreshing(false);
    setUtrInput(payment?.utr ?? '');
    announcedRef.current = payment?.status === 'success';
  }, [payment]);

  useEffect(() => {
    if (!payment) return;

    let active = true;

    getPaymentConfig()
      .then((nextConfig) => {
        if (active) setConfig(nextConfig);
      })
      .catch(() => {
        // The generated UPI QR remains available as a fallback.
      });

    return () => {
      active = false;
    };
  }, [payment?.id]);

  const currentId = currentPayment?.id;
  const currentStatus = currentPayment?.status;
  const currentUtr = currentPayment?.utr;
  const currentMode = currentPayment?.mode;
  const qrImageUrl = resolveMediaUrl(config?.qrImageUrl);

  useEffect(() => {
    if (
      !currentId ||
      currentMode !== 'manual' ||
      currentStatus !== 'pending' ||
      !currentUtr
    ) {
      return;
    }

    let active = true;

    const tick = async () => {
      try {
        const next = await getPayment(currentId);
        if (active) setCurrentPayment(next);
      } catch {
        // Keep polling; a transient network failure should not stop verification.
      }
    };

    const timer = window.setInterval(() => {
      void tick();
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [currentId, currentMode, currentStatus, currentUtr]);

  useEffect(() => {
    if (!currentPayment || announcedRef.current) return;

    if (currentPayment.status === 'success') {
      announcedRef.current = true;
      addToast({
        title: 'Payment received',
        message: 'Your order is confirmed. A fresh start awaits.',
        tone: 'success',
      });
      onPaid(currentPayment);
      return;
    }

    if (currentPayment.status === 'failed') {
      announcedRef.current = true;
      addToast({
        title: 'Payment not confirmed',
        message:
          currentPayment.failureReason ??
          'The store could not verify this payment. Start a new checkout to retry.',
        tone: 'error',
      });
    }
  }, [addToast, currentPayment, onPaid]);

  const isSuccess = currentPayment?.status === 'success';
  const isFailed = currentPayment?.status === 'failed';
  const isManual = currentPayment?.mode === 'manual';
  const isAwaitingVerification =
    isManual && currentPayment?.status === 'pending' && Boolean(currentPayment.utr);

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast({
        title: `${label} copied`,
        message: 'Paste it into your UPI app to continue.',
        tone: 'success',
      });
    } catch {
      addToast({
        title: 'Could not copy',
        message: 'Please copy the details manually.',
        tone: 'error',
      });
    }
  };

  const handleSimulate = async () => {
    if (
      !currentPayment ||
      currentPayment.mode !== 'mock' ||
      currentPayment.status !== 'pending' ||
      isPaying
    ) {
      return;
    }

    setIsPaying(true);
    try {
      const settled = await simulatePayment(currentPayment.cartId);
      setCurrentPayment(settled);
    } catch (error) {
      addToast({
        title: 'Payment could not be completed',
        message: getApiErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmitUtr = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPayment || isSubmittingUtr) return;

    const value = utrInput.trim();
    if (!/^\d{12}$/.test(value)) {
      addToast({
        title: 'Check the UTR',
        message: 'Enter the 12-digit reference number shown in your UPI app.',
        tone: 'error',
      });
      return;
    }

    setIsSubmittingUtr(true);
    try {
      const updated = await submitPaymentUtr(currentPayment.id, value);
      setCurrentPayment(updated);
      setUtrInput(updated.utr ?? value);
      addToast({
        title: 'Payment submitted',
        message:
          'The store will verify your UTR and confirm the order shortly.',
        tone: 'info',
      });
    } catch (error) {
      addToast({
        title: 'Could not submit the UTR',
        message: getApiErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const handleRefresh = async () => {
    if (!currentPayment || isRefreshing) return;

    setIsRefreshing(true);
    try {
      const next = await getPayment(currentPayment.id);
      setCurrentPayment(next);
    } catch (error) {
      addToast({
        title: 'Could not refresh the payment',
        message: getApiErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const title = isSuccess
    ? 'Payment complete'
    : isFailed
      ? 'Payment not confirmed'
      : isAwaitingVerification
        ? 'Verification in progress'
        : 'Pay with UPI';

  const description = isSuccess
    ? 'Your ritual is on its way. A confirmation has been added to your account.'
    : isFailed
      ? 'No order was created. Your bag is untouched, so you can try again.'
      : isAwaitingVerification
        ? 'Your UTR has been submitted. The store is checking it against the bank statement.'
        : 'Scan the QR code with any UPI app, pay the exact amount, then submit the UTR from your UPI app.';

  return (
    <Modal
      open={Boolean(currentPayment)}
      onClose={() => {
        if (!isPaying && !isSubmittingUtr) onClose();
      }}
      title={title}
      description={description}
      size="lg"
    >
      {currentPayment ? (
        <div className="grid gap-7 md:grid-cols-[240px_1fr] md:gap-8">
          <div className="mx-auto w-full max-w-[240px]">
            {isSuccess ? (
              <div className="flex aspect-square flex-col items-center justify-center border border-purelis-line bg-purelis-sage-soft px-6 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-purelis-forest text-white">
                  <Check size={38} strokeWidth={1.4} />
                </span>
                <p className="mt-6 font-serif text-2xl text-purelis-ink">
                  Beautifully done.
                </p>
                <p className="mt-2 text-xs leading-5 text-purelis-muted">
                  Payment of {formatCurrency(currentPayment.amount)} received.
                </p>
              </div>
            ) : isFailed ? (
              <div className="flex aspect-square flex-col items-center justify-center border border-[#B8674F]/30 bg-[#F7EDE8] px-6 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[#B8674F] text-white">
                  <XCircle size={36} strokeWidth={1.4} />
                </span>
                <p className="mt-6 font-serif text-2xl text-[#8D4D38]">
                  Not verified.
                </p>
                <p className="mt-2 text-xs leading-5 text-[#8D4D38]/80">
                  {currentPayment.failureReason ??
                    'The payment could not be matched to this order.'}
                </p>
              </div>
            ) : isAwaitingVerification ? (
              <div className="flex aspect-square flex-col items-center justify-center border border-purelis-line bg-purelis-sage-soft px-6 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-purelis-forest shadow-sm">
                  <Clock size={36} strokeWidth={1.3} />
                </span>
                <p className="mt-6 font-serif text-2xl text-purelis-ink">
                  Under review.
                </p>
                <p className="mt-2 text-xs leading-5 text-purelis-muted">
                  UTR {currentPayment.utr}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-purelis-muted">
                  This page refreshes automatically.
                </p>
              </div>
            ) : (
              <>
                <div className="border border-purelis-line bg-white p-4 shadow-sm">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="Store UPI payment QR code"
                      className="block h-auto w-full"
                    />
                  ) : (
                    <QRCode
                      value={currentPayment.upiLink}
                      size={208}
                      bgColor="#FFFFFF"
                      fgColor="#1B2A16"
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                  )}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 bg-purelis-cream px-3 py-2">
                  <Smartphone size={13} className="text-purelis-leaf" />
                  <p className="font-display text-[8px] font-semibold uppercase tracking-[0.1em] text-purelis-muted">
                    {qrImageUrl ? 'Scan the store QR' : 'Scan with any UPI app'}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-purelis-line pb-4">
              <div>
                <p className="font-display text-[9px] font-semibold uppercase tracking-[0.14em] text-purelis-muted">
                  Amount due
                </p>
                <p className="mt-1 font-serif text-3xl font-semibold text-purelis-ink">
                  {formatCurrency(currentPayment.amount)}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 font-display text-[8px] font-semibold uppercase tracking-[0.12em]',
                  isSuccess
                    ? 'bg-purelis-sage-soft text-purelis-forest'
                    : isFailed
                      ? 'bg-[#F5E9E4] text-[#9B6049]'
                      : isAwaitingVerification
                        ? 'bg-calm-mist text-calm-sage'
                        : 'bg-[#F4EDE4] text-[#8A6545]',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isSuccess
                      ? 'bg-purelis-forest'
                      : isFailed
                        ? 'bg-[#9B6049]'
                        : isAwaitingVerification
                          ? 'bg-calm-sage'
                          : 'bg-[#B98558]',
                  )}
                />
                {isSuccess
                  ? 'Paid'
                  : isFailed
                    ? 'Not verified'
                    : isAwaitingVerification
                      ? 'Under review'
                      : 'Awaiting payment'}
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-purelis-muted">UPI ID</dt>
                <dd className="flex items-center gap-2 text-xs font-medium text-purelis-ink">
                  {currentPayment.upiId}
                  <button
                    type="button"
                    onClick={() => void copyValue(currentPayment.upiId, 'UPI ID')}
                    aria-label="Copy UPI ID"
                    className="grid h-7 w-7 place-items-center border border-purelis-line text-purelis-muted transition hover:border-purelis-forest hover:text-purelis-forest"
                  >
                    <Copy size={12} />
                  </button>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-purelis-muted">Payment reference</dt>
                <dd className="font-mono text-[11px] text-purelis-ink">
                  PL-{String(currentPayment.id).padStart(6, '0')}
                </dd>
              </div>
              {currentPayment.utr ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-xs text-purelis-muted">UTR</dt>
                  <dd className="font-mono text-[11px] text-purelis-ink">
                    {currentPayment.utr}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-purelis-muted">Currency</dt>
                <dd className="text-xs font-medium text-purelis-ink">INR</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-start gap-2.5 border border-purelis-line bg-purelis-cream/70 p-3">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-purelis-leaf" />
              <p className="text-[10px] leading-5 text-purelis-muted">
                {isSuccess
                  ? 'Payment confirmed and your order has been created.'
                  : isFailed
                    ? currentPayment.failureReason ??
                      'The store could not verify this payment. Your cart is still intact.'
                    : isAwaitingVerification
                      ? 'The store verifies the UTR against its bank statement before creating the order. This usually happens quickly during store hours.'
                      : currentPayment.mode === 'manual'
                        ? 'Pay the exact amount to the UPI ID above, then enter the 12-digit UTR shown in your UPI app. The order is created only after the store verifies the payment.'
                        : 'This is a demo checkout. No real money will be charged. Use “Simulate payment” to complete the UPI flow and update stock.'}
              </p>
            </div>

            <div className="mt-auto pt-5">
              {isSuccess ? (
                <>
                  <Link
                    to="/orders"
                    onClick={onClose}
                    className="btn-purelis w-full"
                  >
                    <ReceiptText size={14} />
                    View order history
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-purelis-light mt-3 w-full"
                  >
                    Continue shopping
                  </button>
                </>
              ) : isFailed ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-purelis w-full"
                >
                  Close and try again
                </button>
              ) : isAwaitingVerification ? (
                <>
                  <div className="flex items-center justify-center gap-2 border border-purelis-line bg-white px-4 py-3 text-[10px] text-purelis-muted">
                    <LoaderCircle
                      size={14}
                      className="animate-spin text-purelis-leaf"
                    />
                    Waiting for the store to confirm payment
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRefresh()}
                    disabled={isRefreshing}
                    className="btn-purelis-light mt-3 w-full"
                  >
                    <RefreshCw
                      size={13}
                      className={cn(isRefreshing && 'animate-spin')}
                    />
                    Check status now
                  </button>
                </>
              ) : currentPayment.mode === 'manual' ? (
                <form onSubmit={(event) => void handleSubmitUtr(event)}>
                  <label
                    htmlFor="payment-utr"
                    className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-purelis-ink"
                  >
                    UTR / UPI reference
                  </label>
                  <input
                    id="payment-utr"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={12}
                    value={utrInput}
                    onChange={(event) =>
                      setUtrInput(event.target.value.replace(/\D/g, '').slice(0, 12))
                    }
                    placeholder="123456789012"
                    className="mt-2 h-11 w-full border border-purelis-line bg-white px-4 font-mono text-sm text-purelis-ink outline-none transition focus:border-purelis-forest"
                  />
                  <p className="mt-2 text-[9px] leading-5 text-purelis-muted">
                    Find this 12-digit number in the payment details of your UPI
                    app.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmittingUtr || utrInput.length !== 12}
                    className="btn-purelis mt-3 w-full"
                  >
                    {isSubmittingUtr ? (
                      <>
                        <LoaderCircle size={15} className="animate-spin" />
                        Submitting UTR
                      </>
                    ) : (
                      <>
                        I have paid
                        <ArrowUpRight size={14} />
                      </>
                    )}
                  </button>
                  <a
                    href={currentPayment.upiLink}
                    className="mt-3 flex items-center justify-center gap-2 text-center font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-purelis-forest hover:underline"
                  >
                    Open in a UPI app
                    <ArrowUpRight size={12} />
                  </a>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void handleSimulate()}
                    disabled={isPaying}
                    className="btn-purelis w-full"
                  >
                    {isPaying ? (
                      <>
                        <LoaderCircle size={15} className="animate-spin" />
                        Confirming payment
                      </>
                    ) : (
                      <>
                        Simulate payment
                        <ArrowUpRight size={14} />
                      </>
                    )}
                  </button>
                  <a
                    href={currentPayment.upiLink}
                    className="mt-3 flex items-center justify-center gap-2 text-center font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-purelis-forest hover:underline"
                  >
                    Open in a UPI app
                    <ArrowUpRight size={12} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
