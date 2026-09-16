import { isRouteErrorResponse, useRouteError } from "react-router";
import { Logo } from "./Logo";

/** Last-resort screen when a page throws while rendering. Uses plain links (it may render outside the layout). */
export function RouteError() {
  const error = useRouteError();
  console.error(error);
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="on-dark bg-ink-900 text-white">
        <div className="thread h-1" aria-hidden />
        <div className="shell flex h-14 items-center">
          <a href="/" aria-label="GUGU home">
            <Logo className="h-6 w-auto" />
          </a>
        </div>
      </header>
      <main id="main" className="shell flex-1 py-16">
        <h1 className="type-title text-3xl text-ink-950">{notFound ? "This page isn't here" : "Something went wrong on this page"}</h1>
        <p className="mt-3 max-w-prose text-text-muted">
          {notFound ? "The link may be old." : "Reload the page to try again. Your cart is saved."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <a href="/" className="btn btn-secondary">
            Go to home
          </a>
        </div>
      </main>
    </div>
  );
}
