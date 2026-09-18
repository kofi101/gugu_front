import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { LuSmartphone } from "react-icons/lu";
import { Seo } from "../../components/Seo";

// ExpressPay sends customers who paid from the mobile app here (placeOrder returnTo: "app").
// The page is public on purpose: the app user isn't signed in to the website, so it only
// hands off to the app, which confirms the payment. It reads no order data.
const ORDER_ID = /^[A-Za-z0-9_-]{1,128}$/;

function appConfirmUrl(orderId: string): string | null {
  return ORDER_ID.test(orderId) ? `gugu://checkout/confirm?orderId=${encodeURIComponent(orderId)}` : null;
}

export default function AppReturn() {
  const [params] = useSearchParams();
  const appUrl = appConfirmUrl(params.get("orderId") ?? "");
  const opened = useRef(false);

  useEffect(() => {
    // Try once to reopen the app. If it isn't installed nothing happens and the page stays.
    if (!appUrl || opened.current) return;
    opened.current = true;
    window.location.href = appUrl;
  }, [appUrl]);

  return (
    <div className="shell py-10 sm:py-16">
      <Seo title="Return to the Gugu app" noindex />
      <div className="panel mx-auto max-w-xl overflow-hidden text-center" aria-live="polite">
        <div className="thread h-1" aria-hidden />
        <div className="p-6 sm:p-10">
          <LuSmartphone aria-hidden className="mx-auto h-14 w-14 text-ink-700" />
          {/* ExpressPay sends approved, declined and cancelled payments to this same URL, and this page reads no
              order data, so it must not claim any outcome. The app checks with ExpressPay and shows the result. */}
          <h1 className="type-title mt-3 text-2xl text-ink-950">Back to the Gugu app</h1>
          {appUrl ? (
            <>
              <p className="mt-2 text-text-muted">
                ExpressPay has finished with this payment. Go back to the Gugu app to see the result: it checks with ExpressPay and shows your
                order.
              </p>
              <a href={appUrl} className="btn btn-primary mt-6">
                Open the Gugu app
              </a>
              <p className="mt-4 text-sm text-text-muted">
                If the app doesn't open, switch back to it yourself. Check the order in the app before paying again.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-text-muted">
                This link is missing the order number. Open the Gugu app and check your orders there.
              </p>
              <Link to="/" className="btn btn-secondary mt-6">
                Go to the Gugu website
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
