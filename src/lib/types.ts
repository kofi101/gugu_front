export interface Product {
  id: string;
  merchantId: string;
  categoryId: string;
  subCategoryId: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  currency: string;
  imageUrls: string[];
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  stockQuantity?: number;
  highlights: string[];
  specifications: Record<string, string>;
  returnPolicy?: string;
  supportNote?: string;
  relatedProductIds: string[];
  createdAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  imageUrl?: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Merchant {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  rating?: number;
  productCount?: number;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  status: "show" | "hide";
  placement: string;
  priority: number;
  startAt?: Date;
  endAt?: Date;
  prefixImageUrl?: string;
  backgroundColorHex?: string;
  textColorHex?: string;
  actionKind: "none" | "inAppRoute" | "externalUrl";
  actionRoute?: string;
  actionUrl?: string;
  updatedAt?: Date;
}

/** Display-only cart line (mirrors the mobile app's CartLine). placeOrder re-prices on the server. */
export interface CartLine {
  productId: string;
  merchantId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  currency: string;
  imageUrl?: string;
  stockQuantity?: number;
  listPrice?: number;
}

export type OrderStatus =
  | "awaiting_payment"
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed";

export type PaymentMethod = "cash_on_delivery" | "mobile_money_on_delivery" | "expresspay";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
}

export interface OrderLine {
  productId: string;
  merchantId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  currency: string;
  imageUrl?: string;
}

export interface StatusEvent {
  status: string;
  at?: Date;
  by?: string;
}

export type FulfilmentStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface MerchantFulfilment {
  status: FulfilmentStatus;
  deliveredAt?: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  /** Absent on a document written before the field existed: "we can't tell", never "unpaid". */
  paymentStatus?: PaymentStatus;
  lines: OrderLine[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  orderTotal: number;
  currency: string;
  shipping: ShippingAddress;
  createdAt?: Date;
  updatedAt?: Date;
  checkoutUrl?: string;
  statusHistory: StatusEvent[];
  /** Per-merchant fulfilment, keyed by merchantId (server-written). */
  fulfilment: Record<string, MerchantFulfilment>;
  cancelledMerchantIds: string[];
  refundRequired: boolean;
  refundAmount: number;
  /** ExpressPay approved a payment that doesn't match this order, was paid twice, or paid after it closed. */
  paymentReviewRequired: boolean;
  /** GHS of cancelled lines (plus shipping when nothing was delivered), any payment method. */
  cancelledAmount: number;
}

export interface Rating {
  id: string;
  userId: string;
  rating: number;
  message: string;
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  phone?: string;
  photoUrl?: string;
  role?: string;
  shippingLine1?: string;
  shippingLine2?: string;
  shippingCity?: string;
  shippingRegion?: string;
  shippingPostalCode?: string;
  shippingPhone?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  fee?: number;
}

export interface MerchantApplication {
  businessName: string;
  phone: string;
  email: string;
  regionId: string;
  cityId: string;
  description: string;
  documentUrls: string[];
  status: string;
  createdAt?: Date;
  note?: string;
}

export interface NamedRef {
  id: string;
  name: string;
  regionId?: string;
}
