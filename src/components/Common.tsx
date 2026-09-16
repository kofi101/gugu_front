import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { LuChevronRight, LuMinus, LuPlus } from "react-icons/lu";
import { useAuth } from "../context/auth";
import { PageLoader } from "./States";

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-text-muted">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <LuChevronRight aria-hidden className="h-3.5 w-3.5" />}
            {item.to && i < items.length - 1 ? (
              <Link to={item.to} className="hover:text-ink-900 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className="font-medium text-text">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
  label,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-11 items-stretch overflow-hidden rounded-md border border-paper-line bg-white">
      <button
        type="button"
        className="grid w-11 place-items-center text-ink-900 hover:bg-ink-50 disabled:text-paper-line"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
      >
        <LuMinus aria-hidden className="h-4 w-4" />
        <span className="sr-only">Decrease quantity</span>
      </button>
      <output aria-live="polite" className="tabular grid min-w-[2.75rem] place-items-center border-x border-paper-line text-base font-semibold">
        {value}
      </output>
      <button
        type="button"
        className="grid w-11 place-items-center text-ink-900 hover:bg-ink-50 disabled:text-paper-line"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
      >
        <LuPlus aria-hidden className="h-4 w-4" />
        <span className="sr-only">Increase quantity</span>
      </button>
    </div>
  );
}

/** Sends signed-out visitors to sign in, then back. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <PageLoader />;
  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/signin?next=${encodeURIComponent(next)}`} replace />;
  }
  return <>{children}</>;
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="type-title text-2xl text-ink-950 sm:text-3xl">{children}</h1>
      {sub && <p className="mt-1.5 text-text-muted">{sub}</p>}
    </div>
  );
}
