import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  QrCode,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';

const ritualSteps = [
  {
    icon: ShoppingBag,
    title: 'Gather your essentials',
    text: 'Cleanse, treat, moisturize, protect.',
  },
  {
    icon: QrCode,
    title: 'A calm UPI checkout',
    text: 'Scan once, settle simply, no card needed.',
  },
  {
    icon: Sparkles,
    title: 'Return to your ritual',
    text: 'Your bag and account stay in sync.',
  },
];

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-calm-canvas font-sans text-calm-body">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="relative hidden overflow-hidden px-10 py-9 lg:flex lg:flex-col xl:px-14">
          <div className="pointer-events-none absolute -left-28 top-16 h-80 w-80 rounded-full bg-calm-mist/55 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-calm-sand/20 blur-3xl" />
          <div className="pointer-events-none absolute right-14 top-20 h-28 w-28 rounded-full border border-calm-sand/35" />
          <div className="pointer-events-none absolute right-24 top-28 h-28 w-28 rounded-full border border-calm-sand/20" />

          <div className="relative z-10 flex items-center justify-between">
            <Logo />
            <span className="rounded-full border border-calm-sand/50 bg-calm-ivory/70 px-4 py-2 font-display text-[8px] font-semibold uppercase tracking-[0.18em] text-calm-muted">
              Member ritual
            </span>
          </div>

          <div className="relative z-10 my-auto max-w-lg py-14">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-calm-sage">
              01. Your quiet corner
            </p>
            <h1 className="mt-5 max-w-[470px] font-serif text-[44px] leading-[1.08] text-calm-ink xl:text-[52px]">
              A slower kind of beauty, kept close.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-calm-muted">
              One account for your bag, your essentials and the small rituals
              that make a day feel like yours.
            </p>

            <div className="mt-9 rounded-card border border-white/70 bg-calm-ivory/90 p-6 shadow-card backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="relative grid h-[62px] w-[62px] place-items-center rounded-full bg-calm-sand/65 font-serif text-lg text-calm-ink">
                  PL
                  <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-calm-online ring-2 ring-calm-ivory" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-calm-muted">
                    Purelis member
                  </p>
                  <p className="mt-1.5 font-serif text-xl text-calm-ink">
                    Your ritual, remembered.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-calm-sand/40 pt-5">
                {ritualSteps.map(({ icon: Icon, title: stepTitle, text }, index) => (
                  <div key={stepTitle} className="flex items-start gap-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-calm-mist text-calm-sage">
                      <Icon size={16} strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-calm-ink">
                        {stepTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-5 text-calm-muted">
                        {text}
                      </p>
                    </div>
                    <span className="mt-1 font-display text-[8px] font-semibold uppercase tracking-[0.15em] text-calm-sand">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-calm-mist/70 px-4 py-3 text-calm-sage">
                <LockKeyhole size={14} strokeWidth={1.5} />
                <p className="text-[10px] leading-5">
                  Private by design. Your account is protected with a secure
                  token.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 font-display text-[8.5px] uppercase tracking-[0.18em] text-calm-muted">
            Clean formulas · Quiet rituals · Made with care
          </p>
        </aside>

        <main className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:border-l lg:border-calm-sand/35 lg:px-12 lg:py-8 xl:px-20">
          <div className="flex items-center justify-between lg:justify-end">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-calm-sand/60 bg-calm-ivory/60 px-4 py-2 font-display text-[8.5px] font-semibold uppercase tracking-[0.14em] text-calm-body transition hover:bg-white"
            >
              <ArrowLeft size={12} />
              Back to shop
            </Link>
          </div>

          <div className="my-auto flex justify-center py-10">
            <div className="w-full max-w-[430px] animate-fade-up">
              <p className="font-display text-[9px] font-semibold uppercase tracking-[0.24em] text-calm-sage">
                {eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-[38px] leading-[1.12] text-calm-ink sm:text-[42px]">
                {title}
              </h2>
              <p className="mt-3 max-w-sm text-[13px] leading-6 text-calm-muted">
                {subtitle}
              </p>

              <div className="mt-7 rounded-card border border-white/70 bg-calm-ivory p-5 shadow-card sm:p-7">
                {children}
              </div>

              <div className="mt-5 text-center text-xs text-calm-muted">
                {footer}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.14em] text-calm-muted">
            <span>© {new Date().getFullYear()} Purelis</span>
            <Link
              to="/info/privacy"
              className="flex items-center gap-1 transition hover:text-calm-ink"
            >
              Privacy
              <ArrowRight size={9} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
