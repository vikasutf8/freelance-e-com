import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Leaf,
  PackageCheck,
  Rabbit,
  Recycle,
  Search,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errors';
import { listProducts } from '../api/products';
import { EmptyState } from '../components/EmptyState';
import { HeroArtwork } from '../components/HeroArtwork';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Loading';
import { PromoArtwork } from '../components/PromoArtwork';
import type { Product } from '../types';
import { cn } from '../utils/cn';
import {
  getProductCategory,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from '../utils/product';

const trustItems = [
  {
    icon: Leaf,
    title: 'Natural Ingredients',
    text: 'Safe & toxin-free',
  },
  {
    icon: FlaskConical,
    title: 'Clinically Tested',
    text: 'Dermatologically proven',
  },
  {
    icon: Rabbit,
    title: 'Cruelty Free',
    text: 'We never test on animals',
  },
  {
    icon: Droplets,
    title: 'For All Skin Types',
    text: 'Gentle & effective care',
  },
];

const benefitItems = [
  { icon: Leaf, label: 'Clean Beauty' },
  { icon: Recycle, label: 'Sustainable' },
  { icon: PackageCheck, label: 'Eco Packaging' },
];

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name';

const PAGE_SIZE = 8;

function getVisiblePages(current: number, total: number): Array<number | '...'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages: Array<number | '...'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('...');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<ProductCategory | 'All'>('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [page, setPage] = useState(1);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listProducts(1, 100);
      setProducts(response.data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    const nextQuery = searchParams.get('q') ?? '';
    setQuery(nextQuery);
    setCategory('All');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [category, query, sort]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextProducts = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.description ?? '').toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        category === 'All' || getProductCategory(product.name) === category;
      return matchesQuery && matchesCategory;
    });

    return [...nextProducts].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return b.id - a.id;
    });
  }, [products, query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const selectCategory = (nextCategory: ProductCategory | 'All') => {
    setCategory(nextCategory);
    scrollToCollection();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setSort('featured');
    setPage(1);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-r from-purelis-sage-bg via-[#E3ECDB] to-purelis-sage-soft">
        <div className="pointer-events-none absolute inset-0 grain-overlay opacity-35" />
        <div className="pointer-events-none absolute -right-36 -top-36 h-[430px] w-[430px] rounded-full bg-white/25" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[340px] w-[340px] rounded-full bg-purelis-leaf/10 blur-2xl" />

        <div className="store-container relative grid items-center gap-8 py-10 md:min-h-[430px] md:grid-cols-[0.9fr_1.1fr] md:gap-3 md:py-8">
          <div className="relative z-10 max-w-xl animate-fade-up">
            <p className="eyebrow-purelis flex items-center gap-2">
              <span className="h-px w-7 bg-purelis-leaf" />
              The Purelis edit
            </p>
            <h1 className="mt-5 font-display text-[38px] font-bold uppercase leading-[1.03] tracking-[-0.035em] text-purelis-ink sm:text-[48px] lg:text-[56px]">
              Naturally pure.
              <span className="mt-1 block text-purelis-forest">Beautifully you.</span>
            </h1>
            <p className="mt-5 max-w-md text-[13px] leading-6 text-purelis-muted sm:text-sm sm:leading-7">
              Clean, effective and cruelty-free skincare enriched with nature&apos;s
              finest ingredients. Gentle rituals for skin that feels like you.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button type="button" onClick={scrollToCollection} className="btn-purelis">
                Shop now
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="mt-7 flex items-center gap-4 text-[9px] font-medium uppercase tracking-[0.1em] text-purelis-leaf">
              <span>Vegan</span>
              <span className="h-1 w-1 rounded-full bg-purelis-leaf/40" />
              <span>Cruelty-free</span>
              <span className="h-1 w-1 rounded-full bg-purelis-leaf/40" />
              <span>Made with care</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] animate-fade-in md:-mr-12 md:max-w-none lg:-mr-16">
            <div className="absolute inset-x-[13%] top-[24%] h-[52%] rounded-full bg-white/35 blur-2xl" />
            <HeroArtwork className="relative h-auto w-full drop-shadow-[0_20px_30px_rgba(31,74,18,0.04)]" />
          </div>
        </div>
      </section>

      <section className="border-y border-purelis-line bg-purelis-cream">
        <div className="store-container grid grid-cols-2 gap-x-5 gap-y-6 py-6 md:grid-cols-4 md:py-5">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-purelis-line bg-white/70 text-purelis-leaf">
                <Icon size={19} strokeWidth={1.35} />
              </span>
              <div>
                <p className="font-display text-[9px] font-semibold uppercase tracking-[0.09em] text-purelis-ink">
                  {title}
                </p>
                <p className="mt-1 text-[10px] text-purelis-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white pb-16 md:pb-20">
        <div className="store-container">
          <div className="overflow-hidden bg-purelis-sage-soft">
            <div className="grid items-center md:grid-cols-[1fr_0.9fr]">
              <div className="px-7 py-10 sm:px-10 md:py-12 lg:px-14">
                <p className="font-display text-[10px] font-semibold uppercase leading-5 tracking-[0.12em] text-purelis-forest">
                  Good for your skin.
                  <br />
                  Good for the planet.
                </p>
                <h2 className="mt-4 font-serif text-[34px] leading-[1.08] text-purelis-ink sm:text-[42px]">
                  Up to 25% off
                  <br />
                  <span className="italic">sitewide</span>
                </h2>
                <p className="mt-4 max-w-sm text-xs leading-6 text-purelis-muted">
                  A gentle reset for your shelf, your skin and your everyday.
                  Thoughtfully priced, never rushed.
                </p>
                <button
                  type="button"
                  onClick={() => selectCategory('All')}
                  className="btn-purelis mt-6"
                >
                  Explore offers
                  <ArrowRight size={14} />
                </button>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-purelis-leaf/15 pt-5">
                  {benefitItems.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="flex items-center gap-2 font-display text-[8px] font-semibold uppercase tracking-[0.1em] text-purelis-leaf"
                    >
                      <Icon size={14} strokeWidth={1.5} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative -mb-6 flex h-full min-h-[250px] items-end justify-center px-4 pt-4 md:min-h-[330px] md:px-2">
                <div className="absolute right-6 top-7 h-36 w-36 rounded-full border border-white/40" />
                <PromoArtwork className="relative h-auto w-full max-w-[540px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collection" className="scroll-mt-28 border-t border-purelis-line bg-[#FCFCF7] py-16 md:py-20">
        <div className="store-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow-purelis">The full collection</p>
              <h2 className="mt-3 font-serif text-[28px] font-semibold uppercase tracking-[0.035em] text-purelis-ink md:text-[32px]">
                {category === 'All' ? 'New arrivals' : category}
              </h2>
              <p className="mt-2 text-xs text-purelis-muted">
                {isLoading
                  ? 'Gathering the latest rituals...'
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} to discover`}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="self-start border-b border-purelis-forest/40 pb-1 font-display text-[9px] font-semibold uppercase tracking-[0.14em] text-purelis-forest transition hover:border-purelis-forest sm:self-auto"
            >
              View all
            </button>
          </div>

          <div className="mt-7 flex flex-col gap-4 border-y border-purelis-line py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-0.5">
              {(['All', ...PRODUCT_CATEGORIES] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={cn(
                    'shrink-0 border px-4 py-2 font-display text-[8.5px] font-semibold uppercase tracking-[0.1em] transition',
                    category === item
                      ? 'border-purelis-forest bg-purelis-forest text-white'
                      : 'border-purelis-line bg-white text-purelis-muted hover:border-purelis-forest/40 hover:text-purelis-forest',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-10 min-w-0 items-center gap-2 border border-purelis-line bg-white px-3 sm:w-52">
                <Search size={14} className="shrink-0 text-purelis-leaf" />
                <span className="sr-only">Search the collection</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the collection"
                  className="min-w-0 flex-1 bg-transparent text-[11px] text-purelis-ink outline-none"
                />
              </label>
              <label className="flex h-10 items-center gap-2 border border-purelis-line bg-white px-3">
                <SlidersHorizontal size={13} className="shrink-0 text-purelis-leaf" />
                <span className="sr-only">Sort products</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="bg-transparent font-display text-[9px] font-semibold uppercase tracking-[0.08em] text-purelis-ink outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-9">
            {isLoading ? (
              <ProductGridSkeleton />
            ) : error ? (
              <EmptyState
                icon={SearchX}
                title="The shelf is out of reach"
                message={error}
                action={
                  <button type="button" onClick={() => void loadProducts()} className="btn-purelis">
                    Try again
                  </button>
                }
              />
            ) : pageProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
                {pageProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title={query ? 'No rituals found' : 'Your first ritual awaits'}
                message={
                  query || category !== 'All'
                    ? 'Try a different search or explore the full collection.'
                    : 'Our shelves are being prepared. Check back shortly, or ask an administrator to add the first product.'
                }
                action={
                  query || category !== 'All' ? (
                    <button type="button" onClick={clearFilters} className="btn-purelis">
                      Clear filters
                    </button>
                  ) : (
                    <Link to="/info/contact" className="btn-purelis-light">
                      Contact us
                    </Link>
                  )
                }
              />
            )}
          </div>

          {!isLoading && !error && totalPages > 1 ? (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Product pagination">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="grid h-9 w-9 place-items-center border border-purelis-line bg-white text-purelis-ink transition hover:border-purelis-forest hover:text-purelis-forest disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={15} />
              </button>
              {getVisiblePages(safePage, totalPages).map((item, index) =>
                item === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-1 text-xs text-purelis-muted">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    aria-label={`Page ${item}`}
                    aria-current={safePage === item ? 'page' : undefined}
                    className={cn(
                      'grid h-9 min-w-9 place-items-center border px-2 text-[11px] font-medium transition',
                      safePage === item
                        ? 'border-purelis-forest bg-purelis-forest text-white'
                        : 'border-purelis-line bg-white text-purelis-ink hover:border-purelis-forest hover:text-purelis-forest',
                    )}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
                className="grid h-9 w-9 place-items-center border border-purelis-line bg-white text-purelis-ink transition hover:border-purelis-forest hover:text-purelis-forest disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={15} />
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </div>
  );
}
