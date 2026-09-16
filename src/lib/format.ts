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
