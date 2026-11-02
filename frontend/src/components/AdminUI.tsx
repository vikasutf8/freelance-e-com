import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { Modal } from './Modal';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="font-display text-[9px] font-semibold uppercase tracking-[0.22em] text-calm-sage">
          {eyebrow}
        </p>
        <h1 className="mt-2.5 font-serif text-[34px] leading-tight text-calm-ink sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-6 text-calm-muted">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminStat({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  tone?: 'default' | 'sage' | 'sand' | 'warning';
}) {
  return (
    <div className="rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid h-10 w-10 place-items-center rounded-2xl',
            tone === 'sage' && 'bg-calm-sage text-white',
            tone === 'sand' && 'bg-calm-sand/40 text-calm-body',
            tone === 'warning' && 'bg-[#F0E4D8] text-[#9C6B4B]',
            tone === 'default' && 'bg-calm-mist text-calm-sage',
          )}
        >
          <Icon size={18} strokeWidth={1.5} />
        </span>
        <span className="font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-calm-muted">
          {label}
        </span>
      </div>
      <p className="mt-5 font-serif text-3xl text-calm-ink">{value}</p>
      <p className="mt-1 text-[10px] leading-5 text-calm-muted">{detail}</p>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
  isBusy,
  destructive = false,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  isBusy?: boolean;
  destructive?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isBusy) onClose();
      }}
      title={title}
      description={description}
      size="sm"
      tone="calm"
    >
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="btn-calm-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isBusy}
          className={cn(
            'inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium text-white shadow-raised transition disabled:cursor-not-allowed disabled:opacity-55',
            destructive
              ? 'bg-[#A75B44] hover:bg-[#924C37]'
              : 'bg-calm-sage hover:brightness-95',
          )}
        >
          {isBusy ? <LoaderCircle size={15} className="animate-spin" /> : null}
          {isBusy ? 'Working' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
