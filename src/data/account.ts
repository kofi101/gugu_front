import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { signOut } from "firebase/auth";
import { callableCode } from "../lib/errors";
import type { ChargeFacts } from "../lib/format";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, functions, storage } from "../lib/firebase";
import { date, str, strList, toOrder, toProfile } from "../lib/parse";
import type { MerchantApplication, Order, PaymentMethod, Product, ShippingAddress, UserProfile } from "../lib/types";
import { displayPrice } from "../lib/parse";

/* ---------- Profile ---------- */

/** Fields the client may write on users/{uid} (platform contract). */
const PROFILE_EDITABLE = [
  "displayName",
  "phone",
  "shippingLine1",
  "shippingLine2",
  "shippingCity",
  "shippingRegion",
  "shippingPostalCode",
  "shippingPhone",
] as const;

export type ProfilePatch = Partial<Record<(typeof PROFILE_EDITABLE)[number], string>>;

/**
 * Creates the profile on first sign-in; afterwards only touches lastLoginAt.
 * Never writes `role`: Functions own the role mirror (contract).
 */
export async function ensureProfile(user: User) {
  const refDoc = doc(db, "users", user.uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    const data: Record<string, unknown> = {
      uid: user.uid,
      isAnonymous: user.isAnonymous,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    if (user.email) data.email = user.email;
    if (user.displayName) data.displayName = user.displayName;
    if (user.photoURL) data.photoUrl = user.photoURL;
    await setDoc(refDoc, data);
  } else {
    await updateDoc(refDoc, { lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? toProfile(uid, snap.data()) : null;
}

export async function updateProfile(uid: string, patch: ProfilePatch) {
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const key of PROFILE_EDITABLE) {
    if (patch[key] !== undefined) data[key] = (patch[key] ?? "").trim();
  }
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

/* ---------- Orders ---------- */

export async function listOrders(uid: string, max = 50): Promise<Order[]> {
  const snap = await getDocs(query(collection(db, "users", uid, "orders"), orderBy("createdAt", "desc"), limit(max)));
  return snap.docs.map((d) => toOrder(d.id, d.data()));
}

export function watchOrder(
  uid: string,
  orderId: string,
  onData: (o: Order | null) => void,
  onError: (e: unknown) => void,
) {
  return onSnapshot(
    doc(db, "users", uid, "orders", orderId),
    (snap) => onData(snap.exists() ? toOrder(snap.id, snap.data()) : null),
    onError,
  );
}

/**
 * Calls a callable; on unauthenticated/REAUTH_REQUIRED (claims changed after this token was issued)
 * signs the user out and sends them to sign in again, returning to the current page.
 */
async function call<I, O>(name: string, input: I): Promise<O> {
  try {
    return (await httpsCallable<I, O>(functions, name)(input)).data;
  } catch (err) {
    if (callableCode(err) === "REAUTH_REQUIRED") {
      const next = `${window.location.pathname}${window.location.search}`;
      await signOut(auth).catch(() => undefined);
      window.location.assign(`/signin?reauth=1&next=${encodeURIComponent(next)}`);
    }
    throw err;
  }
}

export interface PlaceOrderInput {
  paymentMethod: PaymentMethod;
  shipping: ShippingAddress;
  shippingOptionId?: string;
  /** Same value for retries of one checkout attempt: the server returns the existing order instead of a duplicate. */
  clientRequestId: string;
}

/** Max quantity per line for pay-on-delivery orders (contract, QUANTITY_LIMIT). */
export const ON_DELIVERY_MAX_LINE_QTY = 20;

export const isOnDelivery = (m: PaymentMethod) => m === "cash_on_delivery" || m === "mobile_money_on_delivery";

export function newClientRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

export interface PlaceOrderResult extends ChargeFacts {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  status: string;
  checkoutUrl?: string;
}

/** Server prices, checks stock and clears users/{uid}/cart. Lines are omitted so the server cart is used. */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const payload: PlaceOrderInput = { paymentMethod: input.paymentMethod, shipping: input.shipping, clientRequestId: input.clientRequestId };
  if (input.shippingOptionId) payload.shippingOptionId = input.shippingOptionId;
  return call<PlaceOrderInput, PlaceOrderResult>("placeOrder", payload);
}

export interface PaymentCheckResult extends ChargeFacts {
  status: string;
  paymentStatus: string;
}

export async function confirmExpressPayPayment(orderId: string) {
  return call<{ orderId: string }, PaymentCheckResult>("confirmExpressPayPayment", { orderId });
}

export async function startExpressPayCheckout(orderId: string) {
  return call<{ orderId: string }, { checkoutUrl: string }>("startExpressPayCheckout", { orderId });
}

/** Customers may cancel only before fulfilment starts (contract round 2). */
export function customerCancelState(o: Order): { allowed: boolean; reason?: string } {
  if (o.status === "awaiting_payment") return { allowed: true };
  if (o.status === "placed") {
    const entries = Object.values(o.fulfilment);
    if (entries.every((f) => f.status === "placed")) return { allowed: true };
    return { allowed: false, reason: "A store has started preparing this order, so it can't be cancelled here. Contact us if you need help." };
  }
  if (o.status === "processing" || o.status === "shipped")
    return { allowed: false, reason: "This order is already being prepared or on the way, so it can't be cancelled here. Contact us if you need help." };
  return { allowed: false };
}

export async function cancelOrder(orderId: string, reason?: string) {
  return call<{ orderId: string; reason?: string }, { status: string }>("cancelOrder", reason ? { orderId, reason } : { orderId });
}

/** Only follow ExpressPay redirects to an https URL. */
export function safeCheckoutUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname)) ? u.toString() : null;
  } catch {
    return null;
  }
}

/* ---------- Purchases (review eligibility) ---------- */

/** Server-written marker users/{uid}/purchased/{productId}, created when an order line is delivered. */
export async function hasDeliveredPurchase(uid: string, productId: string) {
  return (await getDoc(doc(db, "users", uid, "purchased", productId))).exists();
}

export async function listPurchasedProductIds(uid: string, max = 100): Promise<string[]> {
  const snap = await getDocs(query(collection(db, "users", uid, "purchased"), limit(max)));
  return snap.docs.map((d) => d.id);
}

/* ---------- Wishlist ---------- */

export interface WishlistItem {
  productId: string;
  name: string;
  imageUrl?: string;
  price?: number;
  addedAt?: Date;
}

export function watchWishlist(uid: string, onData: (items: WishlistItem[]) => void, onError: (e: unknown) => void) {
  return onSnapshot(
    query(collection(db, "users", uid, "wishlist"), limit(200)),
    (snap) =>
      onData(
        snap.docs
          .map((d) => {
            const x = d.data();
            return {
              productId: d.id,
              name: str(x.name) ?? "Saved item",
              imageUrl: str(x.imageUrl),
              price: typeof x.price === "number" ? x.price : undefined,
              addedAt: date(x.addedAt),
            };
          })
          .sort((a, b) => (b.addedAt?.getTime() ?? 0) - (a.addedAt?.getTime() ?? 0)),
      ),
    onError,
  );
}

export function watchWishlistItem(uid: string, productId: string, onData: (saved: boolean) => void) {
  return onSnapshot(
    doc(db, "users", uid, "wishlist", productId),
    (snap) => onData(snap.exists()),
    () => onData(false),
  );
}

export async function addToWishlist(uid: string, p: Product) {
  const data: Record<string, unknown> = {
    productId: p.id,
    merchantId: p.merchantId,
    name: p.name,
    price: displayPrice(p),
    currency: p.currency,
    addedAt: serverTimestamp(),
  };
  if (p.imageUrls[0]) data.imageUrl = p.imageUrls[0];
  await setDoc(doc(db, "users", uid, "wishlist", p.id), data);
}

export async function removeFromWishlist(uid: string, productId: string) {
  await deleteDoc(doc(db, "users", uid, "wishlist", productId));
}

/* ---------- Sell on GUGU ---------- */

export const APPLICATION_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const APPLICATION_MAX_FILES = 5;

export async function getMerchantApplication(uid: string): Promise<MerchantApplication | null> {
  const snap = await getDoc(doc(db, "merchant_applications", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    businessName: str(d.businessName) ?? "",
    phone: str(d.phone) ?? "",
    email: str(d.email) ?? "",
    regionId: str(d.regionId) ?? "",
    cityId: str(d.cityId) ?? "",
    description: str(d.description) ?? "",
    documentUrls: strList(d.documentUrls),
    status: str(d.status) ?? "pending",
    createdAt: date(d.createdAt),
    note: str(d.note) ?? str(d.reviewNote),
  };
}

/**
 * Withdraws a pending application: `status` only, so the details the applicant
 * sent stay on the record (firestore.rules refuses an update that touches
 * anything else). They can submit again afterwards — a withdrawn application is
 * re-applicable in the same way a rejected one is.
 */
export async function withdrawMerchantApplication(uid: string): Promise<void> {
  await updateDoc(doc(db, "merchant_applications", uid), { status: "withdrawn" });
}

export const APPLICATION_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function validateApplicationFile(f: File): string | null {
  if (!APPLICATION_FILE_TYPES.includes(f.type)) return `${f.name}: use a JPG, PNG, WebP or PDF file.`;
  if (f.size > APPLICATION_MAX_FILE_BYTES) return `${f.name}: files must be 10 MB or smaller.`;
  return null;
}

export async function submitMerchantApplication(
  uid: string,
  fields: Omit<MerchantApplication, "documentUrls" | "status" | "createdAt" | "note">,
  files: File[],
) {
  const documentUrls: string[] = [];
  for (const [i, f] of files.slice(0, APPLICATION_MAX_FILES).entries()) {
    const safe = f.name.replace(/[^\w.-]+/g, "_").slice(-80);
    const fileRef = ref(storage, `merchant_applications/${uid}/${Date.now()}-${i}-${safe}`);
    await uploadBytes(fileRef, f, { contentType: f.type });
    documentUrls.push(await getDownloadURL(fileRef));
  }
  await setDoc(doc(db, "merchant_applications", uid), {
    businessName: fields.businessName.trim(),
    phone: fields.phone.trim(),
    email: fields.email.trim(),
    regionId: fields.regionId,
    cityId: fields.cityId,
    description: fields.description.trim(),
    documentUrls,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}
