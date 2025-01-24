/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { categoryProductProp, Product } from "../helpers/interface/interfaces";
import AppButton from "./AppButton";
import {
  subStringLongText,
  formatMoney,
} from "../helpers/functions/helperFunctions";
import Rating from "@mui/material/Rating";
import { BsCart3 } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import {
  addUserItemsToCart,
  guestAddToCart,
} from "../store/features/cartFeature";
import {
  addItemToUserWishList,
  guestAddToWishList,
} from "../store/features/wishListFeature";
import { useNavigate } from "react-router";
import { routerPath } from "../routes/Router";

const AppCategoryCard: React.FC<categoryProductProp> = ({ category }) => {
  const navigate = useNavigate();
  const { currentUser, wishListId, cartId } = useSelector(
    (store: any) => store.user
  );

  const isLoading = useSelector((store: any) => store?.cart?.addCartLoading);
  const { addToWishListLoading } = useSelector((store: any) => store?.wishList);

  const dispatch = useDispatch();
  const onCategoryProductClick = (category: Product) => {
    if (category) {
      const categoryProductToAdd = {
        ...category,
        quantity: 1,
      };
      const productToAddForUser = {
        productId: category.productId || 0,
        quantity: 1,
      };
      if (currentUser) {
        dispatch(
          addUserItemsToCart({
            customerId: currentUser?.uid,
            product: productToAddForUser!,
            cartId: cartId!,
          }) as any
        );
      } else {
        dispatch(guestAddToCart(categoryProductToAdd));
      }
    }
  };
  const onCategoryFavoriteClick = (category: Product) => {
    if (currentUser) {
      dispatch(
        addItemToUserWishList({
          customerId: currentUser?.uid,
          productId: category.productId ?? 0,
          quantity: 1,
          wishListId: wishListId!,
        }) as any
      );
    } else {
      dispatch(guestAddToWishList(category));
    }
  };

  const saveToRecentlyViewed = (product: Product) => {
    const recentlyViewed = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );
    const updateRecentlyViewed = [
      product,
      ...recentlyViewed.filter(
        (item: Product) => item.productId !== product.productId
      ),
    ];
    localStorage.setItem(
      "recentlyViewed",
      JSON.stringify(updateRecentlyViewed.slice(0, 6))
    );
  };

  const onProductClickedFromCategory = (category: Product) => {
    saveToRecentlyViewed(category);
    navigate(`${routerPath.PRODUCTDETAILS}${category.productId}`);
  };
  return (
    <div className="border cursor-pointer bg-white-primary-400 border-gray-primary-400">
      <div
        className="relative"
        onClick={() => onProductClickedFromCategory(category)}
      >
        <img
          className="h-[150px] w-full object-cover"
          src={category.productImages![0]}
          alt={category.productName}
        />
      </div>

      <div className="p-2 ">
        {category.productName && (
          <div className="mb-2 text-lg font-semibold">
            {subStringLongText(category.productName, 22)}
          </div>
        )}
        <div
          className="flex gap-2 text-[14px] "
          onClick={() => onProductClickedFromCategory(category)}
        >
          <div>
            <p>Brand:</p>
            <p>Code:</p>
            <p>Availability:</p>
          </div>
          <div>
            <p>{category.brand}</p>
            <p>{subStringLongText(category.productCode!, 12)}</p>
            <p>{category.availability}</p>
          </div>
        </div>
        {category.promotionPrice ? (
          <div
            className="flex gap-4 mt-4 text-primary-500"
            onClick={() => onProductClickedFromCategory(category)}
          >
            {category.promotionPrice && (
              <p className="line-through">
                {formatMoney(category.salesPrice!)}
              </p>
            )}

            <p>{category.discountPercentage}%</p>
          </div>
        ) : <div className="mt-10"></div>}

        {category.salesPrice && (
          <div
            className="font-semibold text-[18px]"
            onClick={() => onProductClickedFromCategory(category)}
          >
            {formatMoney(category.promotionPrice ? category.promotionPrice : category.salesPrice)}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Rating
            className="!text-[20px] !text-primary-yellow"
            name="simple-controlled"
            value={category.reviewStars}
          />
          <p className="text-[14px] text-primary-500">{category.reviewStars} reviews</p>
          
        </div>
        <div className="flex items-center justify-between ">
          <div className="w-[78%]">
            {category.availability?.toLowerCase() === "out of stock" ? (
              <AppButton
                clickHandler={() => {}}
                title="Add to Cart"
                className="flex items-center justify-center w-full gap-1 px-1 py-1 uppercase rounded-lg bg-gray-primary-400 text-white-primary-400 space-between"
                icon={<BsCart3 />}
              />
            ) : (
              <AppButton
                clickHandler={() => onCategoryProductClick(category)}
                title="Add to Cart"
                className="flex items-center justify-center w-full gap-1 px-1 py-1 uppercase rounded-lg bg-primary-500 text-white-primary-400 hover:bg-primary-400 space-between"
                icon={<BsCart3 />}
                loading={isLoading}
              />
            )}
          </div>
          <div className="">
            {category.availability?.toLowerCase() === "out of stock" ? (
              <AppButton
                title=""
                clickHandler={() => {}}
                icon={<AiOutlineHeart />}
                className="flex items-center px-2 py-2 rounded-lg bg-gray-primary-400 text-white-primary-400 "
              />
            ) : (
              <AppButton
                title=""
                clickHandler={() => onCategoryFavoriteClick(category)}
                icon={<AiOutlineHeart />}
                loading={addToWishListLoading}
                className="flex items-center px-2 py-2 rounded-lg bg-primary-500 text-white-primary-400 hover:bg-primary-400"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCategoryCard;
