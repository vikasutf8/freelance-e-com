import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
  calm?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  calm = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        calm
          ? 'rounded-card border border-calm-sand/45 bg-calm-ivory/70'
          : 'border border-dashed border-purelis-line bg-purelis-cream/50',
        className,
      )}
    >
      <span
        className={cn(
          'grid h-16 w-16 place-items-center rounded-full',
          calm
            ? 'bg-calm-mist text-calm-sage'
            : 'bg-purelis-sage-soft text-purelis-forest',
        )}
      >
        <Icon size={26} strokeWidth={1.5} />
      </span>
      <h3
        className={cn(
          'mt-5 font-serif text-xl font-semibold',
          calm ? 'text-calm-ink' : 'text-purelis-ink',
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'mt-2 max-w-sm text-sm leading-6',
          calm ? 'text-calm-muted' : 'text-purelis-muted',
        )}
      >
        {message}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
