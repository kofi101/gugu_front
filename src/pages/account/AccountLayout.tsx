import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { LuLogOut, LuMail, LuMessageSquare, LuPackage, LuUser } from "react-icons/lu";
import { useAuth } from "../../context/auth";
import { errorMessage } from "../../lib/errors";

function VerifyEmailNotice() {
  const { user, resendVerification, refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);
  if (!user || user.emailVerified || !user.email) return null;
  return (
    <div role="status" className="mb-6 flex flex-col gap-3 rounded-lg border border-thread-500 bg-thread-300/25 p-4 sm:flex-row sm:items-center">
      <LuMail aria-hidden className="h-6 w-6 shrink-0 text-thread-700" />
      <p className="flex-1 text-sm text-text">
        Confirm your email address. We sent a link to <strong>{user.email}</strong>.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await refreshUser();
            } finally {
              setBusy(false);
            }
          }}
        >
          I've confirmed
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await resendVerification();
              toast.success(`Verification email sent to ${user.email}`);
            } catch (err) {
              toast.error(errorMessage(err, "Couldn't send the email. Try again later."));
            } finally {
              setBusy(false);
            }
          }}
        >
          Resend link
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { to: "/account", label: "Profile & address", icon: LuUser, end: true },
  { to: "/account/orders", label: "Orders", icon: LuPackage, end: false },
  { to: "/account/reviews", label: "Reviews", icon: LuMessageSquare, end: false },
];

export default function AccountLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="shell py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">Signed in as {user?.email ?? user?.displayName}</p>
          <h1 className="type-title text-2xl text-ink-950 sm:text-3xl">Your account</h1>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            await signOut();
            navigate("/", { replace: true });
          }}
        >
          <LuLogOut aria-hidden className="h-4 w-4" /> Sign out
        </button>
      </div>
      <VerifyEmailNotice />
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Account sections">
          <ul className="scroll-rail lg:mx-0 lg:flex-col lg:px-0">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center gap-2 rounded-md px-3 text-sm font-semibold ${isActive ? "bg-ink-900 text-white" : "bg-white text-ink-900 ring-1 ring-inset ring-paper-line hover:bg-ink-50 lg:bg-transparent lg:ring-0"}`
                  }
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
