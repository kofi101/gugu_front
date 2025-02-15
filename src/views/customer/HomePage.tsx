/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../styles/AppCustomCss.css";
import AppCarousel from "../../shared/AppCarousel";
// import Pebbles from "../../assets/images/pebble.jpg";
// import Force from "../../assets/images/airforce.jpg";
// import Supra from "../../assets/images/supra.jpg";
import AppLinkCard from "../../shared/AppLinkCard";
// import tv from "../../assets/images/tv.png";
import { RxCaretRight } from "react-icons/rx";
// import mic from "../../assets/images/mic.png";
// import laptop from "../../assets/images/laptop.jpeg";
// import drive from "../../assets/images/drive.jpg";
import AppProductCard from "../../shared/AppProductCard";
// import Iwatch from "../../assets/images/iwatch.jpeg";
import { fetchProductToStore } from "../../store/features/productFeature";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "../../helpers/interface/interfaces";
import { CircularProgress } from "@mui/material";
import API, { carouselBanner, productsEndpoint } from "../../endpoint/index";
import { featuredProductsUrl } from "../../endpoint/index";
import EmptyProduct from "../../assets/images/no-products-found.png";
import { toast } from "react-toastify";
import { addUserItemsToCart } from "../../store/features/cartFeature";
import { useNavigate } from "react-router";
import { routerPath } from "../../routes/Router";


type ProductCardProp = Product[];
const intialProducts: ProductCardProp = [];

// const slides = [
//   {
//     imageUrl: Pebbles,
//     promo: "50% off - selected items",
//     caption: "Macbook Pro 2021",
//     link: "/shop",
//   },
//   {
//     imageUrl: Force,
//     promo: "Holiday Promo | 50% off Sale",
//     caption: "Sony PS5",
//     link: "/shop",
//   },
//   {
//     imageUrl: Supra,
//     promo: "Independence day | 20% on all items",
//     caption: "FIfa 2022 PS5",
//     link: "/shop",
//   },
//   // {
//   //   imageUrl: "https://via.placeholder.com/800x300?text=Slide+4",
//   //   caption: "Slide 4",
//   //   link: "/shop",
//   // },
// ];
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

    const [slides, setSlides] = useState([])

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

  const getBannerImages = () => {
    API.get(`${carouselBanner}`).then((response) => {
      if(response.status === 200) {

        setSlides(response.data)
      }
    })
  }
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
            imageUrl={featuredProducts?.length ? featuredProducts[0]?.productImages?.[0] || "" : ""}
            price={featuredProducts?.length ? featuredProducts[0]?.discountPrice ? featuredProducts[0]?.discountPrice : featuredProducts[0]?.salesPrice  || 0 : 0}
            productTitle={featuredProducts?.length ? featuredProducts[0]?.productCategory || "" : ""}
            productName={featuredProducts?.length ? featuredProducts[0]?.productName || "" : ""}
            substringNumber={30}
          />
          <AppLinkCard
            className="absolute text-center top-4 md:top-6 md:left-10"
            imageUrl={featuredProducts?.length ? featuredProducts[1]?.productImages?.[0] || "" : ""}
            price={featuredProducts?.length ? featuredProducts[1]?.discountPrice ? featuredProducts[1]?.discountPrice : featuredProducts[1]?.salesPrice  || 0 : 0}
            productTitle={featuredProducts?.length ? featuredProducts[1]?.productCategory || "" : ""}
            productName={featuredProducts?.length ? featuredProducts[1]?.productName || "" : ""}
            substringNumber={25}
          />
          <AppLinkCard
            className="absolute !text-right right-6 top-16"
            imageUrl={featuredProducts?.length ? featuredProducts[2]?.productImages?.[0] || "" : ""}
            price={featuredProducts?.length ? featuredProducts[2]?.discountPrice ? featuredProducts[2]?.discountPrice : featuredProducts[2]?.salesPrice  || 0 : 0}
            productTitle={featuredProducts?.length ? featuredProducts[2]?.productCategory || "" : ""}
            productName={featuredProducts?.length ? featuredProducts[2]?.productName || "" : ""}
            substringNumber={30}
          />
        </div>
        <div className="p-4 bg-primary-500">
          <div className="flex justify-between text-white-primary-400 item-center">
            <p className="text-white-primary-400">
              Promos
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
          <div className="flex justify-center my-8 h-[250px] items-center">
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
                    className="w-32 h-[250px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 bg-white-primary-400 h-[230px] mt-[14px] ">
          <AppLinkCard
            price={featuredProducts?.length ? featuredProducts[3]?.discountPrice ? featuredProducts[3]?.discountPrice : featuredProducts[3]?.salesPrice  || 0 : 0}
            productTitle={featuredProducts?.length ? featuredProducts[3]?.productCategory || "" : ""}
            productName={featuredProducts?.length ? featuredProducts[3]?.productName || "" : ""}
            imageUrl={featuredProducts?.length ? featuredProducts[3]?.productImages?.[0] || "" : ""}
            substringNumber={45}
            className="absolute top-10 left-4 h-[174px]"
          />
          <AppLinkCard
            price={featuredProducts?.length ? featuredProducts[4]?.discountPrice ? featuredProducts[4]?.discountPrice : featuredProducts[4]?.salesPrice  || 0 : 0}
            productTitle={featuredProducts?.length ? featuredProducts[4]?.productCategory || "" : ""}
            productName={featuredProducts?.length ? featuredProducts[4]?.productName || "" : ""}
            imageUrl={featuredProducts?.length ? featuredProducts[4]?.productImages?.[0] || "" : ""}
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
