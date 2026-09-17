import { useParams } from "react-router";
import { getMerchant } from "../data/catalog";
import { useAsync } from "../hooks/useAsync";
import { plural } from "../lib/format";
import { Breadcrumbs } from "../components/Common";
import { ProductListing } from "../components/Listing";
import { Seo } from "../components/Seo";
import { ErrorState, PageLoader } from "../components/States";
import { Stars } from "../components/Stars";
import { NotFoundContent } from "./NotFound";

export default function Store() {
  const { merchantId = "" } = useParams();
  const merchant = useAsync(() => getMerchant(merchantId), [merchantId]);

  if (merchant.loading && !merchant.data) return <PageLoader />;
  if (merchant.error) {
    return (
      <div className="shell py-8">
        <ErrorState error={merchant.error} onRetry={merchant.reload} />
      </div>
    );
  }
  const m = merchant.data;
  if (!m) return <NotFoundContent />;

  return (
    <div className="pb-6">
      <Seo
        title={`${m.name}${m.tagline ? `: ${m.tagline}` : ""}`}
        description={m.description ?? `Shop ${m.name} on GUGU. Prices in cedis, pay on delivery or online.`}
        image={m.coverImageUrl ?? m.logoUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: m.name,
          description: m.description,
          image: m.logoUrl,
          ...(m.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: m.rating, bestRating: 5 } } : {}),
        }}
      />
      <div className="underprint-dark on-dark relative text-white">
        {m.coverImageUrl && (
          <img src={m.coverImageUrl} alt="" width={1600} height={400} className="absolute inset-0 h-full w-full object-cover opacity-25" />
        )}
        <div className="shell relative py-6 sm:py-10">
          <div className="[&_a]:text-ink-100 [&_span]:text-white [&_ol]:text-ink-200">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Stores", to: "/stores" }, { label: m.name }]} />
          </div>
          <div className="mt-5 flex items-center gap-4">
            {m.logoUrl ? (
              <img src={m.logoUrl} alt="" width={96} height={96} className="h-16 w-16 shrink-0 rounded-full border-2 border-white/80 bg-white object-cover sm:h-24 sm:w-24" />
            ) : (
              <span aria-hidden className="type-display grid h-16 w-16 shrink-0 place-items-center rounded-full bg-thread-300 text-3xl text-ink-950 sm:h-24 sm:w-24 sm:text-5xl">
                {m.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="type-display text-3xl sm:text-5xl">{m.name}</h1>
              {m.tagline && <p className="mt-1 text-ink-100 sm:text-lg">{m.tagline}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-100 [&_span]:text-white">
                <Stars value={m.rating} />
                {m.productCount != null && <span>{plural(m.productCount, "product")}</span>}
              </div>
            </div>
          </div>
          {m.description && <p className="mt-5 max-w-2xl leading-relaxed text-ink-100">{m.description}</p>}
        </div>
      </div>
      <div className="shell pt-6">
        <ProductListing merchantId={m.id} heading={m.name} />
      </div>
    </div>
  );
}
