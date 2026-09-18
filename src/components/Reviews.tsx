import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { toast } from "react-toastify";
import { hasDeliveredPurchase } from "../data/account";
import { deleteReview, getReview, listReviews, REVIEW_MAX_CHARS, saveReview } from "../data/reviews";
import { useAuth } from "../context/auth";
import { useAsync } from "../hooks/useAsync";
import { errorMessage, isCode } from "../lib/errors";
import { formatDate, plural } from "../lib/format";
import type { Product, Rating } from "../lib/types";
import { ErrorState } from "./States";
import { StarInput, Stars } from "./Stars";

function ReviewForm({ product, existing, onSaved }: { product: Product; existing: Rating | null; onSaved: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [message, setMessage] = useState(existing?.message ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (rating < 1) {
      setError("Choose a star rating from 1 to 5.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await saveReview(product.id, { uid: user.uid, displayName: user.displayName }, rating, message, Boolean(existing));
      toast.success(existing ? "Review updated" : "Review posted. Thanks for sharing.");
      onSaved();
    } catch (err) {
      toast.error(
        isCode(err, "permission-denied")
          ? existing
            ? "We couldn't save that change to your review. Reload the page and try again."
            : "Only customers who have received this product can review it."
          : errorMessage(err, "Couldn't save your review. Try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!user || !existing) return;
    setBusy(true);
    try {
      await deleteReview(product.id, user.uid);
      toast.info("Review deleted");
      setRating(0);
      setMessage("");
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't delete your review. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel space-y-4 p-4 sm:p-5" noValidate>
      <h3 className="font-bold text-ink-950">{existing ? "Edit your review" : "Write a review"}</h3>
      <StarInput value={rating} onChange={setRating} disabled={busy} />
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="review-message" className="field-label">
          Your review <span className="font-normal text-text-muted">(optional)</span>
        </label>
        <textarea
          id="review-message"
          className="input min-h-[112px]"
          maxLength={REVIEW_MAX_CHARS}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={busy}
          aria-describedby="review-count"
        />
        <p id="review-count" className="field-hint tabular">
          {message.length} / {REVIEW_MAX_CHARS} characters
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : existing ? "Update review" : "Post review"}
        </button>
        {existing && (
          <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
            Delete review
          </button>
        )}
      </div>
    </form>
  );
}

export function Reviews({ product }: { product: Product }) {
  const { user } = useAuth();
  const location = useLocation();
  const list = useAsync(() => listReviews(product.id), [product.id]);
  const mine = useAsync(async () => (user ? getReview(product.id, user.uid) : null), [product.id, user?.uid]);
  // Rules allow a review only after a delivered purchase (server marker), and never on your own store's product.
  const eligibility = useAsync(async () => {
    if (!user) return { canReview: false, ownProduct: false };
    const [purchased, token] = await Promise.all([hasDeliveredPurchase(user.uid, product.id), user.getIdTokenResult()]);
    const ownProduct = token.claims.merchantId === product.merchantId;
    return { canReview: purchased && !ownProduct, ownProduct };
  }, [product.id, product.merchantId, user?.uid]);
  const reloadAll = () => {
    list.reload();
    mine.reload();
  };

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mt-14 scroll-mt-32">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-title" className="type-title text-2xl text-ink-950">
          Reviews
        </h2>
        {product.reviewCount ? <Stars value={product.rating} count={product.reviewCount} size="md" /> : null}
      </div>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          {list.error ? (
            <ErrorState error={list.error} onRetry={list.reload} title="Reviews didn't load" />
          ) : list.loading ? (
            <div className="space-y-3" aria-hidden>
              <div className="skeleton h-20" />
              <div className="skeleton h-20" />
            </div>
          ) : list.data && list.data.length > 0 ? (
            <>
              <p className="sr-only">{plural(list.data.length, "review")} shown</p>
              <ul className="divide-y divide-paper-line rounded-lg border border-paper-line bg-white">
                {list.data.map((r) => (
                  <li key={r.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Stars value={r.rating} />
                      <span className="text-xs text-text-muted">{formatDate(r.updatedAt ?? r.createdAt)}</span>
                    </div>
                    {r.message && <p className="mt-2 whitespace-pre-line text-text">{r.message}</p>}
                    <p className="mt-2 text-sm font-semibold text-text-muted">
                      {r.displayName || "GUGU shopper"}
                      {user?.uid === r.userId && " (you)"}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-paper-line bg-white p-5 text-text-muted">No reviews yet.</p>
          )}
        </div>
        <div>
          {user ? (
            mine.loading || eligibility.loading ? (
              <div className="skeleton h-48" aria-hidden />
            ) : mine.error ? (
              // Without knowing whether a review already exists the form would take the create path and
              // rewrite createdAt, which the rules reject — so ask for a retry instead of guessing.
              <ErrorState error={mine.error} onRetry={mine.reload} title="We couldn't check your review" />
            ) : eligibility.data?.canReview || mine.data ? (
              <ReviewForm key={mine.data?.updatedAt?.getTime() ?? "new"} product={product} existing={mine.data ?? null} onSaved={reloadAll} />
            ) : (
              <div className="panel p-5">
                <h3 className="font-bold text-ink-950">Reviews come from buyers</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {eligibility.data?.ownProduct
                    ? "You can't review products from your own store."
                    : "You can review this product after an order with it has been delivered to you."}
                </p>
              </div>
            )
          ) : (
            <div className="panel p-5">
              <h3 className="font-bold text-ink-950">Share your experience</h3>
              <p className="mt-1 text-sm text-text-muted">Bought this? Sign in to rate and review it.</p>
              <Link to={`/signin?next=${encodeURIComponent(`${location.pathname}#reviews`)}`} className="btn btn-secondary mt-4">
                Sign in to review
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
