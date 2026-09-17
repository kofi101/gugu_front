import { Link } from "react-router";
import { LuImageOff } from "react-icons/lu";
import type { Product } from "../lib/types";
import { isInStock } from "../lib/parse";
import { Price } from "./Price";
import { Stars } from "./Stars";

export function ProductImage({
  src,
  alt,
  size = 480,
  className = "",
  eager = false,
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  eager?: boolean;
}) {
  if (!src) {
    return (
      <div className={`grid aspect-square place-items-center bg-paper-deep text-text-muted ${className}`}>
        <LuImageOff aria-hidden className="h-8 w-8" />
        <span className="sr-only">No photo</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`aspect-square w-full bg-paper-deep object-cover ${className}`}
    />
  );
}

export function ProductCard({ product, eager }: { product: Product; eager?: boolean }) {
  const inStock = isInStock(product);
  const lowStock = inStock && product.stockQuantity != null && product.stockQuantity <= 5;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-paper-line bg-white transition-shadow hover:shadow-lift">
      <div className="relative overflow-hidden">
        <ProductImage src={product.imageUrls[0]} alt="" eager={eager} className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
        {!inStock && (
          <span className="absolute left-2 top-2 rounded-sm bg-ink-950 px-2 py-0.5 text-xs font-semibold text-white">Sold out</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-[0.9375rem] font-medium leading-snug text-text">
          <Link to={`/p/${product.id}`} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-lg after:focus-visible:outline after:focus-visible:outline-[3px] after:focus-visible:outline-ink-700">
            {product.name}
          </Link>
        </h3>
        <Stars value={product.rating} count={product.reviewCount} />
        <div className="mt-auto pt-1">
          <Price product={product} />
          {lowStock && <p className="mt-1 text-xs font-medium text-thread-700">Only {product.stockQuantity} left</p>}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, eagerCount = 0 }: { products: Product[]; eagerCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} eager={i < eagerCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-lg border border-paper-line bg-white">
          <div className="skeleton aspect-square rounded-none" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-5 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProductRail({ products }: { products: Product[] }) {
  return (
    <ul className="scroll-rail">
      {products.map((p) => (
        <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23.5%]">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
