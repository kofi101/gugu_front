import { Timestamp } from "firebase/firestore";
import type {
  Banner,
  Category,
  Merchant,
  Order,
  OrderLine,
  Product,
  Rating,
  ShippingAddress,
  SubCategory,
  UserProfile,
} from "./types";

type Data = Record<string, unknown>;

export const str = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const s = typeof v === "string" ? v : String(v);
  return s.trim() === "" ? undefined : s;
};

export const num = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

export const int = (v: unknown): number | undefined => {
  const n = num(v);
  return n === undefined ? undefined : Math.trunc(n);
};

export const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((e) => (typeof e === "string" ? e : String(e ?? ""))).filter(Boolean) : [];

export const strMap = (v: unknown): Record<string, string> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Data)) {
    if (k) out[k] = val == null ? "" : String(val);
  }
  return out;
};

export const date = (v: unknown): Date | undefined => {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  if (v && typeof v === "object" && "seconds" in v && typeof (v as { seconds: unknown }).seconds === "number") {
    return new Date((v as { seconds: number }).seconds * 1000);
  }
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
};

export function toProduct(id: string, d: Data): Product {
  return {
    id: str(d.id) ?? id,
    merchantId: str(d.merchantId) ?? "",
    categoryId: str(d.categoryId) ?? "",
    subCategoryId: str(d.subCategoryId) ?? "",
    name: str(d.name) ?? id,
    description: str(d.description),
    price: num(d.price) ?? 0,
    discountPrice: num(d.discountPrice),
    currency: str(d.currency) ?? "GHS",
    imageUrls: strList(d.imageUrls),
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    rating: num(d.rating),
    reviewCount: int(d.reviewCount),
    soldCount: int(d.soldCount),
    stockQuantity: int(d.stockQuantity),
    highlights: strList(d.highlights),
    specifications: strMap(d.specifications),
    returnPolicy: str(d.returnPolicy),
    supportNote: str(d.supportNote),
    relatedProductIds: strList(d.relatedProductIds),
    createdAt: date(d.createdAt),
  };
}

/** Same rule placeOrder uses: the discount applies only when 0 < discountPrice < price. */
export const hasDiscount = (p: Pick<Product, "price" | "discountPrice">) =>
  p.discountPrice != null && p.discountPrice > 0 && p.discountPrice < p.price;

export const displayPrice = (p: Pick<Product, "price" | "discountPrice">) =>
  hasDiscount(p) ? (p.discountPrice as number) : p.price;

export const discountPercent = (p: Pick<Product, "price" | "discountPrice">) =>
  hasDiscount(p) ? Math.round((1 - (p.discountPrice as number) / p.price) * 100) : 0;

export const isInStock = (p: Pick<Product, "isActive" | "stockQuantity">) =>
  p.isActive && (p.stockQuantity == null || p.stockQuantity > 0);

export function toCategory(id: string, d: Data): Category {
  return {
    id: str(d.id) ?? id,
    name: str(d.name) ?? id,
    sortOrder: num(d.sortOrder) ?? 9999,
    imageUrl: str(d.imageUrl),
  };
}

export function toSubCategory(id: string, d: Data): SubCategory {
  return { id: str(d.id) ?? id, categoryId: str(d.categoryId) ?? "", name: str(d.name) ?? id };
}

export function toMerchant(id: string, d: Data): Merchant {
  return {
    id: str(d.id) ?? id,
    name: str(d.name) ?? id,
    tagline: str(d.tagline),
    description: str(d.description),
    logoUrl: str(d.logoUrl),
    coverImageUrl: str(d.coverImageUrl),
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    rating: num(d.rating),
    productCount: int(d.productCount),
  };
}

export function toBanner(id: string, d: Data): Banner {
  const action = str(d.actionKind);
  return {
    id: str(d.id) ?? id,
    title: str(d.title)?.trim() ?? "",
    description: str(d.description)?.trim(),
    status: str(d.status) === "hide" ? "hide" : "show",
    placement: str(d.placement) ?? "homeTop",
    priority: int(d.priority) ?? 0,
    startAt: date(d.startAt),
    endAt: date(d.endAt),
    prefixImageUrl: str(d.prefixImageUrl),
    backgroundColorHex: str(d.backgroundColorHex),
    textColorHex: str(d.textColorHex),
    actionKind: action === "inAppRoute" || action === "externalUrl" ? action : "none",
    actionRoute: str(d.actionRoute),
    actionUrl: str(d.actionUrl),
    updatedAt: date(d.updatedAt),
  };
}

function toShipping(v: unknown): ShippingAddress {
  const d = (v && typeof v === "object" ? v : {}) as Data;
  return {
    fullName: str(d.fullName) ?? "",
    line1: str(d.line1) ?? "",
    line2: str(d.line2) ?? "",
    city: str(d.city) ?? "",
    region: str(d.region) ?? "",
    postalCode: str(d.postalCode) ?? "",
    phone: str(d.phone) ?? "",
  };
}

export function toOrder(id: string, d: Data): Order {
  const lines: OrderLine[] = Array.isArray(d.lines)
    ? (d.lines as Data[]).map((l) => ({
        productId: str(l.productId) ?? "",
        merchantId: str(l.merchantId) ?? "",
        name: str(l.name) ?? "Item",
        unitPrice: num(l.unitPrice) ?? 0,
        quantity: int(l.quantity) ?? 1,
        lineTotal: num(l.lineTotal) ?? (num(l.unitPrice) ?? 0) * (int(l.quantity) ?? 1),
        currency: str(l.currency) ?? "GHS",
        imageUrl: str(l.imageUrl),
      }))
    : [];
  const expresspay = (d.expresspay && typeof d.expresspay === "object" ? d.expresspay : {}) as Data;
  return {
    id,
    orderNumber: str(d.orderNumber) ?? id,
    userId: str(d.userId) ?? "",
    status: (str(d.status) ?? "placed") as Order["status"],
    paymentMethod: (str(d.paymentMethod) ?? "cash_on_delivery") as Order["paymentMethod"],
    paymentStatus: (str(d.paymentStatus) ?? "unpaid") as Order["paymentStatus"],
    lines,
    subtotal: num(d.subtotal) ?? 0,
    shippingFee: num(d.shippingFee) ?? 0,
    discount: num(d.discount) ?? 0,
    orderTotal: num(d.orderTotal) ?? 0,
    currency: str(d.currency) ?? "GHS",
    shipping: toShipping(d.shipping),
    createdAt: date(d.createdAt),
    updatedAt: date(d.updatedAt),
    checkoutUrl: str(expresspay.checkoutUrl),
    fulfilment: Object.fromEntries(
      Object.entries((d.fulfilment && typeof d.fulfilment === "object" ? d.fulfilment : {}) as Record<string, Data>).map(([m, f]) => [
        m,
        { status: (str(f?.status) ?? "placed") as Order["fulfilment"][string]["status"], deliveredAt: date(f?.deliveredAt) },
      ]),
    ),
    cancelledMerchantIds: strList(d.cancelledMerchantIds),
    refundRequired: d.refundRequired === true,
    refundAmount: num(d.refundAmount) ?? 0,
    cancelledAmount: num(d.cancelledAmount) ?? 0,
    statusHistory: Array.isArray(d.statusHistory)
      ? (d.statusHistory as Data[]).map((e) => ({ status: str(e.status) ?? "", at: date(e.at), by: str(e.by) }))
      : [],
  };
}

export function toRating(id: string, d: Data): Rating {
  return {
    id,
    userId: str(d.userId) ?? id,
    rating: Math.min(5, Math.max(1, num(d.rating) ?? 5)),
    message: str(d.message) ?? "",
    displayName: str(d.displayName),
    createdAt: date(d.createdAt),
    updatedAt: date(d.updatedAt),
  };
}

export function toProfile(uid: string, d: Data): UserProfile {
  return {
    uid,
    email: str(d.email),
    displayName: str(d.displayName),
    phone: str(d.phone),
    photoUrl: str(d.photoUrl),
    role: str(d.role),
    shippingLine1: str(d.shippingLine1),
    shippingLine2: str(d.shippingLine2),
    shippingCity: str(d.shippingCity),
    shippingRegion: str(d.shippingRegion),
    shippingPostalCode: str(d.shippingPostalCode),
    shippingPhone: str(d.shippingPhone),
  };
}
