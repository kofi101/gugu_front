import { FirebaseError } from "firebase/app";

const AUTH: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match an account. Check them and try again.",
  "auth/wrong-password": "That email and password don't match an account. Check them and try again.",
  "auth/user-not-found": "That email and password don't match an account. Check them and try again.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use": "An account already uses this email. Sign in instead, or reset your password.",
  "auth/weak-password": "Use a password with at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes, then try again.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.",
  "auth/account-exists-with-different-credential":
    "This email is registered with a password. Sign in with your email and password.",
  "auth/requires-recent-login": "For your security, sign in again and retry.",
};

const COMMON: Record<string, string> = {
  "permission-denied": "You don't have access to this. Sign in with the right account and try again.",
  unauthenticated: "Sign in to continue.",
  unavailable: "We can't reach GUGU right now. Check your connection and try again.",
  "deadline-exceeded": "This is taking too long. Check your connection and try again.",
  "not-found": "We couldn't find that. It may have been removed.",
  "resource-exhausted": "Too many requests. Wait a moment and try again.",
  internal: "Something went wrong on our side. Try again in a moment.",
  "storage/unauthorized": "Upload refused. Files must be images or PDFs under 10 MB.",
  "storage/canceled": "Upload cancelled.",
  "storage/quota-exceeded": "Upload failed because storage is full. Contact support.",
};

/** Human, actionable message for a Firebase or unknown error. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Try again."): string {
  if (err instanceof FirebaseError) {
    if (AUTH[err.code]) return AUTH[err.code];
    const code = err.code.replace(/^functions\//, "").replace(/^firestore\//, "");
    // Callable errors thrown with HttpsError carry a user-facing message
    // (e.g. "Only 2 left of Kente stole").
    if (err.code.startsWith("functions/") && ["failed-precondition", "invalid-argument", "out-of-range", "already-exists", "aborted"].includes(code)) {
      return err.message || fallback;
    }
    if (COMMON[err.code]) return COMMON[err.code];
    if (COMMON[code]) return COMMON[code];
  }
  if (err instanceof Error && err.message && !/firebase|internal/i.test(err.message)) return err.message;
  return fallback;
}

export const isCode = (err: unknown, ...codes: string[]) =>
  err instanceof FirebaseError && codes.some((c) => err.code === c || err.code.endsWith(`/${c}`));
