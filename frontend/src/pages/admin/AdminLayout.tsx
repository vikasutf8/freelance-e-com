import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/format';

const navItems = [
  { label: 'Orders', to: '/admin/orders', icon: ReceiptText },
  { label: 'Payments', to: '/admin/payments', icon: Wallet },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'People', to: '/admin/users', icon: Users },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const current = navItems.find((item) => location.pathname.startsWith(item.to));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    addToast({
      title: 'Signed out',
      message: 'Your admin session has ended safely.',
      tone: 'info',
    });
    navigate('/');
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-3 px-1">
        <Logo compact />
        <span className="rounded-full bg-calm-sage/15 px-2.5 py-1 font-display text-[7.5px] font-semibold uppercase tracking-[0.16em] text-calm-sage">
          Admin
        </span>
      </div>

      <div className="mt-9 rounded-card border border-white/60 bg-calm-ivory/70 p-3 shadow-raised">
        <p className="px-3 pb-2 pt-1 font-display text-[8px] font-semibold uppercase tracking-[0.2em] text-calm-muted">
          Workspace
        </p>
        <nav className="space-y-1" aria-label="Admin navigation">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition',
                  isActive
                    ? 'bg-calm-sage text-white shadow-raised'
                    : 'text-calm-body hover:bg-white/70 hover:text-calm-ink',
                )
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="flex-1">{label}</span>
              <ArrowUpRight size={13} className="opacity-45" />
            </NavLink>
          ))}
        </nav>
      </div>

      <Link
        to="/"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-calm-sand/40 bg-calm-ivory/50 px-4 py-3 text-[11px] text-calm-muted transition hover:bg-calm-ivory hover:text-calm-ink"
      >
        <ShoppingBag size={16} strokeWidth={1.5} />
        <span className="flex-1">Back to storefront</span>
        <ArrowUpRight size={13} />
      </Link>

      <div className="mt-auto">
        <div className="rounded-card border border-white/60 bg-calm-ivory/70 p-4 shadow-raised">
          <div className="flex items-center gap-3">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-calm-sand/50 font-display text-[9px] font-semibold text-calm-ink">
              {user ? getInitials(user.email) : 'AD'}
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-calm-online ring-2 ring-calm-ivory" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-calm-ink">
                {user?.email}
              </p>
              <p className="mt-0.5 font-display text-[7.5px] uppercase tracking-[0.14em] text-calm-muted">
                Store administrator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-calm-sand/50 py-2 text-[10px] font-medium text-calm-body transition hover:bg-white"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
        <p className="mt-5 text-center font-display text-[7px] uppercase tracking-[0.2em] text-calm-muted/70">
          Purelis · Calm console
        </p>
      </div>
    </>
  );

  return (
    <div className="admin-shell-bg min-h-screen font-sans text-calm-body">
      <div className="mx-auto flex min-h-screen max-w-[1540px]">
        <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-calm-sand/35 bg-calm-ivory/45 px-5 py-6 backdrop-blur-sm lg:flex">
          {sidebarContent}
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between gap-4 border-b border-calm-sand/35 bg-calm-canvas/80 px-5 backdrop-blur-md sm:px-7 lg:h-[82px] lg:px-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open admin menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-calm-sand/50 bg-calm-ivory/70 text-calm-ink lg:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="font-display text-[8px] font-semibold uppercase tracking-[0.2em] text-calm-muted">
                  Store console
                </p>
                <p className="mt-0.5 text-sm font-medium text-calm-ink">
                  {current?.label ?? 'Overview'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                className="hidden items-center gap-2 rounded-full border border-calm-sand/50 bg-calm-ivory/65 px-4 py-2 text-[10px] font-medium text-calm-body transition hover:bg-white sm:flex"
              >
                View store
                <ArrowUpRight size={12} />
              </Link>
              <span className="hidden h-8 w-px bg-calm-sand/40 sm:block" />
              <span className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-calm-sand/50 font-display text-[8px] font-semibold text-calm-ink">
                  {user ? getInitials(user.email) : 'AD'}
                </span>
                <span className="hidden max-w-[160px] truncate text-[11px] text-calm-muted md:block">
                  {user?.email}
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="grid h-9 w-9 place-items-center rounded-full text-calm-muted transition hover:bg-white/70 hover:text-calm-ink"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <main className="px-5 py-7 sm:px-7 lg:px-10 lg:py-10">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-calm-ink/25 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[290px] max-w-[86vw] flex-col overflow-y-auto border-r border-calm-sand/40 bg-calm-canvas px-5 py-5 shadow-2xl animate-slide-in">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-calm-ivory text-calm-ink"
            >
              <X size={17} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
