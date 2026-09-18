const ghs = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

/** Every money amount in the storefront goes through this formatter. */
export const formatMoney = (amount: number) => ghs.format(Number.isFinite(amount) ? amount : 0);

const dateFmt = new Intl.DateTimeFormat("en-GH", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatDate = (d?: Date) => (d ? dateFmt.format(d) : "");
export const formatDateTime = (d?: Date) => (d ? dateTimeFmt.format(d) : "");

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  placed: "Placed",
  processing: "Being prepared",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
  partially_cancelled: "Part of the order cancelled",
};

/** Label for any order/fulfilment status, including server-only history entries. */
export const statusLabel = (status: string) =>
  ORDER_STATUS_LABEL[status] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "");

export const FULFILMENT_STATUS_LABEL: Record<string, string> = {
  placed: "Waiting for the store",
  processing: "Being prepared",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: "Cash on delivery",
  mobile_money_on_delivery: "Mobile money on delivery",
  expresspay: "ExpressPay (card or mobile money online)",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: "Not paid yet",
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
};

/** For pay-on-delivery orders with cancelled parts: what the customer still pays at the door. */
export function amountDueOnDelivery(o: { paymentMethod: string; orderTotal: number; cancelledAmount: number }): number | null {
  const onDelivery = o.paymentMethod === "cash_on_delivery" || o.paymentMethod === "mobile_money_on_delivery";
  if (!onDelivery || !(o.cancelledAmount > 0)) return null;
  return Math.max(0, Math.round((o.orderTotal - o.cancelledAmount) * 100) / 100);
}

/**
 * What the server has told us about the customer's money. The three fields are exactly what
 * `placeOrder` / `confirmExpressPayPayment` return and what the order document carries; both flags are
 * written (and returned) only when true, so an absent flag means "not set", never "unknown".
 */
export interface ChargeFacts {
  paymentStatus?: string;
  refundRequired?: boolean;
  paymentReviewRequired?: boolean;
}

/**
 * What we may honestly say about that money.
 *
 * `paymentStatus` alone never settles it. An ExpressPay order that closed unpaid and was then paid at
 * ExpressPay keeps `paymentStatus: 'failed'` and gains `refundRequired`; an approved payment whose amount or
 * currency doesn't match the order sits at `paymentReviewRequired` and can later close to `failed` with no
 * refund flag. Both flags therefore outrank the status.
 */
export type ChargeVerdict = "not_charged" | "refund_due" | "under_review" | "paid" | "unknown";

export function chargeVerdict(f: ChargeFacts): ChargeVerdict {
  if (f.refundRequired === true) return "refund_due";
  if (f.paymentReviewRequired === true) return "under_review";
  // `unpaid` is a pay-on-delivery order that never had a payment channel; `failed` with neither flag set is
  // ExpressPay refusing the payment. Nothing moved in either case.
  if (f.paymentStatus === "unpaid" || f.paymentStatus === "failed") return "not_charged";
  if (f.paymentStatus === "paid") return "paid";
  // `pending` (an ExpressPay order still at the payment page) and a missing field (a server predating the
  // contract change) both mean we can't tell, so say nothing the order page can contradict.
  return "unknown";
}

/** One sentence about the money, for a page that can point the customer at the order. */
export function chargeNote(f: ChargeFacts): string {
  return chargeNoteFor(chargeVerdict(f));
}

/** The same sentence, for a page that has already worked out the verdict. */
export function chargeNoteFor(verdict: ChargeVerdict): string {
  switch (verdict) {
    case "not_charged":
      return "You have not been charged.";
    case "refund_due":
      return "A payment did go through, so a refund is due — open the order to follow it.";
    case "under_review":
      return "A payment on this order is being checked, so open the order to follow it.";
    case "paid":
      return "This order was paid, so open it to see what happens to the money.";
    default:
      return "Open the order to check whether a payment went through — anything taken will be refunded.";
  }
}

/**
 * Whether the storefront may send this order to ExpressPay to be paid.
 *
 * `status: 'awaiting_payment'` is not enough on its own. An approval ExpressPay returns for the wrong amount or
 * currency sets `paymentReviewRequired` and leaves the order `awaiting_payment`, and since gugu_2.0 #12 the
 * expiry job deliberately never closes such an order — ExpressPay is holding real money against it, so it stays
 * open until a person settles it. The contract is explicit: a client "should treat a long-lived
 * `awaiting_payment` order with that flag as 'being checked', not as payable". Offering to pay it invites a
 * second charge; the server refuses it anyway (`ORDER_ALREADY_PAID`) after re-querying ExpressPay.
 *
 * So the money flags decide, not the status: only an order nothing has been taken for ('not_charged') or one
 * still at the payment page ('unknown', a `pending` ExpressPay result) may be paid. `paymentMethod` is checked
 * when the caller knows it; a `placeOrder` result that comes back `awaiting_payment` is an ExpressPay order by
 * construction, since every other method is `placed` at once.
 */
export function canPayAtExpressPay(o: ChargeFacts & { status: string; paymentMethod?: string }): boolean {
  if (o.paymentMethod != null && o.paymentMethod !== "expresspay") return false;
  if (o.status !== "awaiting_payment") return false;
  const money = chargeVerdict(o);
  return money === "not_charged" || money === "unknown";
}
