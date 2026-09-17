import { Link } from "react-router";
import { InfoPage } from "./InfoPage";

export default function Terms() {
  return (
    <InfoPage title="Terms of use" updated="18 September 2026" description="The terms for shopping and selling on GUGU, the marketplace run by GUGU Ghana Limited.">
      <p>These terms explain how GUGU works when you browse, buy or sell on it. By using GUGU you accept them.</p>
      <h2>Who you buy from</h2>
      <p>
        GUGU Ghana Limited runs the marketplace. Products are listed and sold by independent stores. Each store is responsible for its product
        descriptions, stock and preparing your order.
      </p>
      <h2>Prices and orders</h2>
      <ul>
        <li>Prices are shown in Ghana cedis (GHS). Prices in your cart and at checkout are estimates.</li>
        <li>When you place an order, GUGU checks each product's current price and stock and calculates the final total, including any delivery fee. The order page shows that total.</li>
        <li>An order can be refused if a product is no longer available.</li>
      </ul>
      <h2>Payment</h2>
      <ul>
        <li>Cash on delivery and mobile money on delivery: pay the order total when your order arrives.</li>
        <li>ExpressPay: you pay on ExpressPay's page. Your order is confirmed once ExpressPay confirms the payment to GUGU.</li>
      </ul>
      <h2>Cancellations and returns</h2>
      <p>
        You can cancel an order from your account while it is awaiting payment or newly placed. Each product page shows the store's return policy
        where one is provided.
      </p>
      <h2>Reviews</h2>
      <p>Reviews must be about the product and honest. GUGU may remove reviews that are abusive, misleading or unrelated.</p>
      <h2>Selling on GUGU</h2>
      <p>
        Stores must <Link to="/sell">apply</Link> and be approved. Approved stores agree to list accurate information and fulfil the orders they
        accept.
      </p>
      <h2>Your account</h2>
      <p>Keep your sign-in details private. You are responsible for activity on your account.</p>
      <p>
        Questions about these terms? <Link to="/contact">Contact us</Link>.
      </p>
    </InfoPage>
  );
}
