import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router";
import { LuHeart, LuMenu, LuSearch, LuShoppingBag, LuUser } from "react-icons/lu";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useCategories } from "../../hooks/useCategories";
import { Logo } from "../Logo";
import { MobileMenu } from "./MobileMenu";

function SearchForm({ id, className = "" }: { id: string; className?: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const current = pathname === "/search" ? params.get("q") ?? "" : "";
  const [value, setValue] = useState(current);
  const [synced, setSynced] = useState(current);
  if (current !== synced) {
    setSynced(current);
    setValue(current);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" action="/search" onSubmit={submit} className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search products and stores
      </label>
      <input
        id={id}
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products and stores"
        autoComplete="off"
        enterKeyHint="search"
        className="block h-11 w-full rounded-md border-0 bg-white pl-4 pr-12 text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-[3px] focus:ring-thread-300"
      />
      <button
        type="submit"
        className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded bg-ink-700 text-white hover:bg-ink-900"
      >
        <LuSearch aria-hidden className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
}

function CartLink({ className = "" }: { className?: string }) {
  const { count } = useCart();
  return (
    <Link to="/cart" className={`relative inline-flex items-center gap-2 rounded-md px-2.5 py-2 hover:bg-white/10 ${className}`}>
      <LuShoppingBag aria-hidden className="h-6 w-6" />
      <span className="hidden text-sm font-semibold lg:inline">Cart</span>
      <span className="sr-only">
        , {count} {count === 1 ? "item" : "items"}
      </span>
      {count > 0 && (
        <span
          aria-hidden
          className="tabular absolute -right-0.5 -top-0.5 grid min-w-[1.25rem] place-items-center rounded-full bg-thread-300 px-1 text-xs font-bold leading-5 text-ink-950 lg:static lg:ml-0.5"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  const categories = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const wasOpen = useRef(false);
  useEffect(() => {
    // Return focus to the menu button when the sheet closes.
    if (wasOpen.current && !menuOpen) menuButton.current?.focus({ preventScroll: true });
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  const firstName = user?.displayName?.split(" ")[0];

  return (
    <header className="on-dark sticky top-0 z-40 bg-ink-900 text-white shadow-[0_1px_0_rgba(0,0,0,.2)]">
      <div className="thread h-1" aria-hidden />
      <div className="shell flex h-14 items-center gap-2 lg:h-[4.5rem] lg:gap-6">
        <button
          ref={menuButton}
          type="button"
          className="-ml-2 grid h-11 w-11 place-items-center rounded-md hover:bg-white/10 lg:hidden"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <LuMenu aria-hidden className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </button>
        <Link to="/" className="rounded-sm py-1" aria-label="GUGU home">
          <Logo className="h-6 w-auto lg:h-8" title="GUGU" />
        </Link>
        <SearchForm id="search-desktop" className="mx-2 hidden max-w-2xl flex-1 lg:block" />
        <nav aria-label="Account" className="ml-auto flex items-center gap-0.5 lg:gap-2">
          <Link
            to="/sell"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/10 hover:text-white xl:inline-block"
          >
            Sell on GUGU
          </Link>
          <Link to={user ? "/account" : "/signin"} className="inline-flex items-center gap-2 rounded-md px-2.5 py-2 hover:bg-white/10">
            <LuUser aria-hidden className="h-6 w-6" />
            <span className="hidden max-w-[9rem] truncate text-sm font-semibold lg:inline">{user ? firstName || "Account" : "Sign in"}</span>
            <span className="sr-only lg:hidden">{user ? "Your account" : "Sign in"}</span>
          </Link>
          <Link to="/wishlist" className="hidden items-center gap-2 rounded-md px-2.5 py-2 hover:bg-white/10 sm:inline-flex">
            <LuHeart aria-hidden className="h-6 w-6" />
            <span className="hidden text-sm font-semibold lg:inline">Saved</span>
            <span className="sr-only lg:hidden">Saved items</span>
          </Link>
          <CartLink />
        </nav>
      </div>
      <div className="shell pb-3 lg:hidden">
        <SearchForm id="search-mobile" />
      </div>
      {categories.data && categories.data.length > 0 && (
        <nav aria-label="Categories" className="hidden border-t border-white/10 bg-ink-950 lg:block">
          <ul className="shell flex h-11 items-center gap-1 overflow-x-auto text-sm">
            {categories.data.map((c) => (
              <li key={c.id} className="shrink-0">
                <NavLink
                  to={`/c/${c.id}`}
                  className={({ isActive }) =>
                    `block rounded px-3 py-1.5 font-medium ${isActive ? "bg-white/15 text-white" : "text-ink-100 hover:bg-white/10 hover:text-white"}`
                  }
                >
                  {c.name}
                </NavLink>
              </li>
            ))}
            <li className="ml-auto shrink-0">
              <NavLink to="/stores" className="block rounded px-3 py-1.5 font-medium text-thread-300 hover:bg-white/10">
                All stores
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories.data ?? []} />
    </header>
  );
}
