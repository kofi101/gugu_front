/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next: string | null, fallback = "/account") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
