import { Link } from "react-router";
import { InfoPage } from "./InfoPage";

export default function About() {
  return (
    <InfoPage title="About GUGU" description="GUGU (Ghana Unlimited) is an online marketplace for products from independent Ghanaian businesses and makers.">
      <p className="text-lg">
        GUGU, short for Ghana Unlimited, is an online marketplace run by GUGU Ghana Limited. We bring independent Ghanaian businesses and makers
        into one place, so you can find what they sell and order it with one checkout.
      </p>
      <h2>How shopping on GUGU works</h2>
      <ul>
        <li>Every product is sold by an independent store. You can visit each store's page to see everything they offer.</li>
        <li>Prices are in Ghana cedis. GUGU confirms the final price, stock and delivery when you place your order.</li>
        <li>Pay cash or mobile money when your order arrives, or pay online with ExpressPay.</li>
        <li>Follow every order from your account, and review what you bought to help other shoppers.</li>
      </ul>
      <h2>For businesses</h2>
      <p>
        If you make or sell products in Ghana, you can <Link to="/sell">apply to sell on GUGU</Link>. Approved stores manage their products and
        orders in the GUGU merchant dashboard.
      </p>
      <p>
        GUGU is also available as a mobile app. Questions? <Link to="/contact">Contact us</Link>.
      </p>
    </InfoPage>
  );
}
