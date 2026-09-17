import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { collection, deleteDoc, doc, onSnapshot, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { displayPrice, hasDiscount, int, num, str } from "../lib/parse";
import type { CartLine, Product } from "../lib/types";
import { useAuth } from "./auth";
import { CartContext, MAX_LINE_QUANTITY, lineCap, type CartState } from "./cart";

const GUEST_KEY = "gugu.cart.v1";

function readGuest(): CartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((l: Record<string, unknown>) => toLine(String(l.productId ?? ""), l))
      .filter((l) => l.productId && l.quantity > 0);
  } catch {
    return [];
  }
}

function writeGuest(lines: CartLine[]) {
  try {
    if (lines.length) localStorage.setItem(GUEST_KEY, JSON.stringify(lines));
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    /* storage unavailable (private mode): cart lives in memory for this tab */
  }
}

function toLine(productId: string, d: Record<string, unknown>): CartLine {
  return {
    productId,
    merchantId: str(d.merchantId) ?? "",
    name: str(d.name) ?? "Item",
    unitPrice: num(d.unitPrice) ?? 0,
    quantity: Math.max(1, Math.min(MAX_LINE_QUANTITY, int(d.quantity) ?? 1)),
    currency: str(d.currency) ?? "GHS",
    imageUrl: str(d.imageUrl),
    stockQuantity: int(d.stockQuantity),
    listPrice: num(d.listPrice),
  };
}

function lineFromProduct(p: Product, quantity: number): CartLine {
  return {
    productId: p.id,
    merchantId: p.merchantId,
    name: p.name,
    unitPrice: displayPrice(p),
    quantity,
    currency: p.currency,
    imageUrl: p.imageUrls[0],
    stockQuantity: p.stockQuantity,
    listPrice: hasDiscount(p) ? p.price : undefined,
  };
}

/** Firestore rejects undefined values. */
function firestoreLine(l: CartLine) {
  const out: Record<string, unknown> = { ...l, updatedAt: serverTimestamp() };
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const uid = user?.uid ?? null;
  const [guestLines, setGuestLines] = useState<CartLine[]>(readGuest);
  // Snapshot tagged with the uid it belongs to, so a stale cart is never shown after switching users.
  const [account, setAccount] = useState<{ uid: string; lines: CartLine[] } | null>(null);
  const [mergeFailedFor, setMergeFailedFor] = useState<string | null>(null);
  const mergedFor = useRef<string | null>(null);

  // Keep guest carts in sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_KEY) setGuestLines(readGuest());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Account cart: live subscription.
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      collection(db, "users", uid, "cart"),
      (snap) =>
        setAccount({ uid, lines: snap.docs.map((d) => toLine(d.id, d.data())).sort((a, b) => a.name.localeCompare(b.name)) }),
      (err) => {
        console.warn("[gugu] cart subscription failed", err);
        setAccount({ uid, lines: [] });
      },
    );
  }, [uid]);
  const accountLines = useMemo(() => (uid && account?.uid === uid ? account.lines : []), [uid, account]);
  const accountLoading = Boolean(uid) && account?.uid !== uid;
  // Merging while signed in with a guest cart still waiting to be moved (unless that merge failed).
  const merging = Boolean(uid) && guestLines.length > 0 && mergeFailedFor !== uid;

  // Merge the guest cart into the account cart once per sign-in. Uses max(existing, guest)
  // so a retried or repeated merge can never inflate quantities.
  useEffect(() => {
    if (!uid || mergedFor.current === uid) return;
    const guest = readGuest();
    mergedFor.current = uid;
    if (!guest.length) return;
    runTransaction(db, async (tx) => {
      const refs = guest.map((l) => doc(db, "users", uid, "cart", l.productId));
      const snaps = await Promise.all(refs.map((r) => tx.get(r)));
      snaps.forEach((snap, i) => {
        const g = guest[i];
        const existing = snap.exists() ? int(snap.data().quantity) ?? 0 : 0;
        const quantity = Math.min(lineCap(g.stockQuantity), Math.max(existing, g.quantity));
        tx.set(refs[i], firestoreLine({ ...g, quantity }), { merge: true });
      });
    })
      .then(() => {
        writeGuest([]);
        setGuestLines([]);
      })
      .catch((err) => {
        console.warn("[gugu] cart merge failed; guest cart kept for the next sign-in", err);
        setMergeFailedFor(uid);
      });
  }, [uid]);

  useEffect(() => {
    if (!uid) mergedFor.current = null;
  }, [uid]);

  const updateGuest = useCallback((fn: (lines: CartLine[]) => CartLine[]) => {
    setGuestLines((prev) => {
      const next = fn(prev);
      writeGuest(next);
      return next;
    });
  }, []);

  const add = useCallback<CartState["add"]>(
    async (product, quantity = 1) => {
      const cap = lineCap(product.stockQuantity);
      if (!uid) {
        updateGuest((lines) => {
          const found = lines.find((l) => l.productId === product.id);
          const q = Math.min(cap, (found?.quantity ?? 0) + quantity);
          const line = lineFromProduct(product, q);
          return found ? lines.map((l) => (l.productId === product.id ? line : l)) : [...lines, line];
        });
        return;
      }
      const lineRef = doc(db, "users", uid, "cart", product.id);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(lineRef);
        const existing = snap.exists() ? int(snap.data().quantity) ?? 0 : 0;
        tx.set(lineRef, firestoreLine(lineFromProduct(product, Math.min(cap, existing + quantity))));
      });
    },
    [uid, updateGuest],
  );

  const setQuantity = useCallback<CartState["setQuantity"]>(
    async (productId, quantity) => {
      const lines = uid ? accountLines : guestLines;
      const line = lines.find((l) => l.productId === productId);
      if (!line) return;
      const q = Math.max(1, Math.min(lineCap(line.stockQuantity), Math.trunc(quantity)));
      if (!uid) {
        updateGuest((ls) => ls.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)));
        return;
      }
      await updateDoc(doc(db, "users", uid, "cart", productId), { quantity: q, updatedAt: serverTimestamp() });
    },
    [uid, accountLines, guestLines, updateGuest],
  );

  const remove = useCallback<CartState["remove"]>(
    async (productId) => {
      if (!uid) {
        updateGuest((ls) => ls.filter((l) => l.productId !== productId));
        return;
      }
      await deleteDoc(doc(db, "users", uid, "cart", productId));
    },
    [uid, updateGuest],
  );

  const value = useMemo<CartState>(() => {
    const lines = uid ? accountLines : guestLines;
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      estimatedSubtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
      mode: uid ? "account" : "guest",
      loading: initializing || (Boolean(uid) && accountLoading),
      merging,
      add,
      setQuantity,
      remove,
    };
  }, [uid, accountLines, guestLines, initializing, accountLoading, merging, add, setQuantity, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
