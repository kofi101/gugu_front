/**
 * The order id from an ExpressPay return URL.
 *
 * ExpressPay appends its own query to `redirect-url` with a **second `?`**
 * rather than an `&`, so a real return looks like:
 *
 *   /checkout/confirm?orderId=ORDER?order-id=ORDER&token=99786aad...
 *
 * `URLSearchParams` does not treat the second `?` as a separator, so
 * `params.get("orderId")` hands back `ORDER?order-id=ORDER` — a key no lookup
 * can match, and the customer who has just paid is told their order does not
 * exist. Everything up to that stray `?` is the id we asked for.
 *
 * `order-id` is ExpressPay's own copy of the same value, used when our
 * parameter is missing entirely.
 */
export function orderIdFromReturn(params: URLSearchParams): string {
  const raw = params.get("orderId") ?? params.get("order-id") ?? "";
  return raw.split(/[?&]/, 1)[0].trim();
}
