import { ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="relative overflow-hidden bg-purelis-sage-soft">
      <div className="pointer-events-none absolute inset-0 grain-overlay opacity-25" />
      <div className="store-container flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-purelis-leaf/25 bg-white/50 text-purelis-leaf">
          <Leaf size={26} strokeWidth={1.25} />
        </span>
        <p className="eyebrow-purelis mt-7">A quiet detour</p>
        <h1 className="mt-3 font-serif text-[42px] leading-none text-purelis-ink sm:text-[56px]">
          404
        </h1>
        <h2 className="mt-4 font-serif text-2xl text-purelis-ink">
          This page wandered off.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-purelis-muted">
          The ritual you are looking for may have moved. Let us guide you back
          to something beautiful.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-purelis">
            Return home
            <ArrowRight size={14} />
          </Link>
          <Link to="/#collection" className="btn-purelis-light">
            Browse the collection
          </Link>
        </div>
      </div>
    </div>
  );
}
