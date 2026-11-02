import { LoaderCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export function PageLoader({
  label = 'Preparing your ritual',
  calm = false,
}: {
  label?: string;
  calm?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[50vh] flex-col items-center justify-center gap-4',
        calm ? 'text-calm-muted' : 'text-purelis-muted',
      )}
    >
      <LoaderCircle className="h-7 w-7 animate-spin" strokeWidth={1.5} />
      <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em]">
        {label}
      </p>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <div className="aspect-square animate-pulse bg-purelis-sage-soft" />
          <div className="mx-auto mt-4 h-3 w-2/3 animate-pulse bg-purelis-line" />
          <div className="mx-auto mt-2 h-3 w-1/3 animate-pulse bg-purelis-line" />
          <div className="mx-auto mt-4 h-8 w-4/5 animate-pulse bg-purelis-line" />
        </div>
      ))}
    </div>
  );
}
