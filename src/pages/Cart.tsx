import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { LuShoppingBag, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import { getProductsByIds } from "../data/catalog";
import { useAuth } from "../context/auth";
import { lineCap, useCart } from "../context/cart";
import { useAsync } from "../hooks/useAsync";
import { errorMessage } from "../lib/errors";
import { formatMoney, plural } from "../lib/format";
import { displayPrice, isInStock } from "../lib/parse";
import type { CartLine, Product } from "../lib/types";
import { QuantityStepper } from "../components/Common";
import { ProductImage } from "../components/ProductCard";
import { Seo } from "../components/Seo";
import { EmptyState } from "../components/States";

function LineRow({ line, live }: { line: CartLine; live: Product | null | undefined }) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const unavailable = live === null || (live != null && !isInStock(live));
  const unit = live ? displayPrice(live) : line.unitPrice;
  const priceChanged = live != null && Math.abs(displayPrice(live) - line.unitPrice) > 0.004;
  const cap = lineCap(live?.stockQuantity ?? line.stockQuantity);

  async function run(fn: () => Promise<void>, fail: string) {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(errorMessage(err, fail));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <Link to={`/p/${line.productId}`} className="w-20 shrink-0 overflow-hidden rounded-md border border-paper-line sm:w-24" tabIndex={-1} aria-hidden>
        <ProductImage src={line.imageUrl} alt="" size={96} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-medium leading-snug">
            <Link to={`/p/${line.productId}`} className="hover:underline">
              {line.name}
            </Link>
          </h2>
          <p className="type-title tabular shrink-0 text-right">{formatMoney(unit * line.quantity)}</p>
        </div>
        <p className="tabular mt-0.5 text-sm text-text-muted">
          {formatMoney(unit)} each
          {priceChanged && <span className="ml-2 font-semibold text-thread-700">Price updated</span>}
        </p>
        {unavailable && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-serial">
            <LuTriangleAlert aria-hidden className="h-4 w-4" /> {live === null ? "No longer available" : "Out of stock"}. Remove it to check out.
          </p>
        )}
        {!unavailable && line.quantity > cap && <p className="mt-1 text-sm font-semibold text-thread-700">Only {cap} available. Reduce the quantity.</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <QuantityStepper
            label={`Quantity of ${line.name}`}
            value={line.quantity}
            max={Math.max(cap, line.quantity)}
            disabled={busy || unavailable}
            onChange={(q) => run(() => cart.setQuantity(line.productId, q), "Couldn't change the quantity. Try again.")}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm text-serial hover:bg-serial-soft"
            disabled={busy}
            onClick={() => run(() => cart.remove(line.productId), "Couldn't remove this item. Try again.")}
          >
            <LuTrash2 aria-hidden className="h-4 w-4" /> Remove<span className="sr-only"> {line.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Cart() {
  const cart = useCart();
  const { user } = useAuth();
  const ids = cart.lines.map((l) => l.productId).sort().join(",");
  const live = useAsync(async () => {
    const products = await getProductsByIds(ids ? ids.split(",") : []);
    return new Map(products.map((p) => [p.id, p]));
  }, [ids]);

  const liveFor = (id: string): Product | null | undefined => (live.data ? live.data.get(id) ?? null : undefined);
  const estimate = cart.lines.reduce((sum, l) => {
    const p = liveFor(l.productId);
    return sum + (p ? displayPrice(p) : l.unitPrice) * l.quantity;
  }, 0);
  const blocked = cart.lines.some((l) => {
    const p = liveFor(l.productId);
    return p === null || (p != null && (!isInStock(p) || l.quantity > lineCap(p.stockQuantity)));
  });

  if (cart.loading || cart.merging) {
    return (
      <div className="shell py-8" aria-busy="true">
        <Seo title="Cart" noindex />
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-6 h-28" />
        <div className="skeleton mt-3 h-28" />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="shell py-8">
        <Seo title="Cart" noindex />
        <h1 className="sr-only">Your cart</h1>
        <EmptyState
          icon={<LuShoppingBag />}
          title="Your cart is empty"
          action={
            <Link to="/" className="btn btn-primary">
              Start shopping
            </Link>
          }
        >
          Items you add from any store on GUGU show up here.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="shell py-6 sm:py-8">
      <Seo title="Cart" noindex />
      <h1 className="type-title text-2xl text-ink-950 sm:text-3xl">
        Your cart <span className="tabular text-lg font-medium text-text-muted">({plural(cart.count, "item")})</span>
      </h1>
      {!user && (
        <p className="mt-2 text-sm text-text-muted">
          This cart is saved on this device.{" "}
          <Link to="/signin?next=%2Fcart" className="link">
            Sign in
          </Link>{" "}
          to keep it on your account.
        </p>
      )}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-paper-line rounded-lg border border-paper-line bg-white px-4">
          {cart.lines.map((l) => (
            <LineRow key={l.productId} line={l} live={liveFor(l.productId)} />
          ))}
        </ul>
        <aside aria-labelledby="summary-title" className="h-fit lg:sticky lg:top-40">
          <div className="panel overflow-hidden">
            <div className="thread h-1" aria-hidden />
            <div className="p-5">
              <h2 id="summary-title" className="font-bold text-ink-950">
                Order summary
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Items ({cart.count})</dt>
                  <dd className="tabular font-semibold">{formatMoney(estimate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Delivery</dt>
                  <dd className="text-text-muted">At checkout</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-paper-line pt-4">
                <span className="font-semibold">Estimated total</span>
                <span className="type-title tabular text-2xl">{formatMoney(estimate)}</span>
              </div>
              <p className="mt-2 text-xs text-text-muted">GUGU confirms prices, stock and delivery when you place the order.</p>
              {blocked && (
                <p role="status" className="mt-3 text-sm font-semibold text-serial">
                  Fix the items marked above before checking out.
                </p>
              )}
              {blocked ? (
                <button type="button" className="btn btn-primary mt-4 w-full" disabled>
                  Check out
                </button>
              ) : (
                <Link to="/checkout" className="btn btn-primary mt-4 w-full">
                  Check out
                </Link>
              )}
              <Link to="/" className="btn btn-ghost mt-2 w-full">
                Continue shopping
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
