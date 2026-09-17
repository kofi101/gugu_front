import { Link } from "react-router";
import { InfoPage } from "./InfoPage";

export default function Privacy() {
  return (
    <InfoPage title="Privacy policy" updated="18 September 2026" description="What personal information GUGU collects, why, and how it is used.">
      <p>This policy explains what information GUGU Ghana Limited collects when you use the GUGU website and app, and how it is used.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address and, if you add them, your phone number and delivery address.</li>
        <li>Orders: the products you order, delivery details, payment method and order status.</li>
        <li>Your cart, saved items and the reviews you write.</li>
        <li>If you apply to sell: your business details and the documents you upload.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To create your account, process and deliver your orders, and show you their status.</li>
        <li>To share the details a store needs to prepare and deliver your order.</li>
        <li>To confirm ExpressPay payments. Card and mobile money details are entered on ExpressPay's page, not on GUGU.</li>
        <li>To review applications from businesses that want to sell.</li>
      </ul>
      <h2>Where it is stored</h2>
      <p>GUGU uses Google Firebase to store account and order data and to sign you in.</p>
      <h2>On this device</h2>
      <p>If you are not signed in, your cart is kept in your browser's local storage on this device. We don't use advertising cookies.</p>
      <h2>Your choices</h2>
      <p>
        You can update your details in <Link to="/account">your account</Link>. To ask for a copy of your data or to delete your account,{" "}
        <Link to="/contact">contact us</Link>.
      </p>
    </InfoPage>
  );
}
