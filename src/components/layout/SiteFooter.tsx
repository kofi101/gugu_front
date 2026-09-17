import { Link } from "react-router";
import { useCategories } from "../../hooks/useCategories";
import { Logo } from "../Logo";

export function SiteFooter() {
  const categories = useCategories();
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark mt-16 bg-ink-950 text-ink-100">
      <div className="thread h-1" aria-hidden />
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo className="h-8 w-auto text-white" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-200">
            Independent stores from across Ghana, one checkout. Pay cash or mobile money when your order arrives, or pay online with ExpressPay.
          </p>
        </div>
        <nav aria-label="Shop">
          <h2 className="text-sm font-bold text-white">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(categories.data ?? []).slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link className="hover:text-white hover:underline" to={`/c/${c.id}`}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link className="hover:text-white hover:underline" to="/stores">
                All stores
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Your account">
          <h2 className="text-sm font-bold text-white">Your account</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white hover:underline" to="/account">Account</Link></li>
            <li><Link className="hover:text-white hover:underline" to="/account/orders">Orders</Link></li>
            <li><Link className="hover:text-white hover:underline" to="/wishlist">Saved items</Link></li>
            <li><Link className="hover:text-white hover:underline" to="/cart">Cart</Link></li>
          </ul>
        </nav>
        <nav aria-label="GUGU">
          <h2 className="text-sm font-bold text-white">GUGU</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white hover:underline" to="/sell">Sell on GUGU</Link></li>
            <li><Link className="hover:text-white hover:underline" to="/about">About</Link></li>
            <li><Link className="hover:text-white hover:underline" to="/contact">Contact</Link></li>
            <li><Link className="hover:text-white hover:underline" to="/terms">Terms of use</Link></li>
            <li><Link className="hover:text-white hover:underline" to="/privacy">Privacy policy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-ink-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} GUGU. Prices are in Ghana cedis (GH₵).</p>
          <p>Totals are confirmed by GUGU when you place your order.</p>
        </div>
      </div>
    </footer>
  );
}
