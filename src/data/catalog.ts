import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { isCode } from "../lib/errors";
import { hasDiscount, toBanner, toCategory, toMerchant, toProduct, toSubCategory, str, num } from "../lib/parse";
import { firestoreToken, matchesAllWords, queryWords } from "../lib/search";
import type { Banner, Category, Merchant, NamedRef, Product, ShippingOption, SubCategory } from "../lib/types";

// Products are only publicly readable when isActive == true, so every list query
// carries that filter (rules must be able to prove it).
const ACTIVE = where("isActive", "==", true);

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, "categories"), limit(200)));
  return snap.docs
    .map((d) => toCategory(d.id, d.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function getCategory(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, "categories", id));
  return snap.exists() ? toCategory(snap.id, snap.data()) : null;
}

export async function getSubCategories(categoryId: string): Promise<SubCategory[]> {
  const snap = await getDocs(query(collection(db, "subcategories"), where("categoryId", "==", categoryId), limit(100)));
  return snap.docs.map((d) => toSubCategory(d.id, d.data())).sort((a, b) => a.name.localeCompare(b.name));
}

/** Active banners, best first (same selection rule as the mobile app). */
export async function getActiveBanners(): Promise<Banner[]> {
  const snap = await getDocs(query(collection(db, "banners"), limit(50)));
  const now = Date.now();
  return snap.docs
    .map((d) => toBanner(d.id, d.data()))
    .filter(
      (b) =>
        b.status === "show" &&
        b.title &&
        (!b.startAt || b.startAt.getTime() <= now) &&
        (!b.endAt || b.endAt.getTime() >= now),
    )
    .sort(
      (a, b) =>
        b.priority - a.priority || (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0) || b.id.localeCompare(a.id),
    );
}

export async function getMerchants(max = 24): Promise<Merchant[]> {
  const snap = await getDocs(query(collection(db, "merchants"), limit(max)));
  return snap.docs
    .map((d) => toMerchant(d.id, d.data()))
    .filter((m) => m.isActive)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name));
}

export async function getMerchant(id: string): Promise<Merchant | null> {
  const snap = await getDoc(doc(db, "merchants", id));
  if (!snap.exists()) return null;
  const m = toMerchant(snap.id, snap.data());
  return m.isActive ? m : null;
}

export async function getMerchantsByIds(ids: string[]): Promise<Map<string, Merchant>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const out = new Map<string, Merchant>();
  for (let i = 0; i < unique.length; i += 30) {
    const chunk = unique.slice(i, i + 30);
    const snap = await getDocs(query(collection(db, "merchants"), where(documentId(), "in", chunk)));
    snap.docs.forEach((d) => out.set(d.id, toMerchant(d.id, d.data())));
  }
  return out;
}

export type ProductSort = "recommended" | "price-asc" | "price-desc" | "newest" | "top-rated";

export const SORT_LABELS: Record<ProductSort, string> = {
  recommended: "Recommended",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest",
  "top-rated": "Top rated",
};

export interface ProductListParams {
  categoryId?: string;
  subCategoryId?: string;
  merchantId?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  /** Document id of the last product on the previous page. */
  after?: string;
  pageSize?: number;
}

export interface ProductPage {
  items: Product[];
  nextCursor: string | null;
}

/** Cursor-based product listing. Needs composite indexes; see README "Firestore indexes". */
export async function listProducts(p: ProductListParams): Promise<ProductPage> {
  const pageSize = p.pageSize ?? 24;
  const constraints: QueryConstraint[] = [ACTIVE];
  if (p.categoryId) constraints.push(where("categoryId", "==", p.categoryId));
  if (p.subCategoryId) constraints.push(where("subCategoryId", "==", p.subCategoryId));
  if (p.merchantId) constraints.push(where("merchantId", "==", p.merchantId));
  const hasRange = p.minPrice != null || p.maxPrice != null;
  if (p.minPrice != null) constraints.push(where("price", ">=", p.minPrice));
  if (p.maxPrice != null) constraints.push(where("price", "<=", p.maxPrice));

  // With a price range only price ordering is used, so each scope needs one composite index per sort.
  const sort = hasRange && (p.sort === "newest" || p.sort === "top-rated") ? "price-asc" : p.sort;
  switch (sort) {
    case "price-asc":
      constraints.push(orderBy("price", "asc"));
      break;
    case "price-desc":
      constraints.push(orderBy("price", "desc"));
      break;
    case "newest":
      constraints.push(orderBy("createdAt", "desc"));
      break;
    case "top-rated":
      constraints.push(orderBy("rating", "desc"));
      break;
    default:
      if (hasRange) constraints.push(orderBy("price", "asc"));
  }

  if (p.after) {
    const cursor = await getDoc(doc(db, "products", p.after)).catch(() => null);
    if (cursor?.exists()) constraints.push(startAfter(cursor));
  }
  constraints.push(limit(pageSize + 1));

  const snap = await getDocs(query(collection(db, "products"), ...constraints));
  const docs = snap.docs.slice(0, pageSize);
  return {
    items: docs.map((d) => toProduct(d.id, d.data())),
    nextCursor: snap.docs.length > pageSize ? docs[docs.length - 1].id : null,
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) return null;
    const p = toProduct(snap.id, snap.data());
    return p.isActive ? p : null;
  } catch (err) {
    // Rules deny reads of inactive products: treat as not found.
    if (isCode(err, "permission-denied")) return null;
    throw err;
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  const found = new Map<string, Product>();
  for (let i = 0; i < unique.length; i += 30) {
    const chunk = unique.slice(i, i + 30);
    const snap = await getDocs(query(collection(db, "products"), ACTIVE, where(documentId(), "in", chunk)));
    snap.docs.forEach((d) => found.set(d.id, toProduct(d.id, d.data())));
  }
  return unique.map((id) => found.get(id)).filter((p): p is Product => Boolean(p));
}

export async function getPopularProducts(max = 8): Promise<Product[]> {
  const snap = await getDocs(query(collection(db, "products"), ACTIVE, orderBy("soldCount", "desc"), limit(max)));
  if (snap.size > 0) return snap.docs.map((d) => toProduct(d.id, d.data()));
  const fallback = await getDocs(query(collection(db, "products"), ACTIVE, limit(max)));
  return fallback.docs.map((d) => toProduct(d.id, d.data()));
}

export async function getDiscountedProducts(max = 8): Promise<Product[]> {
  const snap = await getDocs(
    query(collection(db, "products"), ACTIVE, where("discountPrice", ">", 0), orderBy("discountPrice", "asc"), limit(max * 3)),
  );
  return snap.docs
    .map((d) => toProduct(d.id, d.data()))
    .filter(hasDiscount)
    .slice(0, max);
}

export async function getRelatedProducts(p: Product, max = 8): Promise<Product[]> {
  if (p.relatedProductIds.length) {
    const rel = await getProductsByIds(p.relatedProductIds.slice(0, 30));
    if (rel.length) return rel.filter((r) => r.id !== p.id).slice(0, max);
  }
  const constraints: QueryConstraint[] = [ACTIVE];
  if (p.subCategoryId) constraints.push(where("subCategoryId", "==", p.subCategoryId));
  else if (p.categoryId) constraints.push(where("categoryId", "==", p.categoryId));
  const snap = await getDocs(query(collection(db, "products"), ...constraints, limit(max + 1)));
  return snap.docs
    .map((d) => toProduct(d.id, d.data()))
    .filter((r) => r.id !== p.id)
    .slice(0, max);
}

export interface SearchResult {
  products: Product[];
  merchants: Merchant[];
}

/** Prefix-token search on `advanceSearchableValues` (array-contains), then all-words client filter. */
export async function search(q: string): Promise<SearchResult> {
  const token = firestoreToken(q);
  if (!token) return { products: [], merchants: [] };
  const words = queryWords(q);
  const [productSnap, merchantSnap] = await Promise.all([
    getDocs(query(collection(db, "products"), ACTIVE, where("advanceSearchableValues", "array-contains", token), limit(60))),
    getDocs(query(collection(db, "merchants"), where("advanceSearchableValues", "array-contains", token), limit(12))),
  ]);
  const products = productSnap.docs
    .filter((d) => {
      const data = d.data();
      return matchesAllWords(data.advanceSearchableValues as string[], `${data.name ?? ""} ${data.description ?? ""}`, words);
    })
    .map((d) => toProduct(d.id, d.data()));
  const merchants = merchantSnap.docs
    .filter((d) => {
      const data = d.data();
      return matchesAllWords(data.advanceSearchableValues as string[], `${data.name ?? ""} ${data.tagline ?? ""}`, words);
    })
    .map((d) => toMerchant(d.id, d.data()))
    .filter((m) => m.isActive);
  return { products, merchants };
}

export async function getShippingOptions(): Promise<ShippingOption[]> {
  // Only active options are offered; placeOrder requires one whenever any is active.
  // The filter is in the query so an inactive option can never reach the picker, whatever the page size.
  // Note: docs must carry an explicit `isActive: true` — the server treats a missing field as active.
  const snap = await getDocs(query(collection(db, "shipping_options"), where("isActive", "==", true), limit(20)));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: str(data.name) ?? d.id,
        description: str(data.description),
        fee: num(data.fee),
        sortOrder: num(data.sortOrder) ?? 0,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, name, description, fee }) => ({ id, name, description, fee }));
}

export async function getRegions(): Promise<NamedRef[]> {
  const snap = await getDocs(query(collection(db, "regions"), limit(50)));
  return snap.docs
    .map((d) => ({ id: d.id, name: str(d.data().name) ?? d.id, sortOrder: num(d.data().sortOrder) ?? 999 }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map(({ id, name }) => ({ id, name }));
}

export async function getCities(regionId: string): Promise<NamedRef[]> {
  const snap = await getDocs(query(collection(db, "cities"), where("regionId", "==", regionId), limit(200)));
  return snap.docs
    .map((d) => ({ id: d.id, name: str(d.data().name) ?? d.id, regionId }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
