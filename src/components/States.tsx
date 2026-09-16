import type { ReactNode } from "react";
import { LuRefreshCw, LuTriangleAlert } from "react-icons/lu";
import { errorMessage } from "../lib/errors";

export function ErrorState({
  error,
  onRetry,
  title = "This didn't load",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <div role="alert" className="panel flex flex-col items-start gap-3 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-serial">
        <LuTriangleAlert aria-hidden className="h-5 w-5" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <p className="text-text-muted">{errorMessage(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <LuRefreshCw aria-hidden className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center sm:py-16">
      {icon && <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-800 [&>svg]:h-7 [&>svg]:w-7">{icon}</div>}
      <h2 className="type-title text-xl text-ink-900 sm:text-2xl">{title}</h2>
      {children && <div className="mt-2 max-w-md text-text-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-text-muted">
      <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700 motion-reduce:animate-none" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader() {
  return (
    <div className="shell py-16" aria-busy="true">
      <Spinner label="Loading page" />
    </div>
  );
}
