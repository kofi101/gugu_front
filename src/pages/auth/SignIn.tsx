import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../context/auth";
import { errorMessage } from "../../lib/errors";
import { safeNext } from "../../lib/nav";
import { Seo } from "../../components/Seo";
import { AuthShell, Divider, GoogleButton } from "./AuthShell";

export default function SignIn() {
  const { user, signIn } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={next} replace />;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Sign-in didn't work. Try again."));
      setBusy(false);
    }
  }

  const q = params.get("next") ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <AuthShell
      title="Sign in"
      sub={
        <>
          New to GUGU?{" "}
          <Link to={`/signup${q}`} className="link">
            Create an account
          </Link>
        </>
      }
    >
      <Seo title="Sign in" description="Sign in to your GUGU account to check out, track orders and write reviews." />
      <GoogleButton onDone={() => navigate(next, { replace: true })} />
      <Divider />
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <p role="alert" className="rounded-md bg-serial-soft px-3 py-2 text-sm font-medium text-serial">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <Link to="/forgot-password" className="link text-sm">
              Forgot password?
            </Link>
          </div>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
