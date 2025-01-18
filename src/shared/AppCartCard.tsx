/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { CartItemProp, Product } from "../helpers/interface/interfaces";
import AppButton from "../shared/AppButton";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  formatMoney,
  subStringLongText,
} from "../helpers/functions/helperFunctions";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserCart,
  guestRemoveFromCart,
  removeUserItemsFromCart,
  updateUserItemsInCart,
} from "../store/features/cartFeature";
import AppLoader from "./AppLoader";

const AppCartCard: React.FC<CartItemProp> = ({ item }) => {
  const isUserLoggedIn = useSelector((store: any) => store?.user?.currentUser);
  const isLoading = useSelector((store: any) => store?.cart?.removeCartLoading);
  const cartId = useSelector((store: any) => store?.user?.cartId);
  const {
    
    productName,
    salesPrice,
    quantity,
    imageOne,
    brand,
    productCode,
    availability,
    productImages,
  } = item;
  const dispatch = useDispatch();

  const [initialCounter, setInitialCounter] = useState(quantity!);
  const [initialPrice, setInitialPrice] = useState(salesPrice!);
  // const [priceValue, setPriceValue] = useState(salesPrice!);
  const [isQuantityChanging, setIsQuantityChanging] = useState(false);

  const handleQuantityChangeIncrease = (item: any) => {
    setIsQuantityChanging(true);
    setInitialCounter((prev) => {
      return prev + 1;
    });
    if (isUserLoggedIn) {
      const customerId = isUserLoggedIn?.uid;
      const productToUpdate = {
        productId: item.productId,
        quantity: initialCounter + 1,
      };
      dispatch(
        updateUserItemsInCart({
          customerId: customerId,
          product: productToUpdate!,
          cartId: cartId,
        }) as any
      );
      setTimeout(() => {
        dispatch(fetchUserCart() as any);
      }, 2000);
      setTimeout(() => {
        setIsQuantityChanging(false);
      }, 3000);
    } else {
      setInitialPrice((prev) => prev + salesPrice!);
      setTimeout(() => {
        setIsQuantityChanging(false);
      }, 3000);
    }
  };
  const handleQuantityChangeDecrease = (item: any) => {
    if (initialCounter === 1) return;
    setIsQuantityChanging(true);
    setInitialCounter((prev) => prev - 1);
    if (isUserLoggedIn) {
      const customerId = isUserLoggedIn?.uid;
      const productToUpdate = {
        productId: item.productId,
        quantity: initialCounter - 1,
      };
      dispatch(
        updateUserItemsInCart({
          customerId: customerId,
          product: productToUpdate!,
          cartId: cartId,
        }) as any
      );
      setTimeout(() => {
        dispatch(fetchUserCart() as any);
      }, 2000);
      setTimeout(() => {
        setIsQuantityChanging(false);
      }, 3000);
    } else {
      setInitialPrice((prev) => prev - salesPrice!);
      setTimeout(() => {
        setIsQuantityChanging(false);
      }, 3000);
    }
  };

  const handleRemove = (item: Product) => {
    if (isUserLoggedIn) {
      dispatch(removeUserItemsFromCart(item) as any);

      setTimeout(() => {
        dispatch(fetchUserCart() as any);
      }, 2000);
    } else {
      dispatch(guestRemoveFromCart(item));
    }
  };
  return (
    <div className="flex w-full border">
      {isQuantityChanging && (
        <div className="fixed inset-0 z-10 flex items-center justify-center h-screen bg-black bg-opacity-50">
          <AppLoader height="40px" width="40px" />
        </div>
      )}

      <div className=" w-1/4 h-[175px] md:h-[160px]">
        <img
          src={isUserLoggedIn ? imageOne : productImages?.[0] ?? ""}
          alt={productName}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="w-3/4 pt-2 px-4  bg-base-gray-200 md:h-[160px] h-[175px]">
        <p className="font-medium md:mb-1 md:text-lg">
          {subStringLongText(productName!, 55)}
        </p>
        <div className="flex justify-between">
          <div>
            <div className="flex md:gap-4">
              <div className="hidden md:block">
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
          <div>
            <p className="font-medium md:text-2xl">
              {isUserLoggedIn
                ? formatMoney(salesPrice!)
                : formatMoney(initialPrice)}
            </p>
            <div className="flex items-center mt-4">
              <p
                onClick={() =>
                  isQuantityChanging ? "" : handleQuantityChangeDecrease(item)
                }
                className="w-8 h-8 text-xl font-bold text-center border cursor-pointer bg-gray-primary-400"
              >
                -
              </p>
              <p className="w-8 h-8 text-xl text-center bg-white">
                {initialCounter}
              </p>
              <p
                onClick={() =>
                  isQuantityChanging ? "" : handleQuantityChangeIncrease(item)
                }
                className="w-8 h-8 text-xl font-bold text-center border cursor-pointer bg-gray-primary-400"
              >
                +
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCartCard;
