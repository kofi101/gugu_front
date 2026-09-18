import { chargeNoteFor, chargeVerdict, type ChargeVerdict } from "../../lib/format";
import type { PaymentCheckResult } from "../../data/account";

export type Outcome =
  | { kind: "checking" }
  | { kind: "paid"; money: ChargeVerdict }
  | { kind: "pending"; money: ChargeVerdict }
  | { kind: "cancelled"; money: ChargeVerdict }
  | { kind: "failed"; money: ChargeVerdict }
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
  if (res.status === "payment_failed") return { kind: "failed", money };
  if (res.paymentStatus === "paid") return { kind: "paid", money };
  // A guard, not a state the server reaches: every `paymentStatus: 'failed'` write in gugu_2.0 `orders.js`
  // (lines 267, 535, 693, 853) sets `cancelled` or `payment_failed` in the same update, and both are caught
  // above. A server that ever did leave an order `failed` but open should still land on the closed panel
  // rather than be read as "still pending" — but it gets no offer to pay again from this page: that belongs to
  // the order page, which checks whether the order is payable at all.
  if (res.paymentStatus === "failed") return { kind: "failed", money };
  return { kind: "pending", money };
}

/**
 * The failure copy. `money` comes from the server's flags, never from the status: this page is where a customer
 * who paid at ExpressPay *after* their order expired lands, and the order is `payment_failed` for them too.
 */
export function failedCopy(money: ChargeVerdict): { title: string; detail: string } {
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
      detail: "This order was closed without payment, and you haven't been charged. Add the items to your cart again to place a new order.",
    };
  return {
    title: "Payment didn't go through",
    detail: "This order was closed. Open the order to check whether a payment went through — anything taken will be refunded.",
  };
}

/**
 * The copy for a payment ExpressPay has not settled yet — including one it approved for the wrong amount or
 * currency, which leaves the order `awaiting_payment` with `paymentReviewRequired` and, since gugu_2.0 #12,
 * keeps it there: the expiry job never closes an order money is held against.
 *
 * It lives here rather than in the page so the state can be tested.
 */
export function pendingCopy(money: ChargeVerdict): { title: string; detail: string } {
  if (money === "under_review" || money === "refund_due")
    return {
      title: "We're checking this payment",
      detail:
        "ExpressPay approved a payment that doesn't match this order, so GUGU is checking it before the order moves on. Open the order to follow it, and don't pay again in the meantime.",
    };
  // The hour this used to promise was `EXPIRE_AWAITING_AFTER_MS`, the expiry job's scan cutoff. Every customer
  // who reads this has a PENDING ExpressPay result on the order, and the job then leaves such an order alone
  // until `EXPIRE_PENDING_HARD_MS` — 3 h (gugu_2.0 `functions/src/orders.js:28`).
  return {
    title: "Payment not confirmed yet",
    detail:
      "ExpressPay hasn't confirmed this payment yet. If you approved it on your phone, it can take a few minutes. Don't pay twice: an order whose payment never confirms closes on its own about three hours after you place it.",
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
