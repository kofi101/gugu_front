import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { LuCircleCheck, LuCircleX, LuClock } from "react-icons/lu";
import { confirmExpressPayPayment } from "../../data/account";
import { errorMessage } from "../../lib/errors";
import { orderIdFromReturn } from "../../lib/expresspayReturn";
import type { ChargeVerdict } from "../../lib/format";
import { cancelledCopy, confirmOutcome, failedCopy, paidMoneyNote, pendingCopy, type Outcome } from "./confirmOutcome";
import { Seo } from "../../components/Seo";
import { Spinner } from "../../components/States";

function PaidPanel({ money, orderLink }: { money: ChargeVerdict; orderLink: string }) {
  const note = paidMoneyNote(money);
  return (
    <>
      <LuCircleCheck aria-hidden className="mx-auto h-14 w-14 text-leaf" />
      <h1 className="type-title mt-3 text-2xl text-ink-950">Payment received</h1>
      <p className="mt-2 text-text-muted">ExpressPay confirmed your payment. Your order is with the store.</p>
      {note && <p className="mt-2 text-text-muted">{note}</p>}
      <Link to={orderLink} className="btn btn-primary mt-6">
        View your order
      </Link>
    </>
  );
}

/**
 * Everything that isn't going to be delivered: a failed payment, and an order that was cancelled.
 *
 * There is no "try paying again" here. A closed order cannot be paid — `startExpressPayCheckout` refuses
 * anything that is not `awaiting_payment` (`ORDER_NOT_AWAITING_PAYMENT`) — and the one state that would have
 * shown the button (`awaiting_payment` with `paymentStatus: 'failed'`) is not a state the server writes.
 * Paying again starts from the order page, which knows whether the order is payable at all.
 */
function ClosedPanel({ copy, money, orderLink }: { copy: { title: string; detail: string }; money: ChargeVerdict; orderLink: string }) {
  const { title, detail } = copy;
  // When money of the customer's is in play, the order page is where the answer is, so it takes the main button.
  const orderFirst = money === "refund_due" || money === "under_review";
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
        {orderFirst ? (
          <Link to={orderLink} className="btn btn-primary">
            View your order
          </Link>
        ) : (
          <>
            <Link to="/" className="btn btn-primary">
              Continue shopping
            </Link>
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
  const orderId = orderIdFromReturn(params);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "checking" });
  const started = useRef<string | null>(null);

  const check = useCallback(async () => {
    setOutcome({ kind: "checking" });
    try {
      setOutcome(confirmOutcome(await confirmExpressPayPayment(orderId)));
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
          {outcome.kind === "paid" && <PaidPanel money={outcome.money} orderLink={orderLink} />}
          {outcome.kind === "pending" && (
            <>
              <LuClock aria-hidden className="mx-auto h-14 w-14 text-thread-700" />
              <h1 className="type-title mt-3 text-2xl text-ink-950">{pendingCopy(outcome.money).title}</h1>
              <p className="mt-2 text-text-muted">{pendingCopy(outcome.money).detail}</p>
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
          {outcome.kind === "cancelled" && <ClosedPanel copy={cancelledCopy(outcome.money)} money={outcome.money} orderLink={orderLink} />}
          {outcome.kind === "failed" && <ClosedPanel copy={failedCopy(outcome.money)} money={outcome.money} orderLink={orderLink} />}
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
