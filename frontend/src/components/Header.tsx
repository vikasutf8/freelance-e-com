import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';
import { getInitials } from '../utils/format';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

const navItems = [
  { label: 'Shop', to: '/#collection' },
  { label: 'Contact', to: '/info/contact' },
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [accountOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}#collection` : '/');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    addToast({
      title: 'Signed out',
      message: 'Your cart is waiting whenever you are ready.',
      tone: 'info',
    });
    navigate('/');
  };

  return (
    <>
      <div className="bg-purelis-forest text-white">
        <div className="store-container flex min-h-8 items-center justify-center gap-5 py-1.5 md:justify-between">
          <p className="text-center font-display text-[8.5px] font-medium uppercase tracking-[0.12em] sm:text-[10px]">
            Free shipping on orders over ₹499
            <span className="mx-2 opacity-45">|</span>
            Use code <span className="font-semibold">PURE20</span> for 20% off
          </p>
          <SocialLinks className="hidden text-white/90 md:flex" linkClassName="h-7 w-7" />
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-purelis-line bg-white/95 backdrop-blur-md">
        <div className="store-container flex h-[68px] items-center justify-between gap-4 md:h-[76px]">
          <Logo className="shrink-0" />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'font-display text-[10.5px] font-semibold uppercase tracking-[0.09em] transition',
                  isActive
                    ? 'text-purelis-forest'
                    : 'text-purelis-ink hover:text-purelis-forest',
                )
              }
            >
              Home
            </NavLink>
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="font-display text-[10.5px] font-semibold uppercase tracking-[0.09em] text-purelis-ink transition hover:text-purelis-forest"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? 'Close search' : 'Search products'}
              aria-expanded={searchOpen}
              className="grid h-10 w-10 place-items-center rounded-full text-purelis-ink transition hover:bg-purelis-cream hover:text-purelis-forest"
            >
              {searchOpen ? <X size={19} strokeWidth={1.6} /> : <Search size={19} strokeWidth={1.6} />}
            </button>

            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-label="Account menu"
                aria-expanded={accountOpen}
                className="flex h-10 items-center gap-1 rounded-full px-2 text-purelis-ink transition hover:bg-purelis-cream hover:text-purelis-forest"
              >
                {user ? (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-purelis-sage-soft font-display text-[9px] font-semibold tracking-wide text-purelis-forest">
                    {getInitials(user.email)}
                  </span>
                ) : (
                  <UserRound size={19} strokeWidth={1.6} />
                )}
                <ChevronDown
                  size={12}
                  className={cn('transition', accountOpen && 'rotate-180')}
                />
              </button>

              {accountOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 border border-purelis-line bg-white p-2 shadow-[0_16px_40px_rgba(27,42,22,0.12)] animate-fade-in">
                  {user ? (
                    <>
                      <div className="border-b border-purelis-line px-3 py-3">
                        <p className="font-display text-[9px] font-semibold uppercase tracking-[0.14em] text-purelis-leaf">
                          {user.role === 'admin' ? 'Administrator' : 'Purelis member'}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-purelis-ink">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/cart"
                        className="mt-1 flex items-center gap-2.5 px-3 py-2.5 text-sm text-purelis-ink transition hover:bg-purelis-cream"
                      >
                        <ShoppingBag size={16} strokeWidth={1.6} />
                        Your bag
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-purelis-ink transition hover:bg-purelis-cream"
                      >
                        <ReceiptText size={16} strokeWidth={1.6} />
                        Order history
                      </Link>
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin/products"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-purelis-ink transition hover:bg-purelis-cream"
                        >
                          <LayoutDashboard size={16} strokeWidth={1.6} />
                          Admin console
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-purelis-ink transition hover:bg-purelis-cream"
                      >
                        <LogOut size={16} strokeWidth={1.6} />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <div className="p-2">
                      <p className="font-serif text-lg text-purelis-ink">Welcome to Purelis</p>
                      <p className="mt-1 text-xs leading-5 text-purelis-muted">
                        Sign in to build your bag and follow your skin ritual.
                      </p>
                      <Link
                        to="/login"
                        className="btn-purelis mt-4 w-full"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/signup"
                        className="mt-2 block py-2 text-center font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-purelis-forest hover:underline"
                      >
                        Create an account
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <Link
              to="/cart"
              aria-label={`Cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-purelis-ink transition hover:bg-purelis-cream hover:text-purelis-forest"
            >
              <ShoppingBag size={20} strokeWidth={1.55} />
              {itemCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-purelis-forest px-1 font-display text-[8px] font-semibold leading-none text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="grid h-10 w-10 place-items-center rounded-full text-purelis-ink transition hover:bg-purelis-cream lg:hidden"
            >
              {mobileOpen ? <X size={21} strokeWidth={1.6} /> : <Menu size={21} strokeWidth={1.6} />}
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div className="border-t border-purelis-line bg-white">
            <form onSubmit={submitSearch} className="store-container flex items-center gap-3 py-4">
              <Search size={19} className="shrink-0 text-purelis-leaf" strokeWidth={1.6} />
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search cleansers, serums, rituals..."
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-purelis-ink outline-none"
              />
              <button type="submit" className="btn-purelis !px-5 !py-2.5">
                Search
              </button>
            </form>
          </div>
        ) : null}
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-purelis-ink/30 backdrop-blur-[1px]"
          />
          <div className="absolute inset-x-0 top-[100px] max-h-[calc(100vh-100px)] overflow-y-auto border-t border-purelis-line bg-white px-5 pb-8 pt-5 shadow-xl animate-fade-up">
            {user ? (
              <div className="mb-5 flex items-center gap-3 border-b border-purelis-line pb-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-purelis-sage-soft font-display text-[11px] font-semibold text-purelis-forest">
                  {getInitials(user.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.12em] text-purelis-leaf">
                    {user.role === 'admin' ? 'Administrator' : 'Welcome back'}
                  </p>
                  <p className="truncate text-sm font-medium">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="mb-5 grid grid-cols-2 gap-3 border-b border-purelis-line pb-5">
                <Link to="/login" className="btn-purelis-light justify-center">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-purelis justify-center">
                  Join Purelis
                </Link>
              </div>
            )}

            <nav className="flex flex-col" aria-label="Mobile navigation">
              <Link to="/" className="border-b border-purelis-line py-3.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-purelis-ink">
                Home
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="border-b border-purelis-line py-3.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-purelis-ink"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <Link
                  to="/orders"
                  className="border-b border-purelis-line py-3.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-purelis-ink"
                >
                  Order history
                </Link>
              ) : null}
              {user?.role === 'admin' ? (
                <Link
                  to="/admin/products"
                  className="border-b border-purelis-line py-3.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-purelis-forest"
                >
                  Admin console
                </Link>
              ) : null}
            </nav>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-5 flex w-full items-center justify-center gap-2 border border-purelis-line px-4 py-3 text-xs font-medium text-purelis-ink"
              >
                <LogOut size={15} />
                Sign out
              </button>
            ) : null}

            <div className="mt-7 flex items-center justify-between border-t border-purelis-line pt-5">
              <p className="font-display text-[9px] uppercase tracking-[0.16em] text-purelis-muted">
                Follow Purelis
              </p>
              <SocialLinks className="text-purelis-forest" linkClassName="h-7 w-7" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
