import type { ShippingAddress, UserProfile } from "./types";

export type AddressErrors = Partial<Record<keyof ShippingAddress, string>>;

export function validateAddress(a: ShippingAddress): AddressErrors {
  const e: AddressErrors = {};
  if (!a.fullName.trim()) e.fullName = "Enter the name of the person receiving the order.";
  if (!a.line1.trim()) e.line1 = "Enter a street, house number or landmark.";
  if (!a.city.trim()) e.city = "Enter a town or city.";
  if (!a.region.trim()) e.region = "Choose a region.";
  const digits = a.phone.replace(/[^\d]/g, "");
  if (digits.length < 9 || digits.length > 13) e.phone = "Enter a phone number the rider can call, e.g. 024 123 4567.";
  return e;
}

export const profileToAddress = (p: UserProfile | null | undefined, fallbackName = ""): ShippingAddress => ({
  fullName: p?.displayName ?? fallbackName,
  line1: p?.shippingLine1 ?? "",
  line2: p?.shippingLine2 ?? "",
  city: p?.shippingCity ?? "",
  region: p?.shippingRegion ?? "",
  postalCode: p?.shippingPostalCode ?? "",
  phone: p?.shippingPhone ?? p?.phone ?? "",
});

