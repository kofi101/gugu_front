/* eslint-disable @typescript-eslint/no-explicit-any */
import { WishListItemProp, Product } from "../helpers/interface/interfaces";
import AppButton from "./AppButton";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  formatMoney,
  subStringLongText,
} from "../helpers/functions/helperFunctions";
import { useDispatch } from "react-redux";
import {
  fetchWishListFromServer,
  guestRemoveFromWishList,
  moveWishListToCart,
  removeItemsFromUserWishList,
} from "../store/features/wishListFeature";
import { fetchUserCart, guestAddToCart } from "../store/features/cartFeature";
import { useSelector } from "react-redux";

const AppWishListCard: React.FC<WishListItemProp> = ({ item }) => {
  const user = useSelector((store: any) => store?.user?.currentUser);
  const { wishListId, cartId } = useSelector((store: any) => store?.user);
  const isLoading = useSelector(
    (store: any) => store?.wishList?.removeWishListLoading
  );
  const { migrateToCartLoading } = useSelector((store: any) => store?.wishList);
  const {
    productName,
    salesPrice,
    brand,
    productCode,
    availability,
    productImages,
    imageOne,
  } = item;
  const dispatch = useDispatch();
  const handleRemove = (product: Product) => {
    user
      ? product.productId && dispatch(removeItemsFromUserWishList({ productId: product.productId }) as any)
      : dispatch(guestRemoveFromWishList(product));
  };

  const handleMoveToCart = (product: Product) => {
    if (product) {
      const productToAdd = {
        ...product,
        quantity: 1,
      };
      if (user?.uid) {
        dispatch(
          moveWishListToCart({
            customerId: user?.uid ?? '',
            wishListId: wishListId!,
            productId: product.productId!,
            cartId: cartId!,
          }) as any
        );
        setTimeout(() => {
          dispatch(fetchWishListFromServer() as any);
          // dispatch(removeItemsFromUserWishList(product) as any);
          dispatch(fetchUserCart() as any);
        }, 2000);
      } else {
        dispatch(guestRemoveFromWishList(product));
        dispatch(guestAddToCart(productToAdd));
      }
    }
  };
  return (
    <div className="flex w-full border">
      <div className=" w-1/4 h-[175px] md:h-[160px]">
        <img
          src={user ? imageOne : productImages?.[0] ?? ''}
          alt={productName}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="w-3/4 pt-2 px-4  bg-base-gray-200 md:h-[160px] h-[175px]">
        <div className="flex justify-between">
          <div>
            <p className="font-medium md:mb-1 md:text-lg">
              {subStringLongText(productName!, 55)}
            </p>
            <div>
              <div className="flex md:gap-4">
                <div>
                  <p>Brand: </p>
                  <p>Product Code:</p>
                  <p>Available:</p>
                </div>
                <div>
                  <p>{brand}</p>
                  <p>{productCode}</p>
                  <p>{availability}</p>
                </div>
              </div>
              <AppButton
                title="Remove"
                className="flex items-center px-3 py-1 mt-2 rounded-md bg-primary-500 text-white-primary-400"
                icon={<RiDeleteBin6Line />}
                clickHandler={() => handleRemove(item)}
                loading={isLoading}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-8">
            <p className="font-medium md:text-2xl">
              {formatMoney(salesPrice!)}
            </p>
            <AppButton
              title="Move To Cart"
              clickHandler={() => handleMoveToCart(item)}
              loading={migrateToCartLoading}
              className="flex items-center px-3 py-2 rounded-md bg-primary-500 text-white-primary-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppWishListCard;
