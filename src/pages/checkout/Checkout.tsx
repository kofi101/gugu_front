import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { LuBanknote, LuCreditCard, LuLock, LuMail, LuShoppingBag, LuSmartphone } from "react-icons/lu";
import {
  getProfile,
  isOnDelivery,
  newClientRequestId,
  ON_DELIVERY_MAX_LINE_QTY,
  placeOrder,
  safeCheckoutUrl,
  updateProfile,
} from "../../data/account";
import { getProductsByIds, getShippingOptions } from "../../data/catalog";
import { useAuth } from "../../context/auth";
import { lineCap, useCart } from "../../context/cart";
import { useAsync } from "../../hooks/useAsync";
import { callableCode, callableDetails, errorMessage } from "../../lib/errors";
import { canPayAtExpressPay, chargeNote, formatMoney, PAYMENT_METHOD_LABEL, plural } from "../../lib/format";
import { displayPrice, isInStock } from "../../lib/parse";
import type { PaymentMethod, ShippingAddress } from "../../lib/types";
import { AddressFields } from "../../components/AddressFields";
import { profileToAddress, validateAddress, type AddressErrors } from "../../lib/address";
import { ProductImage } from "../../components/ProductCard";
import { Seo } from "../../components/Seo";
import { EmptyState, ErrorState, PageLoader } from "../../components/States";

type Step = 1 | 2 | 3;

/** Pay-on-delivery needs a verified email (or phone sign-in). Resend the link, then reload the user and refresh the ID token. */
function VerifyEmailStep({ onSwitchToExpressPay, onVerified }: { onSwitchToExpressPay: () => void; onVerified: () => void }) {
  const { user, resendVerification, refreshUser } = useAuth();
  const [busy, setBusy] = useState<"send" | "check" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  if (!user) return null;
  return (
    <div role="region" aria-labelledby="verify-title" className="mb-4 rounded-lg border border-thread-500 bg-thread-300/25 p-4">
      <div className="flex items-start gap-3">
        <LuMail aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-thread-700" />
        <div className="min-w-0">
          <h3 id="verify-title" className="font-bold text-ink-950">
            Verify your email to pay on delivery
          </h3>
          <p className="mt-1 text-sm text-text">
            Open the link we sent to <strong className="break-all">{user.email}</strong>, then come back and choose “I've verified”.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("check");
                setNote(null);
                try {
                  await refreshUser();
                  if (user.emailVerified) onVerified();
                  else setNote("We couldn't see the confirmation yet. Open the link in the email, then try again.");
                } catch (err) {
                  setNote(errorMessage(err, "Couldn't check your email status. Try again."));
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "check" ? "Checking…" : "I've verified"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("send");
                setNote(null);
                try {
                  await resendVerification();
                  setNote(`We sent a new link to ${user.email}. Check your spam folder too.`);
                } catch (err) {
                  setNote(errorMessage(err, "Couldn't send the email. Wait a minute and try again."));
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "send" ? "Sending…" : "Resend verification email"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSwitchToExpressPay} disabled={busy !== null}>
              Pay online instead
            </button>
          </div>
          {note && (
            <p role="status" className="mt-2 text-sm font-medium text-text">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const METHODS: { id: PaymentMethod; icon: typeof LuBanknote; detail: string }[] = [
  { id: "cash_on_delivery", icon: LuBanknote, detail: "Pay the rider in cash when your order arrives." },
  { id: "mobile_money_on_delivery", icon: LuSmartphone, detail: "Pay with MTN MoMo, Telecel Cash or AirtelTigo Money when your order arrives." },
  { id: "expresspay", icon: LuCreditCard, detail: "Pay now by card or mobile money on ExpressPay's secure page." },
];

/** A checkout attempt that did not end with the customer at ExpressPay or with a placed order. */
interface PlaceFailure {
  title: string;
  detail: string;
  /** Set when the server did create an order we can point the customer at. */
  orderId?: string;
  /** False when retrying here can't help (the order exists and must be paid from the order page). */
  retryable: boolean;
}

function StepSection({
  n,
  title,
  current,
  summary,
  onEdit,
  children,
}: {
  n: Step;
  title: string;
  current: Step;
  summary?: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const active = current === n;
  const done = current > n;
  useEffect(() => {
    if (active && n > 1) heading.current?.focus();
  }, [active, n]);
  return (
    <section aria-labelledby={`step-${n}`} className={`panel overflow-hidden ${active ? "border-ink-700" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
        <span
          aria-hidden
          className={`type-title tabular grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm ${active ? "bg-ink-700 text-white" : done ? "bg-leaf text-white" : "bg-paper-deep text-text-muted"}`}
        >
          {n}
        </span>
        <h2 id={`step-${n}`} ref={heading} tabIndex={-1} className={`flex-1 text-lg font-bold focus:outline-none ${current < n ? "text-text-muted" : "text-ink-950"}`}>
          <span className="sr-only">Step {n} of 3: </span>
          {title}
        </h2>
        {done && onEdit && (
          <button type="button" onClick={onEdit} className="btn btn-ghost btn-sm">
            Change<span className="sr-only"> {title.toLowerCase()}</span>
          </button>
        )}
      </div>
      {done && summary && <div className="px-4 pb-4 pl-[3.75rem] text-sm text-text-muted sm:px-6 sm:pl-[4.25rem]">{summary}</div>}
      {active && <div className="border-t border-paper-line px-4 py-5 sm:px-6">{children}</div>}
    </section>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<ShippingAddress | null>(null);
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [saveAddress, setSaveAddress] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [shippingOptionId, setShippingOptionId] = useState<string | undefined>();
  const [placing, setPlacing] = useState(false);
  const inFlight = useRef(false);
  // One id per checkout attempt. It is kept while the outcome is unknown (a lost response replays to the same
  // order instead of creating a second one) and minted afresh only once an attempt has completed or clearly failed.
  // It must not depend on the address form: editing a character would otherwise mint a key that places a duplicate.
  const request = useRef<string | null>(null);
  const [serverWantsVerification, setServerWantsVerification] = useState(false);
  const [failure, setFailure] = useState<PlaceFailure | null>(null);

  const profile = useAsync(() => getProfile(user!.uid), [user?.uid]);
  const shippingOptions = useAsync(getShippingOptions, []);
  const ids = cart.lines.map((l) => l.productId).sort().join(",");
  const live = useAsync(async () => new Map((await getProductsByIds(ids ? ids.split(",") : [])).map((p) => [p.id, p])), [ids]);

  // The idempotency key belongs to one specific order. Kept across a change of payment method, delivery option,
  // address or cart it would make the server replay the *previous* order: after a lost response, switching from
  // ExpressPay to pay on delivery would otherwise hand back the old ExpressPay order and send the customer off to
  // pay its amount. Retrying the *same* attempt touches none of these inputs, so the key survives that.
  const orderInputs = JSON.stringify([method, shippingOptionId ?? null, address, cart.lines.map((l) => `${l.productId}:${l.quantity}`).sort()]);
  useEffect(() => {
    request.current = null;
  }, [orderInputs]);

  const [prefilled, setPrefilled] = useState(false);
  if (!prefilled && !profile.loading) {
    setPrefilled(true);
    setAddress(profileToAddress(profile.data, user?.displayName ?? ""));
    setSaveAddress(!profile.data?.shippingLine1);
  }
  const options = shippingOptions.data ?? [];
  if (options.length > 0 && !shippingOptionId) setShippingOptionId(options[0].id);

  if (cart.loading || cart.merging || profile.loading || !address) return <PageLoader />;

  if (cart.lines.length === 0 && !placing && !failure) {
    return (
      <div className="shell py-8">
        <Seo title="Checkout" noindex />
        <h1 className="sr-only">Checkout</h1>
        <EmptyState icon={<LuShoppingBag />} title="Your cart is empty" action={<Link to="/" className="btn btn-primary">Start shopping</Link>}>
          Add something to your cart, then come back to check out.
        </EmptyState>
      </div>
    );
  }

  const priceOf = (id: string, fallback: number) => {
    const p = live.data?.get(id);
    return p ? displayPrice(p) : fallback;
  };
  const subtotal = cart.lines.reduce((s, l) => s + priceOf(l.productId, l.unitPrice) * l.quantity, 0);
  const option = options.find((o) => o.id === shippingOptionId);
  const estimate = subtotal + (option?.fee ?? 0);
  const onDelivery = isOnDelivery(method);
  const needsVerification = onDelivery && Boolean(user) && ((!user!.emailVerified && !user!.phoneNumber) || serverWantsVerification);
  const optionMissing = options.length > 0 && !option;
  // A failed load and an empty list are different states. placeOrder requires a shippingOptionId only while an
  // active option exists, so zero configured options is a legal setup the server accepts without one — the order
  // must still go through. A failed read may be hiding options that do exist, and placing then would hit
  // SHIPPING_OPTION_REQUIRED, so that case blocks with a retry instead.
  const optionsFailed = !shippingOptions.loading && Boolean(shippingOptions.error);
  const problems: { productId: string; text: string }[] = [];
  for (const l of cart.lines) {
    const p = live.data?.get(l.productId);
    if (live.data && (!p || !isInStock(p))) problems.push({ productId: l.productId, text: `${l.name}: no longer available` });
    else if (p && l.quantity > lineCap(p.stockQuantity)) problems.push({ productId: l.productId, text: `${l.name}: only ${lineCap(p.stockQuantity)} in stock` });
    else if (onDelivery && l.quantity > ON_DELIVERY_MAX_LINE_QTY)
      problems.push({ productId: l.productId, text: `${l.name}: pay on delivery allows up to ${ON_DELIVERY_MAX_LINE_QTY} per item` });
  }
  const blocked =
    placing || problems.length > 0 || live.loading || needsVerification || optionMissing || shippingOptions.loading || optionsFailed;

  function continueFromAddress() {
    const errs = validateAddress(address!);
    setAddressErrors(errs);
    if (Object.keys(errs).length) {
      const order = ["fullName", "phone", "line1", "line2", "city", "region", "postalCode"];
      const first = order.find((k) => k in errs);
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }
    if (optionsFailed) {
      toast.error("Delivery options didn't load, so we can't take this order yet.");
      return;
    }
    // Only insist on a choice when there is one to make: with no options configured the server takes the order
    // without a shippingOptionId.
    if (options.length > 0 && !option) {
      toast.error("Choose a delivery option.");
      return;
    }
    setStep(2);
  }

  async function place() {
    if (inFlight.current || !user || !address || blocked) return;
    inFlight.current = true;
    setPlacing(true);
    setFailure(null);
    request.current ??= newClientRequestId();
    try {
      if (saveAddress) {
        await updateProfile(user.uid, {
          shippingLine1: address.line1,
          shippingLine2: address.line2,
          shippingCity: address.city,
          shippingRegion: address.region,
          shippingPostalCode: address.postalCode,
          shippingPhone: address.phone,
        }).catch((e) => console.warn("[gugu] saving address failed", e));
      }
      const result = await placeOrder({
        paymentMethod: method,
        shipping: {
          fullName: address.fullName.trim(),
          line1: address.line1.trim(),
          line2: address.line2.trim(),
          city: address.city.trim(),
          region: address.region.trim(),
          postalCode: address.postalCode.trim(),
          phone: address.phone.trim(),
        },
        shippingOptionId,
        clientRequestId: request.current,
      });
      // The attempt is over either way, so the next one is a new order rather than a replay of this one.
      request.current = null;
      // Trust the status the server returned, not the absence of an exception: placeOrder also replays an
      // earlier attempt of the same clientRequestId, which may come back payment_failed or cancelled.
      if (result.status === "awaiting_payment") {
        // `awaiting_payment` is not the same as payable. This branch also runs for a replay of an earlier
        // attempt (same clientRequestId), and the order it replays may be one ExpressPay approved for the wrong
        // amount or currency: the server flags it `paymentReviewRequired`, never expires it, and hands back the
        // *stale* checkoutUrl from the first attempt. Following that URL would send the customer to pay a second
        // time for a payment that is already being investigated.
        if (!canPayAtExpressPay(result)) {
          setFailure({
            title: "We're checking a payment on this order",
            detail:
              "ExpressPay approved a payment that doesn't match this order, so GUGU is checking it before the order moves on. Don't pay for it again — open the order to follow it, and get in touch if you don't hear back.",
            orderId: result.orderId,
            retryable: false,
          });
        } else {
          const url = safeCheckoutUrl(result.checkoutUrl);
          if (url) {
            window.location.assign(url);
            return; // keep the button disabled while the browser leaves
          }
          setFailure({
            title: "We couldn't open ExpressPay",
            detail:
              "Your order is saved. Open the order to check its payment status, then choose “Pay now” to go to ExpressPay, or cancel it there.",
            orderId: result.orderId,
            retryable: false,
          });
        }
      } else if (result.status === "placed") {
        navigate(`/account/orders/${result.orderId}?placed=1`, { replace: true });
        return;
      } else {
        // This may be a replay of an earlier attempt rather than an order the server has just opened and closed,
        // so what happened to the money comes from the charge flags the server returns, never from the status.
        setFailure({
          title: result.status === "cancelled" ? "This order was cancelled" : "Your payment didn't go through",
          detail:
            result.status === "cancelled"
              ? `It won't be delivered. ${chargeNote(result)} Place the order again to buy these items.`
              : `ExpressPay didn't accept the payment, so the order was closed. ${chargeNote(result)} You can try again, or pay on delivery.`,
          orderId: result.orderId,
          retryable: true,
        });
      }
      inFlight.current = false;
      setPlacing(false);
    } catch (err) {
      const code = callableCode(err);
      // A coded rejection means the server decided this attempt: the next one should be a new order.
      // An unknown error (network, timeout) may have placed the order anyway, so keep the id to replay it.
      if (code) request.current = null;
      const details = callableDetails<{ productId?: string; reason?: string }>(err);
      if (code === "PRODUCT_UNAVAILABLE" && details?.reason === "own_product") {
        const line = cart.lines.find((l) => l.productId === details.productId);
        toast.error(
          line
            ? `You can't buy from your own store. Remove “${line.name}” from your cart to continue.`
            : errorMessage(err),
          { autoClose: 10000 },
        );
      } else if (code === "OUT_OF_STOCK" || code === "PRODUCT_UNAVAILABLE" || code === "PRODUCT_NOT_FOUND") {
        const productId = callableDetails<{ productId?: string; available?: number }>(err)?.productId;
        const line = cart.lines.find((l) => l.productId === productId);
        const available = callableDetails<{ available?: number }>(err)?.available;
        const msg = line
          ? code === "OUT_OF_STOCK" && available != null
            ? `Only ${available} of “${line.name}” left. Update your cart and try again.`
            : `“${line.name}” is no longer available. Remove it from your cart and try again.`
          : errorMessage(err);
        toast.error(msg, { autoClose: 10000 });
        live.reload();
      } else if (code === "VERIFICATION_REQUIRED") {
        setServerWantsVerification(true);
        toast.error(errorMessage(err), { autoClose: 10000 });
      } else if (code === "QUANTITY_LIMIT") {
        const max = callableDetails<{ max?: number }>(err)?.max ?? ON_DELIVERY_MAX_LINE_QTY;
        toast.error(`Pay-on-delivery orders are limited to ${max} of each item. Lower the quantity in your cart, or pay online with ExpressPay.`, {
          autoClose: 10000,
        });
      } else if (code === "PAYMENT_INIT_FAILED") {
        // The server opened this order and closed it inside this one call, before any payment page existed, so
        // "not charged" is safe to say here — unlike the replayed payment_failed above. The cart is kept, so the
        // customer can simply try again.
        setFailure({
          title: "Your payment didn't start",
          detail: "ExpressPay couldn't open a payment page, so the order was closed. You have not been charged — try again, or pay on delivery.",
          orderId: callableDetails<{ orderId?: string }>(err)?.orderId,
          retryable: true,
        });
      } else {
        toast.error(errorMessage(err, "We couldn't place your order. Nothing was charged. Try again."), { autoClose: 8000 });
      }
      inFlight.current = false;
      setPlacing(false);
    }
  }

  return (
    <div className="shell py-6 sm:py-8">
      <Seo title="Checkout" noindex />
      <div className="flex items-center justify-between gap-3">
        <h1 className="type-title text-2xl text-ink-950 sm:text-3xl">Checkout</h1>
        <p className="flex items-center gap-1.5 text-sm text-text-muted">
          <LuLock aria-hidden className="h-4 w-4" /> Secure checkout
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem] lg:gap-8">
        <div className="space-y-4">
          <StepSection
            n={1}
            title="Delivery address"
            current={step}
            onEdit={() => setStep(1)}
            summary={
              <>
                {address.fullName}, {address.phone}
                <br />
                {[address.line1, address.line2, address.city, address.region].filter(Boolean).join(", ")}
                {option && <><br />{option.name}</>}
              </>
            }
          >
            <AddressFields idPrefix="checkout" value={address} onChange={setAddress} errors={addressErrors} />
            {shippingOptions.error ? (
              <div className="mt-6">
                <ErrorState error={shippingOptions.error} onRetry={shippingOptions.reload} title="Delivery options didn't load" />
              </div>
            ) : options.length > 0 && (
              <fieldset className="mt-6">
                <legend className="field-label">Delivery option</legend>
                <div className="space-y-2">
                  {options.map((o) => (
                    <label key={o.id} className="flex cursor-pointer items-start gap-3 rounded-md border border-paper-line p-3 has-[:checked]:border-ink-700 has-[:checked]:bg-ink-50">
                      <input type="radio" name="shipping" value={o.id} checked={shippingOptionId === o.id} onChange={() => setShippingOptionId(o.id)} className="mt-1 h-4 w-4 accent-ink-700" />
                      <span className="flex-1">
                        <span className="block font-semibold">{o.name}</span>
                        {o.description && <span className="block text-sm text-text-muted">{o.description}</span>}
                      </span>
                      {o.fee != null && <span className="tabular text-sm font-semibold">{o.fee > 0 ? formatMoney(o.fee) : "Free"}</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <label className="mt-5 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-ink-700" />
              Save this address to my account
            </label>
            <button
              type="button"
              className="btn btn-primary mt-5 w-full sm:w-auto"
              onClick={continueFromAddress}
              disabled={shippingOptions.loading || optionsFailed}
            >
              Continue to payment
            </button>
          </StepSection>

          <StepSection n={2} title="Payment method" current={step} onEdit={() => setStep(2)} summary={PAYMENT_METHOD_LABEL[method]}>
            <fieldset>
              <legend className="sr-only">Choose how to pay</legend>
              <div className="space-y-2">
                {METHODS.map(({ id, icon: Icon, detail }) => (
                  <label key={id} className="flex cursor-pointer items-start gap-3 rounded-md border border-paper-line p-3 has-[:checked]:border-ink-700 has-[:checked]:bg-ink-50">
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={method === id}
                      onChange={() => {
                        setMethod(id);
                        setServerWantsVerification(false);
                        setFailure(null);
                      }}
                      className="mt-1 h-4 w-4 accent-ink-700"
                    />
                    <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ink-700" />
                    <span>
                      <span className="block font-semibold">{PAYMENT_METHOD_LABEL[id]}</span>
                      <span className="block text-sm text-text-muted">{detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {onDelivery && (
              <p className="mt-3 text-sm text-text-muted">
                Pay on delivery needs a verified email and allows up to {ON_DELIVERY_MAX_LINE_QTY} of each item and 3 open orders.
              </p>
            )}
            <button type="button" className="btn btn-primary mt-5 w-full sm:w-auto" onClick={() => setStep(3)}>
              Review order
            </button>
          </StepSection>

          <StepSection n={3} title="Review and place order" current={step}>
            {failure && (
              <div role="alert" className="mb-4 rounded-md bg-serial-soft p-4 text-sm text-serial">
                <p className="text-base font-bold">{failure.title}</p>
                <p className="mt-1">{failure.detail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {failure.retryable && cart.lines.length > 0 && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={place}>
                      Try again
                    </button>
                  )}
                  {failure.retryable && cart.lines.length > 0 && method === "expresspay" && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setMethod("cash_on_delivery");
                        setServerWantsVerification(false);
                        setFailure(null);
                        setStep(2);
                      }}
                    >
                      Pay on delivery instead
                    </button>
                  )}
                  {failure.orderId && (
                    <Link to={`/account/orders/${failure.orderId}`} className="btn btn-secondary btn-sm">
                      See the order
                    </Link>
                  )}
                  {cart.lines.length === 0 && (
                    <Link to="/" className="btn btn-secondary btn-sm">
                      Keep shopping
                    </Link>
                  )}
                </div>
              </div>
            )}
            {live.error ? (
              <ErrorState error={live.error} onRetry={live.reload} title="We couldn't check prices and stock" />
            ) : null}
            {needsVerification && (
              <VerifyEmailStep
                onVerified={() => setServerWantsVerification(false)}
                onSwitchToExpressPay={() => {
                  setMethod("expresspay");
                  setServerWantsVerification(false);
                }}
              />
            )}
            {problems.length > 0 && (
              <div role="alert" className="mb-4 rounded-md bg-serial-soft p-3 text-sm text-serial">
                <p className="font-semibold">Some items can't be ordered as they are:</p>
                <ul className="mt-1 list-disc pl-5">
                  {problems.map((pr) => (
                    <li key={pr.productId}>{pr.text}</li>
                  ))}
                </ul>
                <Link to="/cart" className="mt-2 inline-block font-semibold underline">
                  Update your cart
                </Link>
              </div>
            )}
            <ul className="divide-y divide-paper-line">
              {cart.lines.map((l) => (
                <li key={l.productId} className="flex items-center gap-3 py-3">
                  <div className="w-14 shrink-0 overflow-hidden rounded-md border border-paper-line">
                    <ProductImage src={l.imageUrl} alt="" size={56} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{l.name}</p>
                    <p className="tabular text-sm text-text-muted">Qty {l.quantity}</p>
                  </div>
                  <p className="tabular text-sm font-semibold">{formatMoney(priceOf(l.productId, l.unitPrice) * l.quantity)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-text-muted">
              By placing your order you agree to GUGU's{" "}
              <Link to="/terms" className="link">
                Terms of use
              </Link>
              . {method === "expresspay" ? "You'll go to ExpressPay to pay." : "You pay when your order arrives."}
            </p>
            <button
              type="button"
              className="btn btn-primary mt-4 hidden h-12 w-full text-base lg:flex"
              onClick={place}
              disabled={blocked}
              aria-describedby="estimate-note"
            >
              {placing ? "Placing order…" : method === "expresspay" ? "Place order and pay" : "Place order"}
            </button>
          </StepSection>
        </div>

        <aside aria-labelledby="summary-heading" className="h-fit lg:sticky lg:top-40">
          <div className="panel overflow-hidden">
            <div className="thread h-1" aria-hidden />
            <div className="p-5">
              <h2 id="summary-heading" className="font-bold text-ink-950">
                Summary
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">{plural(cart.count, "item")}</dt>
                  <dd className="tabular">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Delivery</dt>
                  <dd className="tabular">
                    {option
                      ? option.fee
                        ? formatMoney(option.fee)
                        : "Free"
                      : options.length
                        ? "Choose an option"
                        : shippingOptions.loading
                          ? "Loading…"
                          : optionsFailed
                            ? "Not loaded"
                            : "Confirmed with order"}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex items-baseline justify-between border-t border-paper-line pt-3">
                <span className="font-semibold">Estimated total</span>
                <span className="type-title tabular text-2xl">{formatMoney(estimate)}</span>
              </div>
              <p id="estimate-note" className="mt-2 text-xs text-text-muted">
                This is an estimate. GUGU confirms the final total, including delivery, when you place the order.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {step === 3 && (
        <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-paper-line bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-sheet sm:-mx-6 sm:px-6 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Estimated total</p>
              <p className="type-title tabular text-lg">{formatMoney(estimate)}</p>
            </div>
            <button type="button" className="btn btn-primary h-12 flex-1" onClick={place} disabled={blocked}>
              {placing ? "Placing order…" : method === "expresspay" ? "Place order and pay" : "Place order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
