import {
  useEffect,
  useId,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'store' | 'calm';
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  tone = 'store',
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-purelis-ink/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] shadow-2xl animate-fade-up sm:rounded-none',
          tone === 'store'
            ? 'border border-purelis-line bg-white'
            : 'border border-white/70 bg-calm-ivory',
          widths[size],
        )}
      >
        <div
          className={cn(
            'flex items-start justify-between gap-5 border-b px-6 py-5',
            tone === 'store'
              ? 'border-purelis-line'
              : 'border-calm-sand/50',
          )}
        >
          <div>
            <h2
              id={titleId}
              className={cn(
                'font-serif text-xl font-semibold',
                tone === 'store' ? 'text-purelis-ink' : 'text-calm-ink',
              )}
            >
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  'mt-1.5 text-sm leading-6',
                  tone === 'store' ? 'text-purelis-muted' : 'text-calm-muted',
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-full transition',
              tone === 'store'
                ? 'text-purelis-muted hover:bg-purelis-cream hover:text-purelis-ink'
                : 'text-calm-muted hover:bg-white/70 hover:text-calm-ink',
            )}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
