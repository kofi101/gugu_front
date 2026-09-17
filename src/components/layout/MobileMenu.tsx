import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { LuChevronRight, LuHeart, LuPackage, LuStore, LuUser, LuX } from "react-icons/lu";
import { useAuth } from "../../context/auth";
import type { Category } from "../../lib/types";
import { Logo } from "../Logo";

/** Bottom sheet navigation for small screens, built on the native <dialog> (focus trap + Esc for free). */
export function MobileMenu({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: Category[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const row = "flex min-h-[48px] items-center justify-between gap-3 px-5 py-3 text-base font-medium text-text hover:bg-ink-50";

  return (
    <dialog
      ref={ref}
      aria-label="Menu"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none animate-sheet-up overflow-hidden rounded-t-2xl bg-white p-0 text-text shadow-sheet open:flex open:flex-col backdrop:animate-fade-in"
    >
      <div className="flex items-center justify-between bg-ink-900 px-5 py-3 text-white on-dark">
        <Logo className="h-5 w-auto" />
        <button type="button" onClick={onClose} className="-mr-2 grid h-11 w-11 place-items-center rounded-md hover:bg-white/10">
          <LuX aria-hidden className="h-6 w-6" />
          <span className="sr-only">Close menu</span>
        </button>
      </div>
      <div className="overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        <nav aria-label="Your GUGU" className="grid grid-cols-3 gap-2 border-b border-paper-line p-4">
          {[
            { to: user ? "/account" : "/signin", label: user ? "Account" : "Sign in", icon: LuUser },
            { to: "/account/orders", label: "Orders", icon: LuPackage },
            { to: "/wishlist", label: "Saved", icon: LuHeart },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-1.5 rounded-lg bg-paper px-2 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-50">
              <Icon aria-hidden className="h-6 w-6" />
              {label}
            </Link>
          ))}
        </nav>
        {categories.length > 0 && (
          <nav aria-label="Shop by category">
            <h2 className="px-5 pb-1 pt-4 text-sm font-bold text-text-muted">Shop by category</h2>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/c/${c.id}`} className={row}>
                    {c.name}
                    <LuChevronRight aria-hidden className="h-5 w-5 text-text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <nav aria-label="More" className="border-t border-paper-line py-2">
          <ul>
            <li>
              <Link to="/stores" className={row}>
                <span className="flex items-center gap-3">
                  <LuStore aria-hidden className="h-5 w-5 text-ink-700" /> All stores
                </span>
              </Link>
            </li>
            <li>
              <Link to="/sell" className={row}>
                Sell on GUGU
              </Link>
            </li>
            <li>
              <Link to="/about" className={row}>
                About GUGU
              </Link>
            </li>
            <li>
              <Link to="/contact" className={row}>
                Help and contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </dialog>
  );
}
