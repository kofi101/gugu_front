import { formatMoney } from "../lib/format";
import { discountPercent, displayPrice, hasDiscount } from "../lib/parse";
import type { Product } from "../lib/types";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl sm:text-4xl",
};

/** Price printed like a denomination: expanded, tabular, with the old price struck through. */
export function Price({ product, size = "sm" }: { product: Pick<Product, "price" | "discountPrice">; size?: Size }) {
  const onSale = hasDiscount(product);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`type-title tabular text-ink-950 ${SIZE[size]}`}>
        {onSale && <span className="sr-only">Now </span>}
        {formatMoney(displayPrice(product))}
      </span>
      {onSale && (
        <>
          <s className="tabular text-sm text-text-muted">
            <span className="sr-only">was </span>
            {formatMoney(product.price)}
          </s>
          <span className="rounded-sm bg-serial px-1.5 py-0.5 text-xs font-bold text-white tabular">
            −{discountPercent(product)}%<span className="sr-only"> off</span>
          </span>
        </>
      )}
    </div>
  );
}
