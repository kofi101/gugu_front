import { Link } from "react-router";
import type { Merchant } from "../lib/types";
import { Stars } from "./Stars";

export function MerchantList({ merchants }: { merchants: Merchant[] }) {
  if (!merchants.length) return <p className="text-text-muted">No stores are open yet.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {merchants.map((m) => (
        <li key={m.id}>
          <Link to={`/store/${m.id}`} className="flex h-full items-center gap-3 rounded-lg border border-paper-line bg-white p-3 hover:border-ink-700">
            {m.logoUrl ? (
              <img src={m.logoUrl} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-full border border-paper-line object-cover" />
            ) : (
              <span aria-hidden className="type-title grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink-900 text-xl text-white">
                {m.name.charAt(0)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ink-950">{m.name}</span>
              {m.tagline && <span className="block truncate text-sm text-text-muted">{m.tagline}</span>}
              <Stars value={m.rating} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
