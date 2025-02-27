/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../styles/AppCustomCss.css";
import AppCarousel from "../../shared/AppCarousel";

import AppLinkCard from "../../shared/AppLinkCard";

import { RxCaretRight } from "react-icons/rx";

import AppProductCard from "../../shared/AppProductCard";

import { fetchProductToStore } from "../../store/features/productFeature";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "../../helpers/interface/interfaces";
import { CircularProgress } from "@mui/material";
import API, { carouselBanner, productsEndpoint } from "../../endpoint/index";
import { featuredProductsUrl } from "../../endpoint/index";
import EmptyProduct from "../../assets/images/no-products-found.png";
import { toast } from "react-toastify";
import { addUserItemsToCart, guestRemoveFromCart } from "../../store/features/cartFeature";
import { useNavigate } from "react-router";
import { routerPath } from "../../routes/Router";

type ProductCardProp = Product[];
const intialProducts: ProductCardProp = [];


const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isUserLoggedIn = useSelector((store: any) => store?.user?.currentUser);
  const cartId = useSelector((store: any) => store?.user?.cartId);

  const productLoading = useSelector(
    (store: any) => store.product.productLoading
  );

  const [isLoading, setIsLoading] = useState(false);

  const [homeProducts, setHomeProducts] =
    useState<ProductCardProp>(intialProducts);
  const [featuredProducts, setFeaturedProducts] =
    useState<ProductCardProp>(intialProducts);

  const [slides, setSlides] = useState([]);

  const fetchHomeProductsSliced = async () => {
    setIsLoading(true);

    try {
      const response = await API.get(`${productsEndpoint}`);
      const maxIndex = response.data.length - 5;
      const randomFeatured = Math.floor(Math.random() * maxIndex);
      setHomeProducts(response.data.slice(randomFeatured, randomFeatured + 5));
      setIsLoading(false);
    } catch (error) {
      if (error) {
        toast.error(`Failed to fetch products`, {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }
  };

  const fetchHomePageFeaturedProducts = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`${featuredProductsUrl}`);
      const maxIndex = response.data.length - 5;
      const randomFeatured = Math.floor(Math.random() * maxIndex);
      setFeaturedProducts(
        response.data.slice(randomFeatured, randomFeatured + 5)
      );
      setIsLoading(false);
    } catch (error) {
      if (error) {
        toast.error(`Failed to fetch products`, {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }
  };

  const addGuestCartToUserCart = () => {
    const guestUserCart = JSON.parse(
      localStorage.getItem("guestUserCart") || "[]"
    );
    const customerId = isUserLoggedIn?.uid;
    if (guestUserCart.length > 0 && isUserLoggedIn) {
      guestUserCart.forEach((product: Product) => {
        const productToAdd = {
          productId: product.productId,
          quantity: product.quantity,
        };
        dispatch(
          addUserItemsToCart({
            customerId: customerId,
            product: productToAdd,
            cartId: cartId!,
          }) as any
        );
        dispatch(guestRemoveFromCart(product) as any);
      });
    }
    localStorage.removeItem("guestUserCart");
  };

  const getBannerImages = () => {
    API.get(`${carouselBanner}`).then((response) => {
      if (response.status === 200) {
        setSlides(response.data);
      }
    });
  };
  useEffect(() => {
    dispatch(fetchProductToStore() as any);
    fetchHomePageFeaturedProducts();
    fetchHomeProductsSliced();
    getBannerImages();

    if (isUserLoggedIn) {
      addGuestCartToUserCart();
    }
  }, [dispatch]);

  return (
    <div className="h-full homeBack">
      <div className="mx-auto md:w-3/5">
        <AppCarousel slides={slides} autoPlayInterval={3000} />
        <div className="flex gap-2 bg-white h-[230px] my-3">
          <AppLinkCard
            className="absolute top-[70px] md:top-16 md:left-4"
            imageUrl={
              featuredProducts?.length
                ? featuredProducts[0]?.productImages?.[0] || ""
                : ""
            }
            price={
              featuredProducts?.length
                ? featuredProducts[0]?.discountPrice
                  ? featuredProducts[0]?.discountPrice
                  : featuredProducts[0]?.salesPrice || 0
                : 0
            }
            productTitle={
              featuredProducts?.length
                ? featuredProducts[0]?.productCategory || ""
                : ""
            }
            productName={
              featuredProducts?.length
                ? featuredProducts[0]?.productName || ""
                : ""
            }
            substringNumber={30}
          />
          <AppLinkCard
            className="absolute text-center top-4 md:top-6 md:left-10"
            imageUrl={
              featuredProducts?.length
                ? featuredProducts[1]?.productImages?.[0] || ""
                : ""
            }
            price={
              featuredProducts?.length
                ? featuredProducts[1]?.discountPrice
                  ? featuredProducts[1]?.discountPrice
                  : featuredProducts[1]?.salesPrice || 0
                : 0
            }
            productTitle={
              featuredProducts?.length
                ? featuredProducts[1]?.productCategory || ""
                : ""
            }
            productName={
              featuredProducts?.length
                ? featuredProducts[1]?.productName || ""
                : ""
            }
            substringNumber={25}
          />
          <AppLinkCard
            className="absolute !text-right right-6 top-16"
            imageUrl={
              featuredProducts?.length
                ? featuredProducts[2]?.productImages?.[0] || ""
                : ""
            }
            price={
              featuredProducts?.length
                ? featuredProducts[2]?.discountPrice
                  ? featuredProducts[2]?.discountPrice
                  : featuredProducts[2]?.salesPrice || 0
                : 0
            }
            productTitle={
              featuredProducts?.length
                ? featuredProducts[2]?.productCategory || ""
                : ""
            }
            productName={
              featuredProducts?.length
                ? featuredProducts[2]?.productName || ""
                : ""
            }
            substringNumber={30}
          />
        </div>
        <div className="p-4 bg-primary-500">
          <div className="flex justify-between text-white-primary-400 item-center">
            <p className="text-white-primary-400">Promos</p>
            <div
              onClick={() => navigate(routerPath.PROMOTIONS)}
              className="flex items-center cursor-pointer"
            >
              <p>See All</p>
              <RxCaretRight />
            </div>
          </div>
        </div>
        {productLoading ? (
          <div className="flex justify-center my-8 h-[250px] items-center">
            <CircularProgress className="circularProgress !text-gray-primary-400" />
          </div>
        ) : (
          <div
            className={` ${
              homeProducts.length
                ? "grid grid-cols-3 gap-2 md:grid-cols-5"
                : "!flex !items-center !justify-center w-full"
            }`}
          >
            {homeProducts.length ? (
              homeProducts.length &&
              homeProducts?.map((product) => {
                return (
                  <AppProductCard product={product} key={product.productId} />
                );
              })
            ) : (
              <div className="my-8 ">
                <div>
                  <img
                    src={EmptyProduct}
                    alt="empty product image"
                    className="w-32 h-[250px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 bg-white-primary-400 h-[230px] mt-[14px] ">
          <AppLinkCard
            price={
              featuredProducts?.length
                ? featuredProducts[3]?.discountPrice
                  ? featuredProducts[3]?.discountPrice
                  : featuredProducts[3]?.salesPrice || 0
                : 0
            }
            productTitle={
              featuredProducts?.length
                ? featuredProducts[3]?.productCategory || ""
                : ""
            }
            productName={
              featuredProducts?.length
                ? featuredProducts[3]?.productName || ""
                : ""
            }
            imageUrl={
              featuredProducts?.length
                ? featuredProducts[3]?.productImages?.[0] || ""
                : ""
            }
            substringNumber={45}
            className="absolute top-10 left-4 h-[174px]"
          />
          <AppLinkCard
            price={
              featuredProducts?.length
                ? featuredProducts[4]?.discountPrice
                  ? featuredProducts[4]?.discountPrice
                  : featuredProducts[4]?.salesPrice || 0
                : 0
            }
            productTitle={
              featuredProducts?.length
                ? featuredProducts[4]?.productCategory || ""
                : ""
            }
            productName={
              featuredProducts?.length
                ? featuredProducts[4]?.productName || ""
                : ""
            }
            imageUrl={
              featuredProducts?.length
                ? featuredProducts[4]?.productImages?.[0] || ""
                : ""
            }
            substringNumber={45}
            className="absolute top-10 left-4"
          />
        </div>
        <div>
          <p className="px-4 py-4 font-bold border bg-white-primary-400">
            Featured Products
          </p>
          {isLoading ? (
            <div className="flex justify-center my-8 h-[274px] items-center">
              <CircularProgress className="circularProgress !text-gray-primary-400" />
            </div>
          ) : (
            <div
              className={` ${
                featuredProducts.length
                  ? "grid grid-cols-3 md:grid-cols-5 gap-2"
                  : "!flex !items-center !justify-center w-full"
              }`}
            >
              {featuredProducts.length ? (
                featuredProducts.length &&
                featuredProducts?.map((product) => {
                  return (
                    <AppProductCard product={product} key={product.productId} />
                  );
                })
              ) : (
                <div className="my-8 ">
                  <div>
                    <img
                      src={EmptyProduct}
                      alt="empty product image"
                      className="w-32 h-[250px]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
