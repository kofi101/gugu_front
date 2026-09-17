import { Link } from "react-router";
import { LuMessageSquare } from "react-icons/lu";
import { listOrders, listPurchasedProductIds } from "../../data/account";
import { getReview } from "../../data/reviews";
import { useAuth } from "../../context/auth";
import { useAsync } from "../../hooks/useAsync";
import { formatDate } from "../../lib/format";
import { ProductImage } from "../../components/ProductCard";
import { Seo } from "../../components/Seo";
import { EmptyState, ErrorState } from "../../components/States";
import { Stars } from "../../components/Stars";

/**
 * Reviews live at products/{productId}/ratings/{uid} and require a delivered purchase, which the server
 * records at users/{uid}/purchased/{productId}. Names and images come from the customer's orders.
 */
export default function MyReviews() {
  const { user } = useAuth();
  const data = useAsync(async () => {
    const [purchased, orders] = await Promise.all([listPurchasedProductIds(user!.uid), listOrders(user!.uid, 50)]);
    const info = new Map<string, { name: string; imageUrl?: string }>();
    for (const o of orders) for (const l of o.lines) if (!info.has(l.productId)) info.set(l.productId, { name: l.name, imageUrl: l.imageUrl });
    const entries = purchased.slice(0, 40).map((id) => [id, info.get(id) ?? { name: "Product" }] as const);
    const reviews = await Promise.all(entries.map(([id]) => getReview(id, user!.uid).catch(() => null)));
    return entries.map(([id, p], i) => ({ productId: id, ...p, review: reviews[i] }));
  }, [user?.uid]);

  if (data.error) return <ErrorState error={data.error} onRetry={data.reload} title="Your reviews didn't load" />;
  if (data.loading) return <div className="skeleton h-48" aria-hidden />;

  const items = data.data ?? [];
  const written = items.filter((i) => i.review);
  const pending = items.filter((i) => !i.review);

  if (!items.length) {
    return (
      <EmptyState icon={<LuMessageSquare />} title="Nothing to review yet">
        When an order is delivered, you can rate the products in it here.
        <Seo title="Your reviews" noindex />
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      <Seo title="Your reviews" noindex />
      {pending.length > 0 && (
        <section aria-labelledby="to-review">
          <h2 id="to-review" className="mb-3 text-lg font-bold text-ink-950">
            Waiting for your review
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {pending.map((i) => (
              <li key={i.productId} className="panel flex items-center gap-3 p-3">
                <div className="w-14 shrink-0 overflow-hidden rounded-md">
                  <ProductImage src={i.imageUrl} alt="" size={56} />
                </div>
                <p className="line-clamp-2 flex-1 text-sm font-medium">{i.name}</p>
                <Link to={`/p/${i.productId}#reviews`} className="btn btn-secondary btn-sm shrink-0">
                  Review<span className="sr-only"> {i.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="written">
        <h2 id="written" className="mb-3 text-lg font-bold text-ink-950">
          Your reviews
        </h2>
        {written.length === 0 ? (
          <p className="text-text-muted">You haven't reviewed anything yet.</p>
        ) : (
          <ul className="space-y-3">
            {written.map((i) => (
              <li key={i.productId} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link to={`/p/${i.productId}`} className="font-semibold hover:underline">
                    {i.name}
                  </Link>
                  <span className="text-xs text-text-muted">{formatDate(i.review!.updatedAt ?? i.review!.createdAt)}</span>
                </div>
                <div className="mt-1">
                  <Stars value={i.review!.rating} />
                </div>
                {i.review!.message && <p className="mt-2 whitespace-pre-line text-sm">{i.review!.message}</p>}
                <Link to={`/p/${i.productId}#reviews`} className="link mt-2 inline-block text-sm">
                  Edit review
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
