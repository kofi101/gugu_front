/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import "../../styles/AppCustomCss.css";
import { RxCaretRight } from "react-icons/rx";
import CategorySideBar from "./CategorySideBar";
import {
  formatDate,
  formatMoney,
  scrollToTop,
  subStringLongText,
} from "../../helpers/functions/helperFunctions";
import AppButton from "../../shared/AppButton";
import { TabProps } from "../../helpers/interface/interfaces";
import { BsCart3 } from "react-icons/bs";
import Rating from "@mui/material/Rating";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import AppProductCard from "../../shared/AppProductCard";
import { fetchProductToStore } from "../../store/features/productFeature";
import { useDispatch } from "react-redux";
import API, { getCategories, getProductReviews } from "../../endpoint";
import { useSelector } from "react-redux";
import { Product } from "../../helpers/interface/interfaces";
import { useParams } from "react-router";
import { routerPath } from "../../routes/Router";
import { useNavigate } from "react-router";
import {
  addUserItemsToCart,
  guestAddToCart,
} from "../../store/features/cartFeature";
import {
  guestRemoveFromWishList,
  guestAddToWishList,
  addItemToUserWishList,
  removeItemsFromUserWishList,
} from "../../store/features/wishListFeature";

const ProductDetailsPage = () => {
  const isUserLoggedIn = useSelector((store: any) => store?.user?.currentUser);
  const isLoading = useSelector((store: any) => store?.cart?.addCartLoading);
  const wishListId = useSelector((store: any) => store?.user?.wishListId);
  const cartId = useSelector((store: any) => store?.user?.cartId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [total, setTotal] = useState<number | null>(0);
  const [initTotal, setInitTotal] = useState<number | null>(0);
  const [counter, setCounter] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [favoriteClicked, setFavoriteClicked] = useState<boolean>(false);
  const [category, setCategory] = useState<any[]>([]);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [value, setValue] = useState<number | null>(
    productDetail?.reviewStars ?? 0
  );
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [productReviews, setProductReviews] = useState<any[]>([]);

  const { product } = useSelector(
    (store: { product: { product: Product[] } }) => store.product
  );
  const { productId } = useParams<{ productId?: string }>();

  const handleProductDetail = () => {
    const oneProduct = product.find(
      (item: Product) => item.productId === +productId!
    );
    if (oneProduct) {
      setProductDetail(oneProduct);
    }
    setInitTotal(oneProduct?.salesPrice ?? 0);
    setTotal(oneProduct?.salesPrice ?? 0);
  };

  const handleGetProductReviews = () => {
    API.get(`${getProductReviews}/${productId}`).then((response) => {
      const responsedata = response.data;
      setProductReviews(responsedata);
    });
  };

  useEffect(() => {
    dispatch(fetchProductToStore() as any);
    handleProductDetail();
    setFavoriteClicked((prev) => !prev);
    setSimilarProducts(product.slice(0, 6));
    handleGetProductReviews();
    setCategoryLoading(true);
    API.get(`${getCategories}`).then((response) => {
      const responsedata = response.data;
      setCategory(responsedata);
      setCategoryLoading(false);
    });
    scrollToTop();
  }, [productId]);

  const incrementTotalCounter = () => {
    setCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      setTotal(newCounter * initTotal!);
      return newCounter;
    });
  };
  const decrementTotalCounter = () => {
    setCounter((prevCounter) => {
      if (prevCounter <= 1) return prevCounter;
      const newCounter = prevCounter - 1;
      setTotal(newCounter * initTotal!);
      return newCounter;
    });
  };
  const handleCategoryClick = () => {
    navigate(routerPath.CATEGORIES);
  };

  const handleFavoriteClick = (product: Product) => {
    setFavoriteClicked((prev) => !prev);
    if (isUserLoggedIn?.uid) {
      favoriteClicked
        ? dispatch(
            removeItemsFromUserWishList({
              productId: product.productId!,
            }) as any
          )
        : dispatch(
            addItemToUserWishList({
              customerId: isUserLoggedIn.uid!,
              productId: product.productId!,
              quantity: 1,
              wishListId: wishListId!,
            }) as any
          );
    } else {
      favoriteClicked
        ? dispatch(guestRemoveFromWishList({ productId: product.productId! }))
        : dispatch(guestAddToWishList(product));
    }
  };

  const handleAddToCart = (product: Product) => {
    const customerId = isUserLoggedIn?.uid;

    if (product && total !== null && counter !== null) {
      const productToAdd = {
        ...product,
        quantity: counter,
        salesPrice: total,
      };
      const productToAddForUser = {
        productId: product.productId,
        quantity: counter,
      };
      if (isUserLoggedIn?.uid) {
        dispatch(
          addUserItemsToCart({
            customerId: customerId,
            product: productToAddForUser!,
            cartId: cartId!,
          }) as any
        );
      } else {
        dispatch(guestAddToCart(productToAdd!));
      }
    }
  };

  const handleBuyNow = (product: Product) => {
    if (product && total !== null && counter !== null) {
      const productToAdd = {
        ...product,
        quantity: counter,
        salesPrice: total,
      };
      if (isUserLoggedIn?.uid) {
        dispatch(
          addUserItemsToCart({
            customerId: isUserLoggedIn.uid,
            product: productToAdd,
            cartId: cartId!,
          }) as any
        );
      } else {
        dispatch(guestAddToCart(productToAdd));
      }
      navigate(routerPath.CART);
    }
    
  }

  const tabs: TabProps[] = [
    {
      title: "Description",
      content: (
        <div className="p-4 overflow-y-scroll custom-scrollbar">
          <h2 className="text-lg font-semibold">Product Description</h2>
          <p className="mt-2 text-gray-600">
            {productDetail?.productDescription}
          </p>
        </div>
      ),
    },
    {
      title: "Reviews",
      count: productReviews?.length,
      content: (
        <div>
          {productReviews.map((review: any) => (
            <div
              className="bg-gray-shade-400  p-4 border-b-2 border-[#D9D9D9]"
              key={review.reviewId}
            >
              <div className="flex justify-between ">
                <Rating
                  className="!text-[30px] !text-primary-500"
                  name="read-only"
                  value={review.numberOfStars}
                  readOnly
                />
                <p>
                  {formatDate(review.submittedDate)} by {review.reviewedBy}
                </p>
              </div>
              <div>
                <p className="font-bold">{review.shortReview}</p>
                <p>{review.reviewDetails}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (productDetail) {
      setValue(productDetail?.reviewStars ?? 0);
    }
  }, [productDetail]);

  return (
    <div className="px-4 w-[63%] mx-auto mb-5">
      <div className="flex items-center py-3 text-primary-500">
        <p
          className="cursor-pointer"
          onClick={() => navigate(routerPath.HOMEPAGE)}
        >
          Home
        </p>
        <RxCaretRight />
        <p>{productDetail?.productName}</p>
      </div>
      <div className="gap-4 md:flex">
        <div className="hidden h-[700px] overflow-y-scroll border md:block md:w-[300px] border-gray-primary-400 custom-scrollbar bg-gray-shade-400">
          <CategorySideBar
            categories={category}
            onCategoryClick={handleCategoryClick}
            isLoading={categoryLoading}
          />
        </div>
        <div className="md:w-4/5">
          <div className="gap-5 md:flex ">
            <div className="md:w-[293px] flex flex-col gap-4">
              <div className="border border-gray-primary-400 h-[274px] overflow-hidden shadow-sm">
                <img
                  src={productDetail?.productImages![0]}
                  alt="product big"
                  className="h-[274px] w-full object-contain "
                />
              </div>

              <div className="flex space-x-4 overflow-x-auto custom-scrollbar-pdp">
                {productDetail?.productImages &&
                  productDetail?.productImages
                    .filter((image) => image)
                    .map((image, index) => (
                      <div key={index} className="shrink-0">
                        <img
                          src={image}
                          className="block object-contain h-24 border"
                          alt="product small"
                        />
                      </div>
                    ))}
              </div>
            </div>
            <div className="md:w-[332px] md:bg-gray-shade-400 px-3 py-2">
              <div className="flex items-center justify-between font-bold text-[20px] md:mb-3">
                <p>
                  {subStringLongText(productDetail?.productName as string, 30)}
                </p>
                {productDetail?.availability?.toLowerCase() ===
                "out of stock" ? (
                  ""
                ) : (
                  <div className="p-2 bg-white border rounded-md">
                    {favoriteClicked ? (
                      <AiFillHeart
                        className="cursor-pointer text-primary-500 w-[20px] h-[18px]"
                        onClick={() => handleFavoriteClick(productDetail!)}
                      />
                    ) : (
                      <AiOutlineHeart
                        className="cursor-pointer text-primary-500 w-[20px] h-[18px]"
                        onClick={() => handleFavoriteClick(productDetail!)}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-8 md:mb-4 text-primary-500">
                <Rating
                  className="!text-[20px] !text-primary-500"
                  name="simple-controlled"
                  value={value}
                  onChange={(event, newValue) => {
                    console.log(event);
                    setValue(newValue);
                  }}
                />
                <p className="text-[11px]">
                  {productReviews?.length}{" "}
                  {productReviews?.length === 1 ? "review" : "reviews"}
                </p>
              </div>
              <p className="text-[20px] font-bold md:mb-4 text-primary-500">
                {formatMoney(total!)}
              </p>
              <div className="flex items-center gap-8 text-[11px]">
                <div>
                  <p className="md:mb-2">Brand:</p>
                  <p className="md:mb-2">Product Code:</p>
                  <p className="md:mb-2">Availabilty:</p>
                </div>
                <div>
                  <p className="md:mb-2">{productDetail?.brand}</p>
                  <p className="md:mb-2">{productDetail?.productCode}</p>
                  <p className="md:mb-2">{productDetail?.availability}</p>
                </div>
              </div>

              <div className="flex flex-col mb-3 text-[11px] ">
                <p>Qty</p>
                <div className="flex items-center">
                  <p
                    onClick={
                      productDetail?.availability?.toLowerCase() ===
                      "out of stock"
                        ? () => {}
                        : decrementTotalCounter
                    }
                    className="w-8 h-8 text-xl font-bold text-center border cursor-pointer bg-gray-primary-400"
                  >
                    -
                  </p>
                  <p className="w-8 h-8 text-xl text-center bg-white-primary-400">
                    {counter}
                  </p>
                  <p
                    onClick={
                      productDetail?.availability?.toLowerCase() ===
                      "out of stock"
                        ? () => {}
                        : incrementTotalCounter
                    }
                    className="w-8 h-8 text-xl font-bold text-center border cursor-pointer bg-gray-primary-400"
                  >
                    +
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-between gap-4 mt-4 md:w-full ">
                <div className="w-full mb-2 md:mb-0">
                  {productDetail?.availability?.toLowerCase() ===
                  "out of stock" ? (
                    <AppButton
                      clickHandler={() => {}}
                      title="Add to Cart"
                      className="flex items-center justify-center w-full gap-10 px-6 py-2 text-[20px] bg-gray-primary-400 text-white-primary-400 space-between"
                      icon={<BsCart3 />}
                      loading={isLoading}
                    />
                  ) : (
                    <AppButton
                      clickHandler={() => {
                        handleAddToCart(productDetail!);
                      }}
                      title="Add to Cart"
                      className="flex items-center justify-center w-full gap-10 px-6 py-2 text-[20px] bg-primary-500 text-white-primary-400 hover:bg-primary-400 space-between"
                      icon={<BsCart3 />}
                      loading={isLoading}
                    />
                  )}
                </div>
                <div className="w-full">
                  {productDetail?.availability?.toLowerCase() ===
                  "out of stock" ? (
                    <AppButton
                      clickHandler={() => {}}
                      title="Buy now"
                      icon={<BsCart3 />}
                      className="flex items-center justify-center w-full gap-10 px-8 py-2 text-[20px] bg-gray-primary-400 text-white-primary-400 "
                    />
                  ) : (
                    <AppButton
                      clickHandler={() => {handleBuyNow(productDetail!)}}
                      title="Buy now"
                      icon={<BsCart3 />}
                      className="flex items-center justify-center w-full gap-10 px-8 py-2 text-[20px] bg-primary-600 text-white-primary-400 hover:bg-primary-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </div> 

          
          <div className="hidden mt-4 border md:block border-gray-primary-400">
            <div className="border-gray-200">
              <ul className="flex items-center border-b border-gray-primary-400 bg-gray-primary-400 h-[46px]">
                {tabs.map((tab) => (
                  <li
                    key={tab.title}
                    className={`flex items-center text-center p-4 cursor-pointer text-[14px] font-bold h-[46px] ${
                      activeTab === tab.title.toLowerCase()
                        ? "border-primary-500 bg-primary-500 text-white-primary-400 "
                        : "border-transparent"
                    }`}
                    onClick={() => setActiveTab(tab.title.toLowerCase())}
                  >
                    {tab.title} {tab.count ? `(${tab.count})` : ""}
                  </li>
                ))}
              </ul>
              <div className="h-[359px] overflow-y-scroll custom-scrollbar bg-gray-shade-400">
                {activeTab === "description" && (
                  <div className="p-4 overflow-y-scroll custom-scrollbar">
                    <h2 className="text-lg font-semibold">
                      Product Description
                    </h2>
                    <p className="mt-2 text-gray-600">
                      {productDetail?.productDescription}
                    </p>
                  </div>
                )}
                {activeTab === "reviews" && (
                  <div>
                    {productReviews.map((review: any) => (
                      <div
                        className="bg-gray-shade-400 p-4 border-b-2 border-[#D9D9D9]"
                        key={review.reviewId}
                      >
                        <div className="flex justify-between ">
                          <Rating
                            className="!text-[30px] !text-primary-500"
                            name="read-only"
                            value={review.numberOfStars}
                            readOnly
                          />
                          <p>
                            {formatDate(review.submittedDate)} by{" "}
                            {review.reviewedBy}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold">{review.shortReview}</p>
                          <p>{review.reviewDetails}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          
        </div>
      </div>
      <div className="mb-4">
        <p className="px-4 py-4 mt-6 font-bold bg-base-gray-200">
          Similar Products
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6">
          {similarProducts.length &&
            similarProducts?.map((product) => {
              return (
                <AppProductCard product={product} key={product.productId} />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
