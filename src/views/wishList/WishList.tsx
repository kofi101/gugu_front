/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxCaretRight } from "react-icons/rx";
import { useSelector } from "react-redux";
import AppWishlistCard from "../../shared/AppWishListCard";
import "../../styles/AppCustomCss.css";
import { Product } from "../../helpers/interface/interfaces";
import EmptyCart from "../../assets/images/emptycart.webp";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchWishListFromServer } from "../../store/features/wishListFeature";

const WishList = () => {
  const wish = useSelector((store: any) => store.wishList);
  const user = useSelector((store: any) => store?.user?.currentUser);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchWishListFromServer() as any);
  }, []);
  return (
    <div className="mx-auto md:w-3/5">
      <div className="flex items-center py-3">
        <p className="cursor-pointer">Home</p>
        <RxCaretRight />
        <p>WishList</p>
      </div>
      <div className="gap-4 md:flex">
        <div className="md:w-full h-[500px] overflow-y-scroll custom-scrollbar mb-8">
          <div className="px-3 py-3 bg-gray-primary-400">
            {user ? (
              <div>
                {wish?.userWishList?.wishListProducts?.length === 1 ||
                wish?.userWishList?.wishListProducts?.length === 0 ? (
                  <p className="font-bold">
                    Wishlist ({wish?.userWishList?.wishListProducts?.length}) Item
                  </p>
                ) : (
                  <p className="font-bold">
                    Wishlist ({wish?.userWishList?.wishListProducts?.length}) Items
                  </p>
                )}
              </div>
            ) : (
              <div>
                {wish?.guestWishList?.length === 1 ? (
                  <p className="font-bold">
                    Wishlist ({wish?.guestWishList?.length}) Item
                  </p>
                ) : (
                  <p className="font-bold">
                    Wishlist ({wish?.guestWishList?.length}) Items
                  </p>
                )}
              </div>
            )}
          </div>
          {/* wish?.userWishList?.wishListProducts?.length */}
          {user ? (
            <div className="flex flex-col gap-4">
            {wish?.userWishList?.wishListProducts?.length > 0 ? (
              wish?.userWishList?.wishListProducts?.map((item: Product) => (
                <AppWishlistCard key={item.productId} item={item} />
              ))
            ) : (
              <div className="flex items-center justify-center">
                <img
                  src={EmptyCart}
                  alt="empty-cart"
                  className="w-[70%] mt-4"
                />
              </div>
            )}
          </div>
          ) : (
            <div className="flex flex-col gap-4">
            {wish?.guestWishList?.length > 0 ? (
              wish?.guestWishList?.map((item: Product) => (
                <AppWishlistCard key={item.productId} item={item} />
              ))
            ) : (
              <div className="flex items-center justify-center">
                <img
                  src={EmptyCart}
                  alt="empty-cart"
                  className="w-[70%] mt-4"
                />
              </div>
            )}
          </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default WishList;
