import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { LuArrowLeft, LuCircleCheck } from "react-icons/lu";
import { cancelOrder, customerCancelState, safeCheckoutUrl, startExpressPayCheckout, watchOrder } from "../../data/account";
import { getMerchantsByIds } from "../../data/catalog";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../context/auth";
import { errorMessage } from "../../lib/errors";
import { formatDateTime, formatMoney, PAYMENT_METHOD_LABEL, statusLabel } from "../../lib/format";
import type { Order } from "../../lib/types";
import { FulfilmentBadge, PaymentBadge, StatusBadge } from "../../components/OrderBits";
import { ProductImage } from "../../components/ProductCard";
import { Seo } from "../../components/Seo";
import { ErrorState } from "../../components/States";

function Actions({ order }: { order: Order }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const cancelState = customerCancelState(order);
  const canCancel = cancelState.allowed;
  const canPay = order.paymentMethod === "expresspay" && order.status === "awaiting_payment";
  if (!canCancel && !canPay) {
    if (cancelState.reason) return <p className="pt-4 text-sm text-text-muted">{cancelState.reason}</p>;
    if (order.status === "payment_failed") {
      return (
        <p className="pt-4 text-sm text-text-muted">
          This order closed because the ExpressPay payment wasn't completed. You weren't charged.{" "}
          <Link to="/" className="link">
            Shop again
          </Link>
        </p>
      );
    }
    return null;
  }

  async function pay() {
    setBusy(true);
    try {
      const { checkoutUrl } = await startExpressPayCheckout(order.id);
      const url = safeCheckoutUrl(checkoutUrl);
      if (!url) throw new Error("ExpressPay didn't return a payment page. Try again.");
      window.location.assign(url);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't open ExpressPay. Try again."));
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await cancelOrder(order.id, "Cancelled by customer on web");
      toast.success("Order cancelled");
      setConfirming(false);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't cancel this order. Try again or contact support."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canPay && (
        <button type="button" className="btn btn-primary" onClick={pay} disabled={busy}>
          {busy ? "Opening ExpressPay…" : `Pay ${formatMoney(order.orderTotal)} with ExpressPay`}
        </button>
      )}
      {canCancel &&
        (confirming ? (
          <div role="group" aria-label="Confirm cancellation" className="flex flex-wrap items-center gap-2 rounded-md bg-serial-soft p-2">
            <span className="px-1 text-sm font-semibold text-serial">Cancel this order?</span>
            <button type="button" className="btn btn-sm bg-serial text-white hover:bg-serial/90" onClick={cancel} disabled={busy}>
              {busy ? "Cancelling…" : "Yes, cancel order"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)} disabled={busy}>
              Keep order
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
            Cancel order
          </button>
        ))}
    </div>
  );
}

/** Per-store progress. Multi-store orders move separately; parts can be cancelled while others are delivered. */
function Fulfilment({ order }: { order: Order }) {
  const merchantIds = Object.keys(order.fulfilment);
  const names = useAsync(() => getMerchantsByIds(merchantIds), [[...merchantIds].sort().join(",")]);
  if (merchantIds.length === 0) return null;
  const partlyCancelled = order.status === "delivered" && merchantIds.some((m) => order.fulfilment[m].status === "cancelled");
  return (
    <section aria-labelledby="fulfilment-title" className="panel p-5 sm:p-6">
      <h3 id="fulfilment-title" className="text-lg font-bold text-ink-950">
        {merchantIds.length > 1 ? "Delivery by store" : "Delivery"}
      </h3>
      {partlyCancelled && (
        <p className="mt-2 rounded-md bg-thread-300/25 p-3 text-sm text-text">
          Part of this order was cancelled. You received the items from the stores marked Delivered.
        </p>
      )}
      {order.refundRequired && order.refundAmount > 0 && (
        <p className="mt-2 rounded-md bg-leaf-soft p-3 text-sm text-leaf">
          A refund of <strong className="tabular">{formatMoney(order.refundAmount)}</strong> is due for the cancelled items. GUGU will return it
          to the account you paid from.
        </p>
      )}
      <ul className="mt-3 divide-y divide-paper-line">
        {merchantIds.map((m) => {
          const f = order.fulfilment[m];
          const lines = order.lines.filter((l) => l.merchantId === m);
          return (
            <li key={m} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link to={`/store/${m}`} className="font-semibold hover:underline">
                  {names.data?.get(m)?.name ?? "Store"}
                </Link>
                <FulfilmentBadge status={f.status} />
              </div>
              <p className="mt-1 text-sm text-text-muted">
                {lines.map((l) => `${l.quantity} × ${l.name}`).join(", ")}
                {f.status === "delivered" && f.deliveredAt && ` · delivered ${formatDateTime(f.deliveredAt)}`}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function OrderDetail() {
  const { orderId = "" } = useParams();
  const [params] = useSearchParams();
  const justPlaced = params.get("placed") === "1";
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) return;
    return watchOrder(
      user.uid,
      orderId,
      (o) => {
        setOrder(o);
        setError(null);
      },
      setError,
    );
  }, [user, orderId, attempt]);

  if (error) return <ErrorState error={error} onRetry={() => setAttempt((a) => a + 1)} title="This order didn't load" />;
  if (order === undefined) {
    return (
      <div className="space-y-3" aria-hidden>
        <div className="skeleton h-32" />
        <div className="skeleton h-48" />
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="panel p-6">
        <Seo title="Order not found" noindex />
        <h2 className="text-lg font-bold">We couldn't find that order</h2>
        <p className="mt-1 text-text-muted">It may belong to a different account.</p>
        <Link to="/account/orders" className="btn btn-secondary mt-4">
          See your orders
        </Link>
      </div>
    );
  }

  const o = order;
  const history = [...o.statusHistory].sort((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0));

  return (
    <article aria-labelledby="order-title" className="space-y-6">
      <Seo title={`Order ${o.orderNumber}`} noindex />
      <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 hover:underline">
        <LuArrowLeft aria-hidden className="h-4 w-4" /> All orders
      </Link>

      {justPlaced && (
        <div role="status" className="flex items-start gap-3 rounded-lg bg-leaf-soft p-4 text-leaf">
          <LuCircleCheck aria-hidden className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <p className="font-bold">Order placed. Thank you!</p>
            <p className="text-sm">
              {o.paymentMethod === "expresspay"
                ? "We'll update this page when ExpressPay confirms your payment."
                : `Have ${formatMoney(o.orderTotal)} ready ${o.paymentMethod === "mobile_money_on_delivery" ? "on mobile money" : "in cash"} when your order arrives.`}
            </p>
          </div>
        </div>
      )}

      <div className="panel overflow-hidden">
        <div className="underprint relative border-b border-paper-line px-5 py-5 sm:px-6">
          <div className="thread absolute inset-x-0 top-0 h-1" aria-hidden />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-text-muted">Order number</p>
              <h2 id="order-title" className="type-title tabular text-2xl tracking-wide text-serial sm:text-3xl">
                {o.orderNumber}
              </h2>
              <p className="mt-1 text-sm text-text-muted">Placed {formatDateTime(o.createdAt)}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={o.status} />
              <p className="type-display tabular mt-2 text-3xl text-ink-950">{formatMoney(o.orderTotal)}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
          <section aria-labelledby="pay-title">
            <h3 id="pay-title" className="text-sm font-bold text-text-muted">
              Payment
            </h3>
            <p className="mt-1 font-medium">{PAYMENT_METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod}</p>
            <PaymentBadge status={o.paymentStatus} />
          </section>
          <section aria-labelledby="ship-title">
            <h3 id="ship-title" className="text-sm font-bold text-text-muted">
              Delivery to
            </h3>
            <address className="mt-1 not-italic leading-relaxed">
              {o.shipping.fullName}
              <br />
              {o.shipping.line1}
              {o.shipping.line2 && (
                <>
                  <br />
                  {o.shipping.line2}
                </>
              )}
              <br />
              {[o.shipping.city, o.shipping.region].filter(Boolean).join(", ")}
              {o.shipping.postalCode && ` · ${o.shipping.postalCode}`}
              <br />
              {o.shipping.phone}
            </address>
          </section>
        </div>
        <div className="border-t border-paper-line px-5 pb-5 sm:px-6">
          <Actions order={o} />
        </div>
      </div>

      <Fulfilment order={o} />

      <section aria-labelledby="items-title" className="panel p-5 sm:p-6">
        <h3 id="items-title" className="text-lg font-bold text-ink-950">
          Items
        </h3>
        <ul className="mt-3 divide-y divide-paper-line">
          {o.lines.map((l, i) => (
            <li key={`${l.productId}-${i}`} className="flex gap-3 py-3">
              <div className="w-16 shrink-0 overflow-hidden rounded-md border border-paper-line">
                <ProductImage src={l.imageUrl} alt="" size={64} />
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/p/${l.productId}`} className="font-medium hover:underline">
                  {l.name}
                </Link>
                <p className="tabular text-sm text-text-muted">
                  {l.quantity} × {formatMoney(l.unitPrice)}
                </p>
              </div>
              <p className="tabular font-semibold">{formatMoney(l.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-paper-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Subtotal</dt>
            <dd className="tabular">{formatMoney(o.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Delivery</dt>
            <dd className="tabular">{o.shippingFee > 0 ? formatMoney(o.shippingFee) : "Free"}</dd>
          </div>
          {o.discount > 0 && (
            <div className="flex justify-between text-leaf">
              <dt>Discount</dt>
              <dd className="tabular">−{formatMoney(o.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-paper-line pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd className="tabular">{formatMoney(o.orderTotal)}</dd>
          </div>
        </dl>
      </section>

      {history.length > 0 && (
        <section aria-labelledby="history-title" className="panel p-5 sm:p-6">
          <h3 id="history-title" className="text-lg font-bold text-ink-950">
            Order history
          </h3>
          <ol className="relative mt-4 space-y-5 border-l-2 border-paper-line pl-5">
            {history.map((h, i) => (
              <li key={i} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full ring-4 ring-white ${i === history.length - 1 ? "bg-ink-700" : "bg-paper-line"}`}
                />
                <p className="font-semibold">{statusLabel(h.status)}</p>
                <p className="text-sm text-text-muted">{formatDateTime(h.at)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
