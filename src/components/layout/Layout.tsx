import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Slide, ToastContainer } from "react-toastify";
import { firebaseConfigured, usingEmulators } from "../../lib/firebase";
import { PageLoader } from "../States";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-thread-300 px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <ScrollToTop />
      {usingEmulators && (
        <p className="bg-thread-300 py-1 text-center text-xs font-semibold text-ink-950">Development: connected to Firebase emulators</p>
      )}
      {!firebaseConfigured && (
        <p role="alert" className="bg-serial py-2 text-center text-sm font-semibold text-white">
          The shop isn't configured yet. Set the VITE_FIREBASE_* variables and rebuild.
        </p>
      )}
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      {/* Inside the router so toasts can contain <Link>s. Top placement keeps the mobile checkout bar clear. Errors stay up for at least 6 s. */}
      <ToastContainer
        position="top-center"
        autoClose={6000}
        newestOnTop
        closeOnClick={false}
        pauseOnFocusLoss
        pauseOnHover
        transition={Slide}
        theme="light"
      />
    </div>
  );
}
