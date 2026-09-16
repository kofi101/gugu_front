import type { ReactNode } from "react";
import { Link } from "react-router";
import { LuBanknote, LuChevronRight, LuCreditCard, LuSmartphone } from "react-icons/lu";
import { getActiveBanners, getDiscountedProducts, getMerchants, getPopularProducts } from "../data/catalog";
import { useAsync } from "../hooks/useAsync";
import { useCategories } from "../hooks/useCategories";
import type { Banner, Merchant } from "../lib/types";
import { MerchantList } from "../components/MerchantList";
import { Guilloche } from "../components/Guilloche";
import { ProductGrid, ProductGridSkeleton, ProductRail } from "../components/ProductCard";
import { Seo } from "../components/Seo";
import { SITE_URL } from "../lib/site";
import { ErrorState } from "../components/States";

function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const h = hex.replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    const [r, g, bl] = [0, 2, 4].map((i) => {
      const v = parseInt(h.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const x = lum(a);
  const y = lum(b);
  if (x == null || y == null) return 0;
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function Section({ id, title, action, children }: { id: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="shell mt-12 sm:mt-16">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
        <h2 id={id} className="type-title text-2xl text-ink-950 sm:text-[1.75rem]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-[32px] shrink-0 items-center gap-1 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:underline">
      {children}
      <LuChevronRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function BannerNotice({ banner }: { banner: Banner }) {
  const bg = banner.backgroundColorHex;
  const fg = banner.textColorHex;
  const custom = bg && fg && contrast(bg, fg) >= 4.5 ? { backgroundColor: bg, color: fg } : undefined;
  const body = (
    <>
      {banner.prefixImageUrl && <img src={banner.prefixImageUrl} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 shrink-0 rounded object-cover" />}
      <span className="min-w-0">
        <span className="block font-semibold">{banner.title}</span>
        {banner.description && <span className="block text-sm opacity-90">{banner.description}</span>}
      </span>
      {banner.actionKind !== "none" && <LuChevronRight aria-hidden className="ml-auto h-5 w-5 shrink-0" />}
    </>
  );
  const cls = `flex min-h-[64px] w-72 shrink-0 snap-start items-center gap-3 rounded-lg px-4 py-3 sm:w-auto sm:flex-1 ${custom ? "" : "bg-ink-100 text-ink-950"}`;
  if (banner.actionKind === "inAppRoute" && banner.actionRoute?.startsWith("/")) {
    return <Link to={banner.actionRoute} className={`${cls} hover:brightness-95`} style={custom}>{body}</Link>;
  }
  if (banner.actionKind === "externalUrl" && banner.actionUrl?.startsWith("https://")) {
    return <a href={banner.actionUrl} rel="noopener noreferrer" target="_blank" className={`${cls} hover:brightness-95`} style={custom}>{body}<span className="sr-only"> (opens in a new tab)</span></a>;
  }
  return <div className={cls} style={custom}>{body}</div>;
}

function Hero({ merchants }: { merchants: Merchant[] }) {
  const micro = (merchants.length ? merchants.map((m) => m.name) : ["GUGU", "Shops from across Ghana"]).join("  ✦  ").toUpperCase();
  const microLine = Array.from({ length: 8 }, () => micro).join("  ✦  ");
  return (
    <section aria-labelledby="hero-title" className="shell pt-4 sm:pt-6">
      <div className="underprint-dark on-dark relative isolate overflow-hidden rounded-xl text-white">
        <p aria-hidden className="microprint absolute inset-x-0 top-0 border-b border-white/10 px-3 py-1.5 text-ink-300">{microLine}</p>
        <p aria-hidden className="microprint absolute inset-x-0 bottom-0 border-t border-white/10 px-3 py-1.5 text-ink-300">{microLine}</p>
        <div className="grid items-center gap-2 px-5 pb-10 pt-10 sm:px-10 md:grid-cols-[1.3fr_1fr] md:py-12 lg:px-14">
          <div className="relative z-10">
            <h1 id="hero-title" className="type-display max-w-[15ch] text-[2.125rem] sm:text-5xl lg:text-6xl">
              Shops from across Ghana. Pay when it arrives.
            </h1>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-100 sm:text-lg">
              Browse independent stores, order in cedis, then pay cash or mobile money at your door, or pay online with ExpressPay.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#categories" className="btn btn-thread">
                Browse categories
              </a>
              <Link to="/stores" className="btn bg-white/10 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20">
                See all stores
              </Link>
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute -right-28 top-8 -z-0 w-[22rem] text-ink-400 opacity-30 md:relative md:right-auto md:top-auto md:w-full md:opacity-100">
            <div className="relative mx-auto aspect-square max-w-[22rem]">
              <Guilloche className="absolute inset-0 h-full w-full" />
              <span className="type-display absolute inset-0 hidden place-items-center text-6xl text-thread-300 md:grid lg:text-7xl">GH₵</span>
            </div>
          </div>
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 px-1 text-sm text-text-muted" aria-label="Ways to pay">
        <li className="flex items-center gap-2"><LuBanknote aria-hidden className="h-4 w-4 text-ink-700" /> Cash on delivery</li>
        <li className="flex items-center gap-2"><LuSmartphone aria-hidden className="h-4 w-4 text-ink-700" /> Mobile money on delivery</li>
        <li className="flex items-center gap-2"><LuCreditCard aria-hidden className="h-4 w-4 text-ink-700" /> ExpressPay online</li>
      </ul>
    </section>
  );
}

export default function Home() {
  const categories = useCategories();
  const banners = useAsync(getActiveBanners, []);
  const merchants = useAsync(() => getMerchants(12), []);
  const deals = useAsync(() => getDiscountedProducts(8), []);
  const popular = useAsync(() => getPopularProducts(8), []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GUGU",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Seo title="GUGU" canonicalPath="/" jsonLd={jsonLd} />
      <Hero merchants={merchants.data ?? []} />

      {banners.data && banners.data.length > 0 && (
        <section aria-label="Notices" className="shell mt-6">
          <div className="scroll-rail sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {banners.data.slice(0, 3).map((b) => (
              <BannerNotice key={b.id} banner={b} />
            ))}
          </div>
        </section>
      )}

      <Section id="categories" title="Shop by category">
        {categories.error ? (
          <ErrorState error={categories.error} onRetry={categories.reload} title="Categories didn't load" />
        ) : categories.loading && !categories.data ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => <li key={i} className="skeleton h-24" />)}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(categories.data ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/c/${c.id}`}
                  className="group relative flex h-24 items-end overflow-hidden rounded-lg border border-paper-line bg-white p-3 hover:border-ink-700 sm:h-28"
                >
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" width={96} height={96} loading="lazy" className="absolute right-2 top-2 h-12 w-12 rounded object-cover" />
                  ) : (
                    <span aria-hidden className="type-display absolute -right-1 -top-3 text-7xl text-ink-100 transition-colors group-hover:text-ink-200">
                      {c.name.charAt(0)}
                    </span>
                  )}
                  <span className="relative font-semibold leading-tight text-ink-950">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {(deals.loading || (deals.data && deals.data.length > 0)) && (
        <Section id="deals" title="Price drops">
          {deals.loading ? <ProductGridSkeleton count={4} /> : <ProductRail products={deals.data ?? []} />}
        </Section>
      )}
      {deals.error != null && (
        <div className="shell mt-6">
          <ErrorState error={deals.error} onRetry={deals.reload} title="Deals didn't load" />
        </div>
      )}

      <Section id="popular" title="Popular right now">
        {popular.error ? (
          <ErrorState error={popular.error} onRetry={popular.reload} title="Products didn't load" />
        ) : popular.loading ? (
          <ProductGridSkeleton count={8} />
        ) : popular.data && popular.data.length > 0 ? (
          <ProductGrid products={popular.data} />
        ) : (
          <p className="text-text-muted">No products are listed yet. Check back soon.</p>
        )}
      </Section>

      <Section id="stores" title="Stores on GUGU" action={<MoreLink to="/stores">All stores</MoreLink>}>
        {merchants.error ? (
          <ErrorState error={merchants.error} onRetry={merchants.reload} title="Stores didn't load" />
        ) : merchants.loading ? (
          <div className="skeleton h-28" aria-hidden />
        ) : (
          <MerchantList merchants={(merchants.data ?? []).slice(0, 8)} />
        )}
      </Section>

      <section aria-labelledby="sell-title" className="shell mt-16">
        <div className="underprint relative overflow-hidden rounded-xl border border-paper-line px-5 py-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-10">
          <div className="thread absolute inset-y-0 left-0 w-1.5" aria-hidden />
          <div>
            <h2 id="sell-title" className="type-title text-2xl text-ink-950">Run a shop? Sell on GUGU.</h2>
            <p className="mt-2 max-w-xl text-text-muted">Apply with your business details. Once approved, you list products and manage orders from the GUGU merchant dashboard.</p>
          </div>
          <Link to="/sell" className="btn btn-primary mt-5 shrink-0 sm:mt-0">
            Apply to sell
          </Link>
        </div>
      </section>
    </>
  );
}
