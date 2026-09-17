import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { LuCheck, LuHeart, LuShieldCheck, LuShoppingBag, LuStore, LuTruck } from "react-icons/lu";
import { getCategory, getMerchant, getProduct, getRelatedProducts } from "../data/catalog";
import { addToWishlist, removeFromWishlist, watchWishlistItem } from "../data/account";
import { useAuth } from "../context/auth";
import { lineCap, useCart } from "../context/cart";
import { useAsync } from "../hooks/useAsync";
import { errorMessage } from "../lib/errors";
import { displayPrice, isInStock } from "../lib/parse";
import type { Product } from "../lib/types";
import { Breadcrumbs, QuantityStepper } from "../components/Common";
import { Price } from "../components/Price";
import { ProductImage, ProductRail } from "../components/ProductCard";
import { Reviews } from "../components/Reviews";
import { Seo } from "../components/Seo";
import { SITE_URL } from "../lib/site";
import { ErrorState, PageLoader } from "../components/States";
import { Stars } from "../components/Stars";
import { NotFoundContent } from "./NotFound";

function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const images = product.imageUrls;
  const current = images[Math.min(index, Math.max(0, images.length - 1))];
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-paper-line bg-white">
        <ProductImage src={current} alt={images.length > 1 ? `${product.name}, photo ${index + 1} of ${images.length}` : product.name} size={900} eager />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">
          {images.map((src, i) => (
            <li key={src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                className={`block h-16 w-16 overflow-hidden rounded-md border-2 sm:h-20 sm:w-20 ${i === index ? "border-ink-700" : "border-transparent hover:border-paper-line"}`}
              >
                <img src={src} alt="" width={80} height={80} loading="lazy" className="h-full w-full object-cover" />
                <span className="sr-only">Show photo {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WishlistButton({ product }: { product: Product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    return watchWishlistItem(user.uid, product.id, setSaved);
  }, [user, product.id]);

  async function toggle() {
    if (!user) {
      navigate(`/signin?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await removeFromWishlist(user.uid, product.id);
        toast.info("Removed from saved items");
      } else {
        await addToWishlist(user.uid, product);
        toast.success("Saved for later");
      }
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't update saved items. Try again."));
    } finally {
      setBusy(false);
    }
  }

  const isSaved = Boolean(user) && saved;
  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={isSaved} className="btn btn-secondary h-12 px-4">
      <LuHeart aria-hidden className={`h-5 w-5 ${isSaved ? "fill-serial text-serial" : ""}`} />
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}

function BuyBox({ product }: { product: Product }) {
  const cart = useCart();
  const inStock = isInStock(product);
  const inCart = cart.lines.find((l) => l.productId === product.id)?.quantity ?? 0;
  const max = Math.max(1, lineCap(product.stockQuantity) - inCart);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  async function add() {
    setAdding(true);
    try {
      await cart.add(product, Math.min(qty, max));
      toast.success(
        <span>
          Added to cart.{" "}
          <Link to="/cart" className="font-semibold underline">
            View cart
          </Link>
        </span>,
      );
      setQty(1);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't add this to your cart. Try again."));
    } finally {
      setAdding(false);
    }
  }

  const stockText = !inStock
    ? "Out of stock"
    : product.stockQuantity == null
      ? "In stock"
      : product.stockQuantity <= 5
        ? `Only ${product.stockQuantity} left`
        : `${product.stockQuantity} in stock`;

  return (
    <div className="space-y-4">
      <Price product={product} size="lg" />
      <p className={`flex items-center gap-2 text-sm font-semibold ${inStock ? (product.stockQuantity != null && product.stockQuantity <= 5 ? "text-thread-700" : "text-leaf") : "text-serial"}`}>
        {inStock && <LuCheck aria-hidden className="h-4 w-4" />}
        {stockText}
      </p>
      {inStock ? (
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper label="Quantity" value={Math.min(qty, max)} max={max} onChange={setQty} disabled={adding || inCart >= lineCap(product.stockQuantity)} />
          <button type="button" className="btn btn-primary h-12 flex-1 sm:flex-none sm:px-8" onClick={add} disabled={adding || inCart >= lineCap(product.stockQuantity)}>
            <LuShoppingBag aria-hidden className="h-5 w-5" />
            {adding ? "Adding…" : "Add to cart"}
          </button>
          <WishlistButton product={product} />
        </div>
      ) : (
        <WishlistButton product={product} />
      )}
      {inCart > 0 && (
        <p className="text-sm text-text-muted">
          {inCart} already in your{" "}
          <Link to="/cart" className="link">
            cart
          </Link>
          .
        </p>
      )}
      <ul className="space-y-2 border-t border-paper-line pt-4 text-sm text-text-muted">
        <li className="flex gap-2">
          <LuTruck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-700" /> Pay cash or mobile money on delivery, or pay online with ExpressPay.
        </li>
        <li className="flex gap-2">
          <LuShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-700" /> The final price and stock are confirmed when you place your order.
        </li>
      </ul>
    </div>
  );
}

export default function ProductPage() {
  const { productId = "" } = useParams();
  const data = useAsync(async () => {
    const product = await getProduct(productId);
    if (!product) return null;
    const [merchant, category] = await Promise.all([
      product.merchantId ? getMerchant(product.merchantId).catch(() => null) : null,
      product.categoryId ? getCategory(product.categoryId).catch(() => null) : null,
    ]);
    return { product, merchant, category };
  }, [productId]);
  const related = useAsync(async () => (data.data?.product ? getRelatedProducts(data.data.product) : []), [data.data?.product]);

  if (data.loading && !data.data) return <PageLoader />;
  if (data.error) {
    return (
      <div className="shell py-8">
        <ErrorState error={data.error} onRetry={data.reload} />
      </div>
    );
  }
  if (!data.data) return <NotFoundContent />;
  const { product: p, merchant, category } = data.data;
  const specs = Object.entries(p.specifications).filter(([, v]) => v);
  const url = `${SITE_URL}/p/${p.id}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.id,
    url,
    image: p.imageUrls,
    description: p.description,
    ...(category ? { category: category.name } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: p.currency || "GHS",
      price: displayPrice(p).toFixed(2),
      availability: isInStock(p) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(merchant ? { seller: { "@type": "Organization", name: merchant.name } } : {}),
    },
    ...(p.rating && p.reviewCount
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(p.rating.toFixed(1)), reviewCount: p.reviewCount, bestRating: 5, worstRating: 1 } }
      : {}),
  };

  return (
    <div className="shell py-5 sm:py-8">
      <Seo
        title={p.name}
        description={p.description ?? `${p.name}${merchant ? ` from ${merchant.name}` : ""} on GUGU. Prices in cedis, pay on delivery.`}
        image={p.imageUrls[0]}
        type="product"
        canonicalPath={`/p/${p.id}`}
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: "Home", path: "/" },
          ...(category ? [{ name: category.name, path: `/c/${category.id}` }] : []),
          { name: p.name, path: `/p/${p.id}` },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          ...(category ? [{ label: category.name, to: `/c/${category.id}` }] : []),
          { label: p.name },
        ]}
      />

      <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Gallery product={p} />
        <div>
          {merchant && (
            <Link to={`/store/${merchant.id}`} className="inline-flex min-h-[32px] items-center gap-1.5 text-sm font-semibold text-ink-700 hover:underline">
              <LuStore aria-hidden className="h-4 w-4" /> {merchant.name}
            </Link>
          )}
          <h1 className="type-title mt-1 text-2xl text-ink-950 sm:text-3xl">{p.name}</h1>
          <div className="mt-2">
            <a href="#reviews" className="inline-block rounded hover:underline">
              {p.rating ? <Stars value={p.rating} count={p.reviewCount} size="md" /> : <span className="text-sm text-text-muted">No reviews yet</span>}
            </a>
          </div>
          <div className="mt-5">
            <BuyBox product={p} />
          </div>
          {p.highlights.length > 0 && (
            <section aria-labelledby="highlights" className="mt-6">
              <h2 id="highlights" className="text-base font-bold text-ink-950">
                Highlights
              </h2>
              <ul className="mt-2 space-y-1.5">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-text">
                    <LuCheck aria-hidden className="mt-1 h-4 w-4 shrink-0 text-leaf" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-8">
          {p.description && (
            <section aria-labelledby="description">
              <h2 id="description" className="type-title text-xl text-ink-950">
                About this product
              </h2>
              <p className="mt-3 max-w-prose whitespace-pre-line leading-relaxed text-text">{p.description}</p>
            </section>
          )}
          {specs.length > 0 && (
            <section aria-labelledby="specs">
              <h2 id="specs" className="type-title text-xl text-ink-950">
                Specifications
              </h2>
              <dl className="mt-3 divide-y divide-paper-line rounded-lg border border-paper-line bg-white">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[minmax(7rem,40%)_1fr] gap-3 px-4 py-2.5 text-sm">
                    <dt className="font-semibold text-text-muted">{k}</dt>
                    <dd className="text-text">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
        {(p.returnPolicy || p.supportNote) && (
          <aside className="h-fit space-y-4 rounded-lg border border-paper-line bg-white p-5">
            {p.returnPolicy && (
              <section aria-labelledby="returns">
                <h2 id="returns" className="font-bold text-ink-950">
                  Returns
                </h2>
                <p className="mt-1 whitespace-pre-line text-sm text-text-muted">{p.returnPolicy}</p>
              </section>
            )}
            {p.supportNote && (
              <section aria-labelledby="support">
                <h2 id="support" className="font-bold text-ink-950">
                  Support
                </h2>
                <p className="mt-1 whitespace-pre-line text-sm text-text-muted">{p.supportNote}</p>
              </section>
            )}
          </aside>
        )}
      </div>

      <Reviews product={p} />

      {related.data && related.data.length > 0 && (
        <section aria-labelledby="related" className="mt-14">
          <h2 id="related" className="type-title mb-4 text-2xl text-ink-950">
            You may also like
          </h2>
          <ProductRail products={related.data} />
        </section>
      )}
    </div>
  );
}
