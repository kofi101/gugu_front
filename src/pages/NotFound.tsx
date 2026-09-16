import { Link } from "react-router";
import { Guilloche } from "../components/Guilloche";
import { Seo } from "../components/Seo";

export function NotFoundContent() {
  return (
    <div className="shell py-12 sm:py-20">
      <Seo title="Page not found" description="This page doesn't exist on GUGU." noindex />
      <div className="mx-auto grid max-w-3xl items-center gap-8 sm:grid-cols-[1fr_14rem]">
        <div>
          <p className="type-display tabular text-6xl text-serial">404</p>
          <h1 className="type-title mt-3 text-3xl text-ink-950">This page isn't here</h1>
          <p className="mt-3 max-w-prose text-text-muted">
            The link may be old, or the product may no longer be listed. Search for it, or start again from the home page.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="btn btn-primary">
              Go to home
            </Link>
            <Link to="/stores" className="btn btn-secondary">
              Browse stores
            </Link>
          </div>
        </div>
        <Guilloche className="hidden h-56 w-56 text-ink-300 sm:block" animate={false} />
      </div>
    </div>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}
