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

/** Callable HttpsError messages from gugu_2.0 functions (platform contract error-code table). */
const CALLABLE: Record<string, string> = {
  SIGN_IN_REQUIRED: "Sign in to continue.",
  NOT_YOUR_ORDER: "This order belongs to a different account.",
  PAYMENT_METHOD_INVALID: "Choose a payment method.",
  SHIPPING_REQUIRED: "Add a delivery address.",
  SHIPPING_LINE1_REQUIRED: "Add the street, house number or landmark for delivery.",
  SHIPPING_CITY_REQUIRED: "Add the town or city for delivery.",
  SHIPPING_REGION_REQUIRED: "Choose the region for delivery.",
  SHIPPING_PHONE_REQUIRED: "Add a phone number the rider can call.",
  LINES_INVALID: "Your cart has an item we can't read. Remove it and add it again.",
  QUANTITY_INVALID: "Quantities must be between 1 and 999.",
  TOO_MANY_LINES: "Your cart has too many different items. Order up to 50 at a time.",
  CART_EMPTY: "Your cart is empty.",
  CART_INVALID: "Your cart has an item we can't read. Remove it and add it again.",
  PRODUCT_UNAVAILABLE: "An item in your cart is no longer available. Remove it and try again.",
  OUT_OF_STOCK: "An item in your cart doesn't have enough stock. Lower the quantity and try again.",
  SHIPPING_OPTION_INVALID: "That delivery option isn't available any more. Choose another.",
  ORDER_NOT_CANCELLABLE: "This order can't be cancelled any more. Contact us if you need help.",
  ORDER_NOT_AWAITING_PAYMENT: "This order isn't waiting for payment any more. Refresh to see its status.",
  ORDER_ALREADY_PAID: "This order is already paid.",
  NOT_EXPRESSPAY_ORDER: "This order isn't paid with ExpressPay.",
  ORDER_NOT_FOUND: "We couldn't find that order.",
  PRODUCT_NOT_FOUND: "An item in your cart is no longer listed. Remove it and try again.",
  SHIPPING_OPTION_REQUIRED: "Choose a delivery option.",
  VERIFICATION_REQUIRED: "Confirm your email address before paying on delivery, or pay online with ExpressPay.",
  QUANTITY_LIMIT: "Pay-on-delivery orders are limited to 20 of each item. Lower the quantity or pay online with ExpressPay.",
  TOO_MANY_OPEN_ORDERS:
    "You already have 3 pay-on-delivery orders on the way. Wait for one to arrive, or pay online with ExpressPay.",
  TOO_MANY_UNPAID_ORDERS:
    "You already have 3 orders waiting for ExpressPay payment. Pay or cancel one of them in your orders, or choose pay on delivery.",
  TOO_MANY_CHECKOUT_ATTEMPTS: "Too many payment attempts. Wait a few minutes and try again.",
  PAYMENT_INIT_FAILED: "ExpressPay couldn't start the payment. You weren't charged. Try again, or choose pay on delivery.",
};

/** The contract code carried in a callable error's message, e.g. "OUT_OF_STOCK". */
export function callableCode(err: unknown): string | null {
  if (err instanceof FirebaseError && err.code.startsWith("functions/") && /^[A-Z][A-Z0-9_]+$/.test(err.message)) return err.message;
  return null;
}

export function callableDetails<T = Record<string, unknown>>(err: unknown): T | undefined {
  return (err as { details?: T } | null)?.details;
}

/** Human, actionable message for a Firebase or unknown error. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Try again."): string {
  if (err instanceof FirebaseError) {
    if (AUTH[err.code]) return AUTH[err.code];
    const code = err.code.replace(/^functions\//, "").replace(/^firestore\//, "");
    const contractCode = callableCode(err);
    if (contractCode) {
      if (CALLABLE[contractCode]) return CALLABLE[contractCode];
      if (/^SHIPPING_[A-Z0-9]+_REQUIRED$/.test(contractCode)) return "Complete the delivery address.";
      if (contractCode.endsWith("_INVALID")) return "Some details aren't valid. Check the form and try again.";
      return COMMON[code] ?? fallback;
    }
    if (COMMON[err.code]) return COMMON[err.code];
    if (COMMON[code]) return COMMON[code];
  }
  if (err instanceof Error && err.message && !/firebase|internal/i.test(err.message)) return err.message;
  return fallback;
}

export const isCode = (err: unknown, ...codes: string[]) =>
  err instanceof FirebaseError && codes.some((c) => err.code === c || err.code.endsWith(`/${c}`));
