import { chargeNoteFor, chargeVerdict, type ChargeVerdict } from "../../lib/format";
import type { PaymentCheckResult } from "../../data/account";

export type Outcome =
  | { kind: "checking" }
  | { kind: "paid"; money: ChargeVerdict }
  | { kind: "pending"; money: ChargeVerdict }
  | { kind: "cancelled"; money: ChargeVerdict }
  | { kind: "failed"; canRetry: boolean; money: ChargeVerdict }
  | { kind: "error"; message: string };

/**
 * What the confirm page may say about an order it has just asked the server about.
 *
 * ExpressPay result 1 = paid, 2 = failed, 3/4 = still pending (the server maps these). Whether the customer
 * was charged is a separate question, answered by `refundRequired` / `paymentReviewRequired`.
 */
export function confirmOutcome(res: PaymentCheckResult): Outcome {
  const money = chargeVerdict(res);
  // A closed order is never a success, whatever happened to the money — the status is checked first for that
  // reason. A customer may cancel an order they have already paid for (`cancelOrder` allows an owner to cancel
  // a `placed` order whose fulfilment entries are all `placed`, which a freshly paid ExpressPay order is), and
  // that leaves `status: 'cancelled'` with `paymentStatus: 'paid'`. Reading `paymentStatus` first showed that
  // customer "Payment received … Your order is with the store" for an order nobody is going to deliver.
  if (res.status === "cancelled") return { kind: "cancelled", money };
  if (res.status === "payment_failed") return { kind: "failed", canRetry: false, money };
  if (res.paymentStatus === "paid") return { kind: "paid", money };
  // Offering "pay again" while money of ours is in flight would invite a second charge.
  if (res.paymentStatus === "failed")
    return { kind: "failed", canRetry: res.status === "awaiting_payment" && money === "not_charged", money };
  return { kind: "pending", money };
}

/**
 * The failure copy. `money` comes from the server's flags, never from the status: this page is where a customer
 * who paid at ExpressPay *after* their order expired lands, and the order is `payment_failed` for them too.
 */
export function failedCopy(money: ChargeVerdict, canRetry: boolean): { title: string; detail: string } {
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

/** The copy for an order that was cancelled, whether or not a payment went through first. */
export function cancelledCopy(money: ChargeVerdict): { title: string; detail: string } {
  return { title: "This order was cancelled", detail: `It won't be delivered. ${chargeNoteFor(money)}` };
}

/**
 * The extra sentence under "Payment received", when the charge flags say more than the status does.
 *
 * It must hold for every way a paid order gains `refundRequired`, and the commonest is not a second payment:
 * `cancelInTx` (gugu_2.0 `functions/src/orders.js:290-294`) flags a refund whenever a paid order *or part of
 * one* is cancelled, and a partial cancel leaves the top status `placed` — a success panel with a refund due
 * on one payment. The others are a duplicate ExpressPay approval and a payment that landed after the order
 * closed. So this says a refund is due and sends the customer to the order, which knows what it covers.
 */
export function paidMoneyNote(money: ChargeVerdict): string | null {
  if (money === "refund_due") return "A refund is due on this order. Open the order to see what it covers and follow it.";
  if (money === "under_review") return "GUGU is checking this payment against the order. Open the order to follow it.";
  return null;
}
