import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { LuCircleCheck, LuCircleX, LuClock } from "react-icons/lu";
import { confirmExpressPayPayment, safeCheckoutUrl, startExpressPayCheckout } from "../../data/account";
import { errorMessage } from "../../lib/errors";
import { Seo } from "../../components/Seo";
import { Spinner } from "../../components/States";

type Outcome =
  | { kind: "checking" }
  | { kind: "paid" }
  | { kind: "pending" }
  | { kind: "failed"; canRetry: boolean }
  | { kind: "error"; message: string };

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
      if (res.paymentStatus === "paid") setOutcome({ kind: "paid" });
      else if (res.paymentStatus === "failed" || res.status === "payment_failed" || res.status === "cancelled")
        setOutcome({ kind: "failed", canRetry: res.status === "awaiting_payment" });
      else setOutcome({ kind: "pending" });
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
              <Link to={orderLink} className="btn btn-primary mt-6">
                View your order
              </Link>
            </>
          )}
          {outcome.kind === "pending" && (
            <>
              <LuClock aria-hidden className="mx-auto h-14 w-14 text-thread-700" />
              <h1 className="type-title mt-3 text-2xl text-ink-950">Payment not confirmed yet</h1>
              <p className="mt-2 text-text-muted">
                ExpressPay hasn't confirmed this payment. If you approved it on your phone, it can take a minute. Don't pay twice.
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
            <>
              <LuCircleX aria-hidden className="mx-auto h-14 w-14 text-serial" />
              <h1 className="type-title mt-3 text-2xl text-ink-950">Payment didn't go through</h1>
              <p className="mt-2 text-text-muted">You haven't been charged for this order.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {outcome.canRetry && (
                  <button type="button" className="btn btn-primary" onClick={payAgain} disabled={retrying}>
                    {retrying ? "Opening ExpressPay…" : "Try paying again"}
                  </button>
                )}
                <Link to={orderLink} className="btn btn-secondary">
                  View order
                </Link>
              </div>
            </>
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
