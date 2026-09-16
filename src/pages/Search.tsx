import { Link, useSearchParams } from "react-router";
import { LuSearchX } from "react-icons/lu";
import { search } from "../data/catalog";
import { useAsync } from "../hooks/useAsync";
import { plural } from "../lib/format";
import { MerchantList } from "../components/MerchantList";
import { ProductGrid, ProductGridSkeleton } from "../components/ProductCard";
import { Seo } from "../components/Seo";
import { EmptyState, ErrorState } from "../components/States";

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const result = useAsync(() => search(q), [q]);
  const total = (result.data?.products.length ?? 0) + (result.data?.merchants.length ?? 0);

  return (
    <div className="shell py-6 sm:py-8">
      <Seo title={q ? `Search: ${q}` : "Search"} description={`Search results for “${q}” on GUGU.`} noindex />
      <h1 className="type-title text-2xl text-ink-950 sm:text-3xl">
        {q ? (
          <>
            Results for <span className="break-words">“{q}”</span>
          </>
        ) : (
          "Search GUGU"
        )}
      </h1>
      <div aria-live="polite" className="mt-6">
        {!q ? (
          <EmptyState icon={<LuSearchX />} title="Type what you're looking for">
            Use the search box above to find products and stores.
          </EmptyState>
        ) : result.error ? (
          <ErrorState error={result.error} onRetry={result.reload} title="Search didn't finish" />
        ) : result.loading ? (
          <ProductGridSkeleton count={8} />
        ) : total === 0 ? (
          <EmptyState
            icon={<LuSearchX />}
            title="No matches"
            action={
              <Link to="/" className="btn btn-secondary">
                Browse categories
              </Link>
            }
          >
            Check the spelling, or try a shorter word like “shoe” instead of “shoes for men”.
          </EmptyState>
        ) : (
          <>
            <p className="sr-only">{plural(total, "result")}</p>
            {result.data!.merchants.length > 0 && (
              <section aria-labelledby="store-results" className="mb-10">
                <h2 id="store-results" className="mb-3 text-lg font-bold text-ink-950">
                  Stores
                </h2>
                <MerchantList merchants={result.data!.merchants} />
              </section>
            )}
            {result.data!.products.length > 0 && (
              <section aria-labelledby="product-results">
                <h2 id="product-results" className="mb-3 text-lg font-bold text-ink-950">
                  {plural(result.data!.products.length, "product")}
                </h2>
                <ProductGrid products={result.data!.products} eagerCount={4} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
