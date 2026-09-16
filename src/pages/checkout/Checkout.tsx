import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { LuBanknote, LuCreditCard, LuLock, LuShoppingBag, LuSmartphone } from "react-icons/lu";
import { getProfile, placeOrder, safeCheckoutUrl, updateProfile } from "../../data/account";
import { getProductsByIds, getShippingOptions } from "../../data/catalog";
import { useAuth } from "../../context/auth";
import { lineCap, useCart } from "../../context/cart";
import { useAsync } from "../../hooks/useAsync";
import { callableCode, callableDetails, errorMessage } from "../../lib/errors";
import { formatMoney, PAYMENT_METHOD_LABEL, plural } from "../../lib/format";
import { displayPrice, isInStock } from "../../lib/parse";
import type { PaymentMethod, ShippingAddress } from "../../lib/types";
import { AddressFields } from "../../components/AddressFields";
import { profileToAddress, validateAddress, type AddressErrors } from "../../lib/address";
import { ProductImage } from "../../components/ProductCard";
import { Seo } from "../../components/Seo";
import { EmptyState, ErrorState, PageLoader } from "../../components/States";

type Step = 1 | 2 | 3;

const METHODS: { id: PaymentMethod; icon: typeof LuBanknote; detail: string }[] = [
  { id: "cash_on_delivery", icon: LuBanknote, detail: "Pay the rider in cash when your order arrives." },
  { id: "mobile_money_on_delivery", icon: LuSmartphone, detail: "Pay with MTN MoMo, Telecel Cash or AirtelTigo Money when your order arrives." },
  { id: "expresspay", icon: LuCreditCard, detail: "Pay now by card or mobile money on ExpressPay's secure page." },
];

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

  const profile = useAsync(() => getProfile(user!.uid), [user?.uid]);
  const shippingOptions = useAsync(() => getShippingOptions().catch(() => []), []);
  const ids = cart.lines.map((l) => l.productId).sort().join(",");
  const live = useAsync(async () => new Map((await getProductsByIds(ids ? ids.split(",") : [])).map((p) => [p.id, p])), [ids]);

  const [prefilled, setPrefilled] = useState(false);
  if (!prefilled && !profile.loading) {
    setPrefilled(true);
    setAddress(profileToAddress(profile.data, user?.displayName ?? ""));
    setSaveAddress(!profile.data?.shippingLine1);
  }
  const options = shippingOptions.data ?? [];
  if (options.length > 0 && !shippingOptionId) setShippingOptionId(options[0].id);

  if (cart.loading || cart.merging || profile.loading || !address) return <PageLoader />;

  if (cart.lines.length === 0 && !placing) {
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
  const problems = live.data
    ? cart.lines.filter((l) => {
        const p = live.data!.get(l.productId);
        return !p || !isInStock(p) || l.quantity > lineCap(p.stockQuantity);
      })
    : [];

  function continueFromAddress() {
    const errs = validateAddress(address!);
    setAddressErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }
    setStep(2);
  }

  async function place() {
    if (inFlight.current || !user || !address) return;
    inFlight.current = true;
    setPlacing(true);
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
      });
      if (method === "expresspay") {
        const url = safeCheckoutUrl(result.checkoutUrl);
        if (url) {
          window.location.assign(url);
          return; // keep the button disabled while the browser leaves
        }
        toast.error("Your order was saved, but ExpressPay didn't open. Use Pay now on the order page.");
      }
      navigate(`/account/orders/${result.orderId}?placed=1`, { replace: true });
    } catch (err) {
      const code = callableCode(err);
      if (code === "OUT_OF_STOCK" || code === "PRODUCT_UNAVAILABLE" || code === "PRODUCT_NOT_FOUND") {
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
      } else if (code === "PAYMENT_INIT_FAILED") {
        // The order was recorded as payment_failed and the cart kept: the customer can simply try again.
        toast.error(errorMessage(err), { autoClose: 10000 });
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
            {options.length > 0 && (
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
                      {o.fee != null && <span className="tabular text-sm font-semibold">{o.fee > 0 ? `about ${formatMoney(o.fee)}` : "Free"}</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <label className="mt-5 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-ink-700" />
              Save this address to my account
            </label>
            <button type="button" className="btn btn-primary mt-5 w-full sm:w-auto" onClick={continueFromAddress}>
              Continue to payment
            </button>
          </StepSection>

          <StepSection n={2} title="Payment method" current={step} onEdit={() => setStep(2)} summary={PAYMENT_METHOD_LABEL[method]}>
            <fieldset>
              <legend className="sr-only">Choose how to pay</legend>
              <div className="space-y-2">
                {METHODS.map(({ id, icon: Icon, detail }) => (
                  <label key={id} className="flex cursor-pointer items-start gap-3 rounded-md border border-paper-line p-3 has-[:checked]:border-ink-700 has-[:checked]:bg-ink-50">
                    <input type="radio" name="payment" value={id} checked={method === id} onChange={() => setMethod(id)} className="mt-1 h-4 w-4 accent-ink-700" />
                    <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ink-700" />
                    <span>
                      <span className="block font-semibold">{PAYMENT_METHOD_LABEL[id]}</span>
                      <span className="block text-sm text-text-muted">{detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="button" className="btn btn-primary mt-5 w-full sm:w-auto" onClick={() => setStep(3)}>
              Review order
            </button>
          </StepSection>

          <StepSection n={3} title="Review and place order" current={step}>
            {live.error ? (
              <ErrorState error={live.error} onRetry={live.reload} title="We couldn't check prices and stock" />
            ) : null}
            {problems.length > 0 && (
              <div role="alert" className="mb-4 rounded-md bg-serial-soft p-3 text-sm text-serial">
                <p className="font-semibold">Some items can't be ordered as they are:</p>
                <ul className="mt-1 list-disc pl-5">
                  {problems.map((l) => (
                    <li key={l.productId}>{l.name}</li>
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
              disabled={placing || problems.length > 0 || live.loading}
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
                  <dd className="tabular">{option?.fee != null ? formatMoney(option.fee) : "Confirmed with order"}</dd>
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
            <button type="button" className="btn btn-primary h-12 flex-1" onClick={place} disabled={placing || problems.length > 0 || live.loading}>
              {placing ? "Placing order…" : method === "expresspay" ? "Place order and pay" : "Place order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
