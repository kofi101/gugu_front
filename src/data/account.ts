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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, functions, storage } from "../lib/firebase";
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

export interface PlaceOrderInput {
  paymentMethod: PaymentMethod;
  shipping: ShippingAddress;
  shippingOptionId?: string;
}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  status: string;
  checkoutUrl?: string;
}

/** Server prices, checks stock and clears users/{uid}/cart. Lines are omitted so the server cart is used. */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const call = httpsCallable<PlaceOrderInput, PlaceOrderResult>(functions, "placeOrder");
  const payload: PlaceOrderInput = { paymentMethod: input.paymentMethod, shipping: input.shipping };
  if (input.shippingOptionId) payload.shippingOptionId = input.shippingOptionId;
  return (await call(payload)).data;
}

export async function confirmExpressPayPayment(orderId: string) {
  const call = httpsCallable<{ orderId: string }, { status: string; paymentStatus: string }>(functions, "confirmExpressPayPayment");
  return (await call({ orderId })).data;
}

export async function startExpressPayCheckout(orderId: string) {
  const call = httpsCallable<{ orderId: string }, { checkoutUrl: string }>(functions, "startExpressPayCheckout");
  return (await call({ orderId })).data;
}

export async function cancelOrder(orderId: string, reason?: string) {
  const call = httpsCallable<{ orderId: string; reason?: string }, { status: string }>(functions, "cancelOrder");
  return (await call(reason ? { orderId, reason } : { orderId })).data;
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

export function validateApplicationFile(f: File): string | null {
  if (!(f.type.startsWith("image/") || f.type === "application/pdf")) return `${f.name}: only images or PDF files are accepted.`;
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
