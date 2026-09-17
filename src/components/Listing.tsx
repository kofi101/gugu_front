import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { LuChevronRight, LuSearchX, LuSlidersHorizontal } from "react-icons/lu";
import { listProducts, SORT_LABELS } from "../data/catalog";
import { SORTS, useListingParams, withParams } from "../hooks/useListingParams";
import { useAsync } from "../hooks/useAsync";
import type { SubCategory } from "../lib/types";
import { ProductGrid, ProductGridSkeleton } from "./ProductCard";
import { EmptyState, ErrorState } from "./States";

export function ProductListing({
  categoryId,
  merchantId,
  subcategories = [],
  heading,
}: {
  categoryId?: string;
  merchantId?: string;
  subcategories?: SubCategory[];
  heading: string;
}) {
  const { params, sub, sort, min, max, after } = useListingParams();
  const [, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = useAsync(
    () => listProducts({ categoryId, merchantId, subCategoryId: sub, sort, minPrice: min, maxPrice: max, after }),
    [categoryId, merchantId, sub, sort, min, max, after],
  );

  function applyPrice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const lo = String(fd.get("min") ?? "").trim();
    const hi = String(fd.get("max") ?? "").trim();
    setParams(new URLSearchParams(withParams(params, { min: lo || undefined, max: hi || undefined }).slice(1)));
  }

  const filtered = Boolean(sub || min != null || max != null);

  return (
    <div>
      {subcategories.length > 0 && (
        <nav aria-label={`${heading} subcategories`} className="mb-4">
          <ul className="scroll-rail sm:mx-0 sm:flex-wrap sm:px-0">
            <li className="shrink-0">
              <Link
                to={withParams(params, { sub: undefined })}
                aria-current={!sub ? "page" : undefined}
                className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${!sub ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-ink-900 ring-paper-line hover:ring-ink-700"}`}
              >
                All
              </Link>
            </li>
            {subcategories.map((s) => (
              <li key={s.id} className="shrink-0">
                <Link
                  to={withParams(params, { sub: s.id })}
                  aria-current={sub === s.id ? "page" : undefined}
                  className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${sub === s.id ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-ink-900 ring-paper-line hover:ring-ink-700"}`}
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mb-5 flex flex-wrap items-end gap-3 border-y border-paper-line py-3">
        <div>
          <label htmlFor="sort" className="field-label text-xs">
            Sort by
          </label>
          <select
            id="sort"
            className="input h-10 min-h-[40px] w-auto py-0 pr-9 text-sm"
            value={(min != null || max != null) && (sort === "newest" || sort === "top-rated") ? "price-asc" : sort}
            onChange={(e) => setParams(new URLSearchParams(withParams(params, { sort: e.target.value === "recommended" ? undefined : e.target.value }).slice(1)))}
          >
            {SORTS.filter((s) => !(min != null || max != null) || s === "recommended" || s.startsWith("price")).map((s) => (
              <option key={s} value={s}>
                {SORT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm h-10 md:hidden"
          aria-expanded={filtersOpen}
          aria-controls="price-filter"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <LuSlidersHorizontal aria-hidden className="h-4 w-4" /> Price
        </button>
        <form
          id="price-filter"
          onSubmit={applyPrice}
          className={`${filtersOpen ? "flex" : "hidden"} w-full flex-wrap items-end gap-2 md:flex md:w-auto`}
          key={`${min}-${max}`}
        >
          <div>
            <label htmlFor="min" className="field-label text-xs">
              Min price (GH₵)
            </label>
            <input id="min" name="min" type="number" inputMode="decimal" min={0} step="any" defaultValue={min ?? ""} className="input h-10 min-h-[40px] w-28 text-sm" />
          </div>
          <div>
            <label htmlFor="max" className="field-label text-xs">
              Max price (GH₵)
            </label>
            <input id="max" name="max" type="number" inputMode="decimal" min={0} step="any" defaultValue={max ?? ""} className="input h-10 min-h-[40px] w-28 text-sm" />
          </div>
          <button type="submit" className="btn btn-primary btn-sm h-10">
            Apply
          </button>
        </form>
        {filtered && (
          <Link to={withParams(params, { sub: undefined, min: undefined, max: undefined })} className="link ml-auto text-sm">
            Clear filters
          </Link>
        )}
      </div>

      <h2 className="sr-only">Products</h2>
      <div aria-live="polite" aria-busy={page.loading}>
        {page.error ? (
          <ErrorState error={page.error} onRetry={page.reload} title="Products didn't load" />
        ) : page.loading ? (
          <ProductGridSkeleton count={8} />
        ) : page.data && page.data.items.length > 0 ? (
          <>
            <ProductGrid products={page.data.items} eagerCount={after ? 0 : 4} />
            <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-between gap-3">
              {after ? (
                <Link to={withParams(params, {})} className="btn btn-secondary">
                  Back to first page
                </Link>
              ) : (
                <span />
              )}
              {page.data.nextCursor && (
                <Link to={withParams(params, { after: page.data.nextCursor })} className="btn btn-primary" rel="next">
                  Next page <LuChevronRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
            </nav>
          </>
        ) : (
          <EmptyState
            icon={<LuSearchX />}
            title={filtered ? "Nothing matches these filters" : "No products here yet"}
            action={
              filtered ? (
                <Link to={withParams(params, { sub: undefined, min: undefined, max: undefined })} className="btn btn-secondary">
                  Clear filters
                </Link>
              ) : (
                <Link to="/" className="btn btn-secondary">
                  Back to home
                </Link>
              )
            }
          >
            {filtered ? "Try a wider price range or another subcategory." : "Stores are still adding products. Check back soon."}
          </EmptyState>
        )}
      </div>
    </div>
  );
}
