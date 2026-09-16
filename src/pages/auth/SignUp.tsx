import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth";
import { errorMessage } from "../../lib/errors";
import { safeNext } from "../../lib/nav";
import { Seo } from "../../components/Seo";
import { AuthShell, Divider, GoogleButton } from "./AuthShell";

const MIN_PASSWORD = 8;

export default function SignUp() {
  const { user, signUp } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={next} replace />;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const errs: Record<string, string> = {};
    if (!name) errs.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD) errs.password = `Use at least ${MIN_PASSWORD} characters.`;
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await signUp(name, email, password);
      toast.success(`Account created. We sent a verification link to ${email}.`);
      navigate(next, { replace: true });
    } catch (err) {
      setFormError(errorMessage(err, "We couldn't create your account. Try again."));
      setBusy(false);
    }
  }

  const q = params.get("next") ? `?next=${encodeURIComponent(next)}` : "";
  const field = (id: string) => ({
    "aria-invalid": errors[id] ? true : undefined,
    "aria-describedby": errors[id] ? `${id}-error` : id === "password" ? "password-hint" : undefined,
  });

  return (
    <AuthShell
      title="Create your account"
      sub={
        <>
          Already have one?{" "}
          <Link to={`/signin${q}`} className="link">
            Sign in
          </Link>
        </>
      }
    >
      <Seo title="Create an account" description="Create a GUGU account to check out, track your orders and save items." />
      <GoogleButton label="Sign up with Google" onDone={() => navigate(next, { replace: true })} />
      <Divider />
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-md bg-serial-soft px-3 py-2 text-sm font-medium text-serial">
            {formError}
          </p>
        )}
        <div>
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input id="name" name="name" autoComplete="name" className="input" {...field("name")} />
          {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className="input" {...field("email")} />
          {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input id="password" name="password" type="password" autoComplete="new-password" className="input" {...field("password")} />
          {errors.password ? (
            <p id="password-error" className="field-error">{errors.password}</p>
          ) : (
            <p id="password-hint" className="field-hint">At least {MIN_PASSWORD} characters.</p>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="text-xs text-text-muted">
          By creating an account you agree to the{" "}
          <Link to="/terms" className="link">
            Terms of use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="link">
            Privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
