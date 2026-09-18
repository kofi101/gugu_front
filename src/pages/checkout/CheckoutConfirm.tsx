import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { LuCircleCheck, LuCircleX, LuClock } from "react-icons/lu";
import { confirmExpressPayPayment, safeCheckoutUrl, startExpressPayCheckout } from "../../data/account";
import { errorMessage } from "../../lib/errors";
import { chargeVerdict, type ChargeVerdict } from "../../lib/format";
import { Seo } from "../../components/Seo";
import { Spinner } from "../../components/States";

type Outcome =
  | { kind: "checking" }
  | { kind: "paid"; money: ChargeVerdict }
  | { kind: "pending"; money: ChargeVerdict }
  | { kind: "failed"; canRetry: boolean; money: ChargeVerdict }
  | { kind: "error"; message: string };

/**
 * The failure copy. `money` comes from the server's flags, never from the status: this page is where a customer
 * who paid at ExpressPay *after* their order expired lands, and the order is `payment_failed` for them too.
 */
function failedCopy(money: ChargeVerdict, canRetry: boolean): { title: string; detail: string } {
  if (money === "refund_due")
    return {
      title: "This order closed, but you were charged",
      detail:
        "ExpressPay took a payment for an order that had already closed, so it won't be delivered and a refund is due. Open the order to follow the refund — GUGU returns it to the account you paid from.",
    };
  if (money === "under_review")
    return {
      title: "We're checking this payment",
      detail:
        "ExpressPay approved a payment that doesn't match this order, so GUGU is checking it before anything else happens. Open the order to follow it, and don't pay again in the meantime.",
    };
  if (money === "not_charged")
    return {
      title: "Payment didn't go through",
      detail: canRetry
        ? "You haven't been charged. You can try paying again."
        : "This order was closed without payment, and you haven't been charged. Add the items to your cart again to place a new order.",
    };
  return {
    title: "Payment didn't go through",
    detail: "This order was closed. Open the order to check whether a payment went through — anything taken will be refunded.",
  };
}

function FailedPanel({
  money,
  canRetry,
  orderLink,
  retrying,
  onPayAgain,
}: {
  money: ChargeVerdict;
  canRetry: boolean;
  orderLink: string;
  retrying: boolean;
  onPayAgain: () => void;
}) {
  const { title, detail } = failedCopy(money, canRetry);
  // When money of the customer's is in play, the order page is where the answer is, so it takes the main button.
  const orderFirst = !canRetry && (money === "refund_due" || money === "under_review");
  return (
    <>
      {money === "refund_due" || money === "under_review" ? (
        <LuClock aria-hidden className="mx-auto h-14 w-14 text-thread-700" />
      ) : (
        <LuCircleX aria-hidden className="mx-auto h-14 w-14 text-serial" />
      )}
      <h1 className="type-title mt-3 text-2xl text-ink-950">{title}</h1>
      <p className="mt-2 text-text-muted">{detail}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {canRetry && (
          <button type="button" className="btn btn-primary" onClick={onPayAgain} disabled={retrying}>
            {retrying ? "Opening ExpressPay…" : "Try paying again"}
          </button>
        )}
        {orderFirst ? (
          <Link to={orderLink} className="btn btn-primary">
            View your order
          </Link>
        ) : (
          <>
            {!canRetry && (
              <Link to="/" className="btn btn-primary">
                Continue shopping
              </Link>
            )}
            <Link to={orderLink} className="btn btn-secondary">
              View order
            </Link>
          </>
        )}
      </div>
    </>
  );
}

export default function CheckoutConfirm() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const [outcome, setOutcome] = useState<Outcome>({ kind: "checking" });
  const [retrying, setRetrying] = useState(false);
  const started = useRef<string | null>(null);

  const check = useCallback(async () => {
    setOutcome({ kind: "checking" });
    try {
      const res = await confirmExpressPayPayment(orderId);
      const money = chargeVerdict(res);
      // ExpressPay result 1 = paid, 2 = failed, 3/4 = still pending (the server maps these). Whether the customer
      // was charged is a separate question, answered by `refundRequired` / `paymentReviewRequired`.
      if (res.paymentStatus === "paid") setOutcome({ kind: "paid", money });
      else if (res.status === "payment_failed" || res.status === "cancelled") setOutcome({ kind: "failed", canRetry: false, money });
      // Offering "pay again" while money of ours is in flight would invite a second charge.
      else if (res.paymentStatus === "failed")
        setOutcome({ kind: "failed", canRetry: res.status === "awaiting_payment" && money === "not_charged", money });
      else setOutcome({ kind: "pending", money });
    } catch (err) {
      setOutcome({ kind: "error", message: errorMessage(err, "We couldn't check your payment. Try again.") });
    }
  }, [orderId]);

  useEffect(() => {
    // Run once per order id (StrictMode mounts effects twice in development).
    if (!orderId || started.current === orderId) return;
    started.current = orderId;
    void check();
  }, [orderId, check]);

  async function payAgain() {
    setRetrying(true);
    try {
      const { checkoutUrl } = await startExpressPayCheckout(orderId);
      const url = safeCheckoutUrl(checkoutUrl);
      if (!url) throw new Error("ExpressPay didn't return a payment page.");
      window.location.assign(url);
    } catch (err) {
      setOutcome({ kind: "error", message: errorMessage(err, "Couldn't reopen ExpressPay. Try again from your order page.") });
      setRetrying(false);
    }
  }

  const orderLink = orderId ? `/account/orders/${encodeURIComponent(orderId)}` : "/account/orders";

  if (!orderId) {
    return (
      <div className="shell py-10">
        <Seo title="Payment" noindex />
        <h1 className="type-title text-2xl">No order to confirm</h1>
        <p className="mt-2 text-text-muted">This link is missing the order number.</p>
        <Link to="/account/orders" className="btn btn-primary mt-5">
          See your orders
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-10 sm:py-16">
      <Seo title="Payment status" noindex />
      <div className="panel mx-auto max-w-xl overflow-hidden text-center" aria-live="polite">
        <div className="thread h-1" aria-hidden />
        <div className="p-6 sm:p-10">
          {outcome.kind === "checking" && (
            <>
              <h1 className="type-title text-2xl text-ink-950">Checking your payment</h1>
              <p className="mt-2 text-text-muted">We're asking ExpressPay for the result. This takes a few seconds.</p>
              <div className="mt-6">
                <Spinner label="Checking payment" />
              </div>
            </>
          )}
          {outcome.kind === "paid" && (
            <>
              <LuCircleCheck aria-hidden className="mx-auto h-14 w-14 text-leaf" />
              <h1 className="type-title mt-3 text-2xl text-ink-950">Payment received</h1>
              <p className="mt-2 text-text-muted">ExpressPay confirmed your payment. Your order is with the store.</p>
              {outcome.money === "refund_due" && (
                <p className="mt-2 text-text-muted">More than one payment went through, so a refund is due. Open the order to follow it.</p>
              )}
              {outcome.money === "under_review" && (
                <p className="mt-2 text-text-muted">GUGU is checking this payment against the order. Open the order to follow it.</p>
              )}
              <Link to={orderLink} className="btn btn-primary mt-6">
                View your order
              </Link>
            </>
          )}
          {outcome.kind === "pending" && (
            <>
              <LuClock aria-hidden className="mx-auto h-14 w-14 text-thread-700" />
              <h1 className="type-title mt-3 text-2xl text-ink-950">
                {outcome.money === "under_review" || outcome.money === "refund_due" ? "We're checking this payment" : "Payment not confirmed yet"}
              </h1>
              <p className="mt-2 text-text-muted">
                {outcome.money === "under_review" || outcome.money === "refund_due"
                  ? "ExpressPay approved a payment that doesn't match this order, so GUGU is checking it before the order moves on. Open the order to follow it, and don't pay again in the meantime."
                  : "ExpressPay hasn't confirmed this payment yet. If you approved it on your phone, it can take a few minutes. Don't pay twice: unpaid orders close automatically after about an hour."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" className="btn btn-primary" onClick={check}>
                  Check again
                </button>
                <Link to={orderLink} className="btn btn-secondary">
                  View order
                </Link>
              </div>
            </>
          )}
          {outcome.kind === "failed" && (
            <FailedPanel money={outcome.money} canRetry={outcome.canRetry} orderLink={orderLink} retrying={retrying} onPayAgain={payAgain} />
          )}
          {outcome.kind === "error" && (
            <>
              <LuCircleX aria-hidden className="mx-auto h-14 w-14 text-serial" />
              <h1 className="type-title mt-3 text-2xl text-ink-950">We couldn't check this payment</h1>
              <p role="alert" className="mt-2 text-text-muted">
                {outcome.message}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" className="btn btn-primary" onClick={check}>
                  Try again
                </button>
                <Link to={orderLink} className="btn btn-secondary">
                  View order
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
