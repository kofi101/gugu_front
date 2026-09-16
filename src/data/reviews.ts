import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toRating } from "../lib/parse";
import type { Rating } from "../lib/types";

export const REVIEW_MAX_CHARS = 2000;

export async function listReviews(productId: string, max = 20): Promise<Rating[]> {
  const snap = await getDocs(query(collection(db, "products", productId, "ratings"), orderBy("createdAt", "desc"), limit(max)));
  return snap.docs.map((d) => toRating(d.id, d.data()));
}

export async function getReview(productId: string, uid: string): Promise<Rating | null> {
  const snap = await getDoc(doc(db, "products", productId, "ratings", uid));
  return snap.exists() ? toRating(snap.id, snap.data()) : null;
}

/** Doc id = author uid (contract). createdAt is kept on edit; aggregates are updated by onRatingWrite. */
export async function saveReview(
  productId: string,
  author: { uid: string; displayName?: string | null },
  rating: number,
  message: string,
  isEdit: boolean,
) {
  const clean = message.trim().slice(0, REVIEW_MAX_CHARS);
  const payload: Record<string, unknown> = {
    userId: author.uid,
    rating: Math.round(Math.min(5, Math.max(1, rating))),
    message: clean,
    updatedAt: serverTimestamp(),
  };
  if (author.displayName) payload.displayName = author.displayName.slice(0, 80);
  if (!isEdit) payload.createdAt = serverTimestamp();
  await setDoc(doc(db, "products", productId, "ratings", author.uid), payload, { merge: true });
}

export async function deleteReview(productId: string, uid: string) {
  await deleteDoc(doc(db, "products", productId, "ratings", uid));
}
