import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { LuHeart, LuTrash2 } from "react-icons/lu";
import { removeFromWishlist, watchWishlist, type WishlistItem } from "../data/account";
import { getProduct } from "../data/catalog";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { errorMessage } from "../lib/errors";
import { formatMoney } from "../lib/format";
import { isInStock } from "../lib/parse";
import { PageTitle } from "../components/Common";
import { ProductImage } from "../components/ProductCard";
import { Seo } from "../components/Seo";
import { EmptyState, ErrorState, PageLoader } from "../components/States";

function SavedItem({ item, uid }: { item: WishlistItem; uid: string }) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);

  async function moveToCart() {
    setBusy(true);
    try {
      const product = await getProduct(item.productId);
      if (!product || !isInStock(product)) {
        toast.error(`${item.name} isn't available right now.`);
        return;
      }
      await cart.add(product, 1);
      toast.success("Added to cart");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't add this to your cart. Try again."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await removeFromWishlist(uid, item.productId);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't remove this item. Try again."));
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-paper-line bg-white">
      <Link to={`/p/${item.productId}`} tabIndex={-1} aria-hidden>
        <ProductImage src={item.imageUrl} alt="" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h2 className="line-clamp-2 font-medium leading-snug">
          <Link to={`/p/${item.productId}`} className="hover:underline">
            {item.name}
          </Link>
        </h2>
        {item.price != null && (
          <p className="tabular text-sm text-text-muted">
            {formatMoney(item.price)} <span className="text-xs">when saved</span>
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button type="button" className="btn btn-primary btn-sm flex-1" onClick={moveToCart} disabled={busy}>
            Add to cart
          </button>
          <button type="button" className="btn btn-ghost btn-sm text-serial hover:bg-serial-soft" onClick={remove} disabled={busy}>
            <LuTrash2 aria-hidden className="h-4 w-4" />
            <span className="sr-only">Remove {item.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Wishlist() {
  const { user, initializing } = useAuth();
  const [items, setItems] = useState<WishlistItem[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) return;
    return watchWishlist(
      user.uid,
      (data) => {
        setItems(data);
        setError(null);
      },
      setError,
    );
  }, [user, attempt]);

  if (initializing) return <PageLoader />;

  if (!user) {
    return (
      <div className="shell py-8">
        <Seo title="Saved items" noindex />
        <h1 className="sr-only">Saved items</h1>
        <EmptyState
          icon={<LuHeart />}
          title="Save items for later"
          action={
            <Link to="/signin?next=%2Fwishlist" className="btn btn-primary">
              Sign in
            </Link>
          }
        >
          Sign in to save products and find them again on any device.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="shell py-6 sm:py-8">
      <Seo title="Saved items" noindex />
      <PageTitle>Saved items</PageTitle>
      {error ? (
        <ErrorState error={error} onRetry={() => setAttempt((a) => a + 1)} title="Saved items didn't load" />
      ) : items === null ? (
        <div className="skeleton h-64" aria-hidden />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<LuHeart />}
          title="Nothing saved yet"
          action={
            <Link to="/" className="btn btn-primary">
              Browse products
            </Link>
          }
        >
          Tap Save on any product to keep it here.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((i) => (
            <SavedItem key={i.productId} item={i} uid={user.uid} />
          ))}
        </ul>
      )}
    </div>
  );
}
