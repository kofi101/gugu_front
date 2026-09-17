import { createContext, useContext } from "react";
import type { CartLine, Product } from "../lib/types";

export const MAX_LINE_QUANTITY = 999;

export interface CartState {
  lines: CartLine[];
  /** Total units across lines. */
  count: number;
  /** Display estimate only; placeOrder computes the real total. */
  estimatedSubtotal: number;
  /** "guest" = localStorage, "account" = users/{uid}/cart. */
  mode: "guest" | "account";
  loading: boolean;
  /** True while a guest cart is being merged into the account cart after sign-in. */
  merging: boolean;
  add(product: Product, quantity?: number): Promise<void>;
  setQuantity(productId: string, quantity: number): Promise<void>;
  remove(productId: string): Promise<void>;
}

export const CartContext = createContext<CartState | null>(null);

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export const lineCap = (stock?: number) =>
  Math.max(1, Math.min(MAX_LINE_QUANTITY, stock == null ? MAX_LINE_QUANTITY : stock));
