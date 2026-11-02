import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

const serviceItems = [
  {
    icon: Truck,
    title: 'Free shipping',
    text: 'On all orders over ₹499',
  },
  {
    icon: RotateCcw,
    title: 'Easy returns',
    text: '14-day return policy',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payment',
    text: '100% safe UPI checkout',
  },
];

const footerLinks = [
  { label: 'Shipping policy', to: '/info/shipping' },
  { label: 'Privacy policy', to: '/info/privacy' },
  { label: 'Terms & conditions', to: '/info/terms' },
  { label: 'Contact us', to: '/info/contact' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    addToast({
      title: 'You are on the list',
      message: 'A little calm, straight to your inbox soon.',
      tone: 'success',
    });
    setEmail('');
  };

  return (
    <footer className="mt-auto bg-purelis-cream">
      <div className="border-b border-purelis-line">
        <div className="store-container grid gap-8 py-10 sm:grid-cols-3">
          {serviceItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 sm:justify-center">
              <Icon size={28} strokeWidth={1.2} className="shrink-0 text-purelis-leaf" />
              <div>
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-purelis-ink">
                  {title}
                </p>
                <p className="mt-1 text-[11px] text-purelis-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="store-container grid gap-12 py-14 lg:grid-cols-[1.05fr_1.2fr_1fr] lg:gap-16">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-7 text-purelis-muted">
            Considered skincare for everyday rituals. Powered by nature,
            grounded in science, made for every kind of skin.
          </p>
          <SocialLinks
            className="mt-6 text-purelis-forest"
            linkClassName="rounded-full border border-purelis-line bg-white/60 transition hover:border-purelis-forest hover:bg-white"
          />
        </div>

        <div>
          <p className="eyebrow-purelis">Subscribe to our newsletter</p>
          <h3 className="mt-3 font-serif text-2xl font-semibold leading-snug text-purelis-ink">
            Slow beauty, thoughtful notes.
          </h3>
          <p className="mt-3 max-w-md text-xs leading-6 text-purelis-muted">
            New rituals, skin wisdom and members-only offers. No noise, only
            the good stuff.
          </p>
          <form onSubmit={subscribe} className="mt-5 flex max-w-md">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="min-w-0 flex-1 border border-purelis-line bg-white px-4 py-3 text-xs text-purelis-ink outline-none transition focus:border-purelis-forest"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-purelis-forest px-5 font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-purelis-forest-deep"
            >
              Subscribe
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        <div>
          <p className="eyebrow-purelis">Help & policies</p>
          <p className="mt-4 text-xs leading-6 text-purelis-muted">
            Shipping, returns, privacy and the small details that keep your
            experience clear.
          </p>
          <nav className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5" aria-label="Footer">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[11px] text-purelis-muted transition hover:text-purelis-forest"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-purelis-forest text-white">
        <div className="store-container flex flex-col items-center justify-between gap-2 py-3 text-center font-display text-[8.5px] uppercase tracking-[0.08em] sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Purelis Skincare. All rights reserved.</p>
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-white/75">
            <Link to="/info/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/info/terms" className="hover:text-white">Terms</Link>
            <Link to="/info/shipping" className="hover:text-white">Shipping</Link>
            <Link to="/info/contact" className="hover:text-white">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
