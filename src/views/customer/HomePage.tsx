/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../styles/AppCustomCss.css";
import AppCarousel from "../../shared/AppCarousel";
import Pebbles from "../../assets/images/pebble.jpg";
import Force from "../../assets/images/airforce.jpg";
import Supra from "../../assets/images/supra.jpg";
import AppLinkCard from "../../shared/AppLinkCard";
import tv from "../../assets/images/tv.png";
import { RxCaretRight } from "react-icons/rx";
import mic from "../../assets/images/mic.png";
import laptop from "../../assets/images/laptop.jpeg";
import drive from "../../assets/images/drive.jpg";
import AppProductCard from "../../shared/AppProductCard";
import Iwatch from "../../assets/images/iwatch.jpeg";
import { fetchProductToStore } from "../../store/features/productFeature";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "../../helpers/interface/interfaces";
import { CircularProgress } from "@mui/material";
import API, { productsEndpoint } from "../../endpoint/index";
import { featuredProductsUrl } from "../../endpoint/index";
import EmptyProduct from "../../assets/images/no-products-found.png";
import { toast } from "react-toastify";
import { addUserItemsToCart } from "../../store/features/cartFeature";
import { useNavigate } from "react-router";
import { routerPath } from "../../routes/Router";

type ProductCardProp = Product[];
const intialProducts: ProductCardProp = [];

const slides = [
  {
    imageUrl: Pebbles,
    promo: "50% off - selected items",
    caption: "Macbook Pro 2021",
    link: "/shop",
  },
  {
    imageUrl: Force,
    promo: "Holiday Promo | 50% off Sale",
    caption: "Sony PS5",
    link: "/shop",
  },
  {
    imageUrl: Supra,
    promo: "Independence day | 20% on all items",
    caption: "FIfa 2022 PS5",
    link: "/shop",
  },
  // {
  //   imageUrl: "https://via.placeholder.com/800x300?text=Slide+4",
  //   caption: "Slide 4",
  //   link: "/shop",
  // },
];
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isUserLoggedIn = useSelector((store: any) => store?.user?.currentUser);
  const cartId = useSelector((store: any) => store?.user?.cartId);


  const productLoading = useSelector((store: any) => store.product.productLoading);

  const [isLoading, setIsLoading] = useState(false);

  const [homeProducts, setHomeProducts] =
    useState<ProductCardProp>(intialProducts);
  const [featuredProducts, setFeaturedProducts] =
    useState<ProductCardProp>(intialProducts);

  const fetchHomeProductsSliced = async () => {
    setIsLoading(true);

    try {
      const response = await API.get(`${productsEndpoint}`);
      const maxIndex = response.data.length - 6;
      const randomFeatured = Math.floor(Math.random() * maxIndex);
      setHomeProducts(response.data.slice(randomFeatured, randomFeatured + 6));
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
      const maxIndex = response.data.length - 6;
      const randomFeatured = Math.floor(Math.random() * maxIndex);
      setFeaturedProducts(
        response.data.slice(randomFeatured, randomFeatured + 6)
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
      });
    }
    localStorage.removeItem("guestUserCart");
  };
  useEffect(() => {
    dispatch(fetchProductToStore() as any);
    fetchHomePageFeaturedProducts();
    fetchHomeProductsSliced();

    if (isUserLoggedIn) {
      addGuestCartToUserCart();
    }
  }, [dispatch]);

  return (
    <div className="h-full homeBack">
      <div className="mx-auto md:w-3/5">
        <AppCarousel slides={slides} autoPlayInterval={3000} />
        <div className="flex gap-2 py-2 bg-white">
          <AppLinkCard
            className="absolute top-10 md:top-10 md:left-4"
            imageUrl={laptop}
            price={1200}
            productTitle="Ultra slim style"
            productName="The best notebook"
          />
          <AppLinkCard
            className="absolute text-center top-4 md:top-6 md:left-14"
            imageUrl={drive}
            price={25}
            productTitle="Ultra slim style"
            productName="The best notebook"
          />
          <AppLinkCard
            className="absolute right-4 top-10"
            imageUrl={mic}
            price={500}
            productTitle="Ultra slim style"
            productName="Audio & visual"
          />
        </div>
        <div className="p-4 bg-primary-500">
          <div className="flex justify-between text-white-primary-400 item-center">
            <p className="text-white-primary-400">
              Holiday Promo | 50% off Sale
            </p>
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
          <div className="flex justify-center my-8">
            <CircularProgress className="circularProgress !text-gray-primary-400" />
          </div>
        ) : (
          <div
            className={` ${
              homeProducts.length
                ? "grid grid-cols-3 md:grid-cols-6"
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
                    className="w-32 "
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-3 bg-white-primary-400">
          <AppLinkCard
            price={140}
            productTitle="Colorful kick"
            productName="Iwatch series 2"
            imageUrl={Iwatch}
            className="absolute top-10 left-4"
          />
          <AppLinkCard
            price={145}
            productTitle="Going"
            productName="Somewhere?"
            imageUrl={tv}
            className="absolute top-10 left-4"
          />
        </div>
        <div>
          <p className="px-4 py-4 font-bold border bg-white-primary-400">
            Featured Products
          </p>
          {isLoading ? (
            <div className="flex justify-center my-8">
              <CircularProgress className="circularProgress !text-gray-primary-400" />
            </div>
          ) : (
            <div
              className={` ${
                featuredProducts.length
                  ? "grid grid-cols-3 md:grid-cols-6"
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
                      className="w-32 "
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
