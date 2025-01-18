/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Product } from "../../helpers/interface/interfaces";
import AppCartCard from "../../shared/AppCartCard";
import { RxCaretRight } from "react-icons/rx";
import { formatMoney } from "../../helpers/functions/helperFunctions";
import AppButton from "../../shared/AppButton";
import { BsCart3 } from "react-icons/bs";
import "../../styles/AppCustomCss.css";
import AppProductCard from "../../shared/AppProductCard";
import { routerPath } from "../../routes/Router";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import EmptyCart from "../../assets/images/emptycart.webp";
import { fetchUserCart } from "../../store/features/cartFeature";
import API, { checkoutOrder, coupons } from "../../endpoint";
import { toast } from "react-toastify";
import { setOrderId } from "../../store/features/userSliceFeature";
import AppInput from "../../shared/AppInput";
import { IoGiftOutline } from "react-icons/io5";
const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((store: any) => store?.cart);
  const user = useSelector((store: any) => store?.user?.currentUser);
  const cartId = useSelector((store: any) => store?.user?.cartId);
  const [cartTotal, setCartTotal] = useState();
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isloading, setIsLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [promoInput, setPromoInput] = useState({
    code: "",
  });
  // const orderId = useSelector((store: any) => store?.user?.orderId);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

  const handleCheckout = () => {
    setIsLoading(true);
    const payload = {
      customerId: user?.uid,
      cartId: cartId,
    };
    API.post(`${checkoutOrder}`, payload)
      .then((response) => {
        if (response.status === 200) {
          dispatch(setOrderId(response?.data?.checkOutOrderNumber));
          setIsLoading(false);
          toast.success("Checkout successful", {
            autoClose: 2000,
            position: "top-right",
          });

          setTimeout(() => {
            navigate(routerPath.CHECKOUT);
          }, 2000);
        } else {
          setIsLoading(false);
          toast.error("Something went wrong. Order failed", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        toast.error("Something went wrong. Order failed", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    dispatch(fetchUserCart() as any);
    setCartTotal(
      cart?.guestUserCart?.reduce(
        (acc: any, item: any) => acc + item.salesPrice,
        0
      )
    );
  }, []);
  useEffect(() => {
    const storedRecentlyViewed = localStorage.getItem("recentlyViewed");
    if (storedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(storedRecentlyViewed));
    }
  }, []);

  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setPromoInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCoupon = () => {
    setIsCodeLoading(true);
    const payload = {
      redeemedBy: user?.uid,
      couponCode: promoInput.code,
      cartId: cartId,
    };
    // console.log("coupon payload", payload);
    if (!promoInput.code) {
      toast.error("Please enter a coupon code", {
        autoClose: 2000,
        position: "top-right",
      });
      setIsCodeLoading(false);
      return;
    } else {
      API.post(`${coupons}`, payload)
        .then((response) => {
          
          if (response.status === 200) {
            console.log("entering coupon", response.data);
            if(response.data.message === "Coupon not found." || response.data.message === "Coupon already used.") {
              toast.error(`${response.data.message}`, {
                autoClose: 2000,
                position: "top-right",
              });
              setIsCodeLoading(false);
              return;
            } else {
              toast.success(`${response.data.message}`, {
                autoClose: 2000,
                position: "top-right",
              });
              const newPrice = response.data.totalAmount;
              setDiscountedPrice(newPrice);
              promoInput.code = "";
              setIsCodeLoading(false);
            }
          } else {
            toast.error("Failed to apply coupon", {
              autoClose: 2000,
              position: "top-right",
            });
            setIsCodeLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
          setIsCodeLoading(false);
          toast.error("Failed to apply coupon", {
            autoClose: 2000,
            position: "top-right",
          });
        });
    }
  };
  return (
    <div className="mx-auto md:w-3/5">
      <div className="flex items-center py-3">
        <p
          className="cursor-pointer"
          onClick={() => navigate(routerPath.HOMEPAGE)}
        >
          Home
        </p>
        <RxCaretRight />
        <p>Cart</p>
      </div>
      <div className="gap-4 md:flex">
        <div className="md:w-[75%] h-[500px] overflow-y-scroll custom-scrollbar">
          <div className="px-3 py-3 bg-gray-primary-400">
            {user ? (
              <div>
                {cart?.userCart?.cartProducts?.length === 1 ||
                cart?.userCart?.cartProducts?.length === 0 ? (
                  <p className="font-bold">
                    Cart ({cart?.userCart?.cartProducts?.length}) Item
                  </p>
                ) : (
                  <p className="font-bold">
                    Cart ({cart?.userCart?.cartProducts?.length}) Items
                  </p>
                )}
              </div>
            ) : (
              <div>
                {cart?.guestUserCart?.length === 1 ||
                cart?.guestUserCart?.length === 0 ? (
                  <p className="font-bold">
                    Cart ({cart?.guestUserCart?.length}) Item
                  </p>
                ) : (
                  <p className="font-bold">
                    Cart ({cart?.guestUserCart?.length}) Items
                  </p>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex flex-col gap-4">
              {cart?.userCart?.cartProducts?.length > 0 ? (
                cart?.userCart?.cartProducts?.map((item: Product) => (
                  <AppCartCard key={item.productId!} item={item} />
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
              {cart?.guestUserCart?.length > 0 ? (
                cart?.guestUserCart?.map((item: Product) => (
                  <AppCartCard key={item.productId} item={item} />
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

        <div className="md:w-[25%] flex flex-col gap-4 mt-8 md:mt-0">
          <div className="pb-8 font-medium">
            <p className="px-2 py-3 bg-gray-primary-400">Summary</p>
            <div className="flex justify-between px-2 py-2 font-medium border-b bg-base-gray-200 border-gray-primary-400">
              <p>
                Items Total (
                {user
                  ? cart?.userCart?.cartProducts?.length
                  : cart?.guestUserCart?.length}
                )
              </p>
              <p>
                {formatMoney(
                  discountedPrice != null
                    ? discountedPrice
                    : cart.userCart?.cartCost
                    ? cart.userCart?.cartCost
                    : cartTotal
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 px-2 pt-4 bg-base-gray-200">
              <AppInput
                id="code"
                placeholder="*** *** ***"
                type="text"
                value={promoInput.code}
                onChange={handleChange}
                className="w-full px-4 py-2 text-center bg-white rounded-md outline-none promoCode"
              />
              <AppButton
                title="Redeem code"
                className="flex items-center justify-center w-full gap-6 px-4 py-1 mt-2 uppercase rounded-md space-between just bg-primary-500 text-white-primary-400"
                icon={<IoGiftOutline />}
                clickHandler={handleCoupon}
                loading={isCodeLoading}
              />
            </div>
           
            <div className="px-2 pt-6 border-b bg-base-gray-200 border-gray-primary-400">
              <div className="flex justify-between">
                <p className="uppercase">Total</p>
                <p className="text-primary-500">
                  {formatMoney(
                    discountedPrice != null
                      ? discountedPrice
                      : cart.userCart?.cartCost
                      ? cart.userCart?.cartCost
                      : cartTotal
                  )}
                </p>
              </div>
              <div className="w-full mt-6 mb-8">
                <AppButton
                  loading={isloading}
                  clickHandler={() =>
                    user ? handleCheckout() : navigate(routerPath.LOGIN)
                  }
                  title="checkout"
                  icon={<BsCart3 />}
                  className="flex items-center justify-center w-full gap-8 px-4 py-2 mt-2 uppercase rounded-md bg-primary-500 text-white-primary-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <p className="px-4 py-3 mt-4 font-bold bg-gray-primary-400">
          Recently Viewed
        </p>
        <div
          className={`${
            recentlyViewed.length > 0
              ? "grid grid-cols-3 md:grid-cols-6"
              : "!flex !items-center !justify-center w-full h-[200px] border"
          }`}
        >
          {recentlyViewed.length > 0 ? (
            recentlyViewed.map((product) => (
              <AppProductCard key={product.productId} product={product} />
            ))
          ) : (
            <div>
              <p>No recently viewed products</p>
            </div>
          )}
        </div>
      </div>
      {/* <div className="mb-4">
        <p className="px-4 py-3 mt-4 font-bold bg-gray-primary-400">
          Recommended for you
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6">
          {products.length &&
            products?.map((product) => {
              const updatedProduct = { ...product, productImages: [] };
              return <AppProductCard product={updatedProduct} />;
            })}
        </div>
      </div> */}
    </div>
  );
};

export default Cart;
