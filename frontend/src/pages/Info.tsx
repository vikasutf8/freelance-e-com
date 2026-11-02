import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '../utils/cn';

interface InfoSection {
  heading: string;
  body: string[];
}

interface InfoContent {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
}

const infoPages: Record<string, InfoContent> = {
  shipping: {
    eyebrow: 'Customer care',
    title: 'Shipping & returns.',
    intro:
      'A simple, transparent experience from our shelf to your bathroom cabinet. Here is everything you need to know.',
    sections: [
      {
        heading: 'Shipping',
        body: [
          'Standard delivery is complimentary on orders over ₹499. Orders are usually packed within 1–2 business days and delivered in 3–6 business days.',
          'Every order is packed in recyclable materials. If your parcel arrives damaged, keep the packaging and contact our care team so we can make it right.',
        ],
      },
      {
        heading: 'Returns',
        body: [
          'Unopened products can be returned within 14 days of delivery. For hygiene reasons, opened skincare cannot be returned unless it arrived damaged or incorrect.',
          'Contact our care team with your order reference and a photo of the item. We will guide you through the next step.',
        ],
      },
      {
        heading: 'Order updates',
        body: [
          'Once your order is placed, your payment reference is saved to your account. Reach out to customer care with the reference if you need help with a delivery.',
        ],
      },
    ],
  },
  privacy: {
    eyebrow: 'Privacy',
    title: 'Your information, held gently.',
    intro:
      'We keep the information we collect to a minimum and use it only to run your account, process your bag and make your experience a little better.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'When you create an account we store your email address, a securely hashed password and your account role. When you shop, we store your cart and payment records so checkout stays consistent.',
          'We do not store card details. UPI payments in this experience are simulated for demonstration.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'Your information is used to authenticate you, manage your bag, process payments and provide support. We do not sell personal information.',
          'You can ask us to delete your account at any time. Deleting a client account removes its cart and payment records.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'You control the email address linked to your account and can sign out at any time. For privacy questions, contact customer care through the details on our contact page.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'The fine print',
    title: 'Terms & conditions.',
    intro:
      'These terms keep the Purelis experience clear for everyone. By creating an account or placing an order, you agree to the points below.',
    sections: [
      {
        heading: 'Accounts',
        body: [
          'You are responsible for keeping your sign-in details private. Accounts are for individual use and must not be shared or used to disrupt the store.',
          'Registrations may close when the member limit is reached. We reserve the right to remove accounts that violate these terms.',
        ],
      },
      {
        heading: 'Orders and payments',
        body: [
          'Prices are shown in Indian rupees and include applicable taxes unless stated otherwise. Stock is checked again at checkout and may change before payment is complete.',
          'This storefront uses a simulated UPI payment flow for demonstration. No real money is transferred. A successful simulation reduces stock and clears the bag.',
        ],
      },
      {
        heading: 'Product information',
        body: [
          'Product descriptions are provided for general information and are not medical advice. Patch test new products and discontinue use if irritation occurs.',
          'We may update products, availability and these terms as the store evolves.',
        ],
      },
    ],
  },
  contact: {
    eyebrow: 'Here for you',
    title: 'Let’s talk skin.',
    intro:
      'A question about an ingredient, your account or your order? Our small care team is happy to help.',
    sections: [
      {
        heading: 'Customer care',
        body: [
          'Email us at care@purelis.example and we will reply within two business days. Include your account email or payment reference when relevant.',
          'Care hours: Monday to Friday, 10:00–18:00 IST. We take a little longer to reply on weekends and public holidays.',
        ],
      },
      {
        heading: 'A note on ingredients',
        body: [
          'Tell us about your skin type, current routine and any sensitivities. We can help you choose a gentle starting point, though we cannot provide medical advice.',
        ],
      },
    ],
  },
};

const infoLinks = [
  { slug: 'shipping', label: 'Shipping & returns' },
  { slug: 'contact', label: 'Contact us' },
  { slug: 'privacy', label: 'Privacy policy' },
  { slug: 'terms', label: 'Terms & conditions' },
];

export function Info() {
  const { slug = 'shipping' } = useParams();
  const content = infoPages[slug];

  if (!content) {
    return (
      <div className="store-container py-20 text-center">
        <p className="eyebrow-purelis">A quiet detour</p>
        <h1 className="mt-3 font-serif text-4xl text-purelis-ink">Page not found.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-purelis-muted">
          This page may have moved. Let us take you back to the collection.
        </p>
        <Link to="/" className="btn-purelis mt-7">
          Return home
        </Link>
      </div>
    );
  }

  const { eyebrow, title, intro } = content;

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-purelis-line bg-purelis-sage-soft">
        <div className="pointer-events-none absolute inset-0 grain-overlay opacity-25" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/45" />
        <div className="store-container relative py-14 md:py-20">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
            <Link to="/" className="transition hover:text-purelis-forest">Home</Link>
            <span>/</span>
            <span>{eyebrow}</span>
          </div>
          <p className="eyebrow-purelis mt-8">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-[38px] leading-[1.08] text-purelis-ink sm:text-[48px] md:text-[56px]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-purelis-muted">
            {intro}
          </p>
        </div>
      </section>

      <div className="store-container grid gap-12 py-12 md:py-16 lg:grid-cols-[220px_1fr] lg:gap-20">
        <aside className="h-fit lg:sticky lg:top-28">
          <p className="font-display text-[8.5px] font-semibold uppercase tracking-[0.16em] text-purelis-leaf">
            Explore
          </p>
          <nav className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-0" aria-label="Information pages">
            {infoLinks.map((link) => (
              <Link
                key={link.slug}
                to={`/info/${link.slug}`}
                className={cn(
                  'border border-purelis-line px-3 py-2 text-[11px] transition lg:border-0 lg:border-b lg:px-0 lg:py-3',
                  slug === link.slug
                    ? 'border-purelis-forest bg-purelis-forest text-white lg:border-purelis-forest lg:bg-transparent lg:font-medium lg:text-purelis-forest'
                    : 'text-purelis-muted hover:text-purelis-forest',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-7 hidden border border-purelis-line bg-purelis-cream/60 p-5 lg:block">
            <Mail size={17} className="text-purelis-leaf" />
            <p className="mt-3 font-serif text-lg text-purelis-ink">Need a hand?</p>
            <p className="mt-1.5 text-[10px] leading-5 text-purelis-muted">
              Our care team is here Monday to Friday, 10:00–18:00 IST.
            </p>
            <Link
              to="/info/contact"
              className="mt-3 inline-flex items-center gap-1.5 border-b border-purelis-forest/35 pb-1 font-display text-[8px] font-semibold uppercase tracking-[0.12em] text-purelis-forest"
            >
              Contact us
              <ArrowRight size={10} />
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          {content ? (
            <div>
              {slug === 'contact' ? (
                <div className="mb-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Mail, label: 'Email', value: 'care@purelis.example' },
                    { icon: Clock3, label: 'Care hours', value: 'Mon–Fri · 10–18 IST' },
                    { icon: MapPin, label: 'Studio', value: 'Bengaluru, India' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="border border-purelis-line bg-purelis-cream/55 p-4">
                      <Icon size={17} strokeWidth={1.4} className="text-purelis-leaf" />
                      <p className="mt-3 font-display text-[8px] font-semibold uppercase tracking-[0.12em] text-purelis-muted">
                        {label}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-purelis-ink">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="space-y-9">
                {content.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-serif text-[26px] text-purelis-ink">
                      {section.heading}
                    </h2>
                    <div className="mt-3 space-y-3.5">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="max-w-2xl text-[13px] leading-7 text-purelis-muted">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-purelis-line pt-6">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.08em] text-purelis-muted">
                  <ShieldCheck size={14} className="text-purelis-leaf" />
                  Made with care by Purelis
                </div>
                <Link
                  to="/#collection"
                  className="inline-flex items-center gap-2 font-display text-[8.5px] font-semibold uppercase tracking-[0.12em] text-purelis-forest hover:underline"
                >
                  Explore the collection
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
