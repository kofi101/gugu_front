import { Link } from "react-router";
import { LuMessageSquare } from "react-icons/lu";
import { listOrders } from "../../data/account";
import { getReview } from "../../data/reviews";
import { useAuth } from "../../context/auth";
import { useAsync } from "../../hooks/useAsync";
import { formatDate } from "../../lib/format";
import { ProductImage } from "../../components/ProductCard";
import { Seo } from "../../components/Seo";
import { EmptyState, ErrorState } from "../../components/States";
import { Stars } from "../../components/Stars";

/**
 * Reviews are stored at products/{productId}/ratings/{uid}. Instead of a collection-group query
 * (which would need extra rules and an index), we check the products from the customer's orders.
 */
export default function MyReviews() {
  const { user } = useAuth();
  const data = useAsync(async () => {
    const orders = await listOrders(user!.uid, 50);
    const products = new Map<string, { name: string; imageUrl?: string; delivered: boolean }>();
    for (const o of orders) {
      if (o.status === "cancelled" || o.status === "payment_failed") continue;
      for (const l of o.lines) {
        const prev = products.get(l.productId);
        products.set(l.productId, { name: l.name, imageUrl: l.imageUrl, delivered: Boolean(prev?.delivered) || o.status === "delivered" });
      }
    }
    const entries = [...products.entries()].slice(0, 40);
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
        After you order, you can rate the products you bought.
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
