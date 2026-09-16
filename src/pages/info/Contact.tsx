import { Link } from "react-router";
import { LuMail, LuPhone } from "react-icons/lu";
import { InfoPage } from "./InfoPage";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;
const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE;

export default function Contact() {
  return (
    <InfoPage title="Help and contact" description="Get help with a GUGU order, payment or account, or contact the GUGU team.">
      <h2>Help with an order</h2>
      <p>
        Open <Link to="/account/orders">your orders</Link> to see each order's status, delivery address and payment. You can cancel an order there
        until the store starts preparing it, and retry an ExpressPay payment that didn't finish.
      </p>
      <h2>Account and sign-in</h2>
      <p>
        Forgot your password? <Link to="/forgot-password">Reset it here</Link>. You can change your name, phone and delivery address in{" "}
        <Link to="/account">your account</Link>.
      </p>
      {(SUPPORT_EMAIL || SUPPORT_PHONE) && (
        <>
          <h2>Contact the GUGU team</h2>
          <ul className="!list-none !ml-0 space-y-3">
            {SUPPORT_EMAIL && (
              <li className="!ml-0 flex items-center gap-3">
                <LuMail aria-hidden className="h-5 w-5 text-ink-700" />
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </li>
            )}
            {SUPPORT_PHONE && (
              <li className="!ml-0 flex items-center gap-3">
                <LuPhone aria-hidden className="h-5 w-5 text-ink-700" />
                <a href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}>{SUPPORT_PHONE}</a>
              </li>
            )}
          </ul>
          <p className="text-sm text-text-muted">When you contact us about an order, include the order number (for example GG-260918-7K3Q9A).</p>
        </>
      )}
    </InfoPage>
  );
}
