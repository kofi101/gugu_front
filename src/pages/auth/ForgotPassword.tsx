import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/auth";
import { errorMessage, isCode } from "../../lib/errors";
import { Seo } from "../../components/Seo";
import { AuthShell } from "./AuthShell";

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter the email address you signed up with.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSentTo(email);
    } catch (err) {
      // Don't reveal whether an account exists.
      if (isCode(err, "auth/user-not-found")) setSentTo(email);
      else setError(errorMessage(err, "We couldn't send the email. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Reset your password" sub="We'll email you a link to choose a new password.">
      <Seo title="Reset password" description="Reset the password for your GUGU account." noindex />
      {sentTo ? (
        <div role="status" className="space-y-4">
          <p className="rounded-md bg-leaf-soft px-3 py-3 text-leaf">
            If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. Check your inbox and spam folder.
          </p>
          <Link to="/signin" className="btn btn-primary">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="input"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && (
              <p id="email-error" role="alert" className="field-error">
                {error}
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <p className="text-sm">
            <Link to="/signin" className="link">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
