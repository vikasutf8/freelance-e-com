import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

type ToastTone = 'success' | 'error' | 'info';

interface ToastInput {
  title: string;
  message?: string;
  tone?: ToastTone;
}

interface Toast extends ToastInput {
  id: number;
  tone: ToastTone;
}

interface ToastContextValue {
  addToast: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  success: 'border-calm-online/20 bg-[#EEF3EB] text-calm-ink',
  error: 'border-[#B8674F]/20 bg-[#F7EDE8] text-calm-ink',
  info: 'border-calm-sand/50 bg-calm-ivory text-calm-ink',
};

const iconStyles: Record<ToastTone, string> = {
  success: 'bg-calm-online text-white',
  error: 'bg-[#B8674F] text-white',
  info: 'bg-calm-sage text-white',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    ({ title, message, tone = 'success' }: ToastInput) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current.slice(-2), { id, title, message, tone }]);
      const timer = window.setTimeout(
        () => dismiss(id),
        tone === 'error' ? 6000 : 4200,
      );
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4 sm:left-auto sm:right-5 sm:top-5 sm:items-end sm:px-0"
      >
        {toasts.map((toast) => {
          const Icon =
            toast.tone === 'success'
              ? CheckCircle2
              : toast.tone === 'error'
                ? AlertCircle
                : Info;
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-raised animate-slide-in',
                toneStyles[toast.tone],
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full',
                  iconStyles[toast.tone],
                )}
              >
                <Icon className="h-[18px] w-[18px]" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message ? (
                  <p className="mt-0.5 text-xs leading-5 text-calm-body/75">
                    {toast.message}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-calm-muted transition hover:bg-white/70 hover:text-calm-ink"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
