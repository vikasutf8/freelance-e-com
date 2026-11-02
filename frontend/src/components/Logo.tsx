import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      aria-label="Purelis home"
      className={cn(
        'group inline-flex items-center gap-2.5 text-purelis-ink',
        className,
      )}
    >
      <span className="relative grid h-9 w-8 shrink-0 place-items-center">
        <svg viewBox="0 0 32 38" className="h-9 w-8" aria-hidden="true">
          <path
            d="M25.5 4.5C14.3 6.2 6.8 12 6.1 21.3c-.4 5.4 2.7 9.2 7.7 10.2 11.1 2.1 14.3-13.2 11.7-27Z"
            fill="#1F4A12"
          />
          <path
            d="M7.1 35c3.8-11.9 11.1-19.4 20.7-25.1"
            fill="none"
            stroke="#EAF0E3"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M12.5 27.7c3.4-.2 6.1-2.1 7.4-5.1-3.6-.4-6.5 1.4-7.4 5.1Z"
            fill="#8FA47D"
          />
        </svg>
      </span>
      <span className="flex flex-col">
        <span className="font-serif text-[23px] font-semibold uppercase leading-none tracking-[0.16em] sm:text-[25px]">
          Purelis
        </span>
        {!compact ? (
          <span className="mt-1 font-display text-[6.5px] font-semibold uppercase tracking-[0.36em] text-purelis-muted">
            Skincare
          </span>
        ) : null}
      </span>
    </Link>
  );
}
