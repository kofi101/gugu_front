/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import CustomerDetails from "../../components/checkout/CustomerDetails";
// import PaymentMethods from "../../components/checkout/PaymentMethods";
// import PrePayNow from "../../components/checkout/PrePayNow";
import DeliveryDetails from "../../components/checkout/DeliveryDetails";
import Gugulogo from "../../assets/gugu2.png";
import Profile from "../../assets/svg/gugu_account.svg";
import { RxCaretDown, RxCaretLeft } from "react-icons/rx";
import { routerPath } from "../../routes/Router";
import { useNavigate } from "react-router";
import { CgProfile } from "react-icons/cg";
import { BiCart } from "react-icons/bi";
import { IoLogOutOutline } from "react-icons/io5";
import AppButton from "../../shared/AppButton";
// import AppInput from "../../shared/AppInput";
import {
  formatMoney,
  splitFullName,
} from "../../helpers/functions/helperFunctions";
import "../../styles/AppCustomCss.css";
import MainFooter from "../../components/footer/MainFooter";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import {
  setUser,
  setOrderId,
  setCartId,
  setPaymentNumber,
  setOtpNumber,
  setUserToken,
  setMobilePaymentId,
  setWishListId,
  setCheckoutDetailsFilled,
  setDeliveryDestination,
  setOrderDetailsId,
  setDetailsToAddReview,
  setReviewId,
} from "../../store/features/userSliceFeature";
import API, { getUserDetails, makePayment } from "../../endpoint";
import { loggedInUser } from "../../helpers/type/types";

type PartialUser = Partial<loggedInUser>;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((store: any) => store?.user?.currentUser);
  const userToken = useSelector((store: any) => store?.user?.userToken);
  const cart = useSelector((store: any) => store?.cart);
  const deliveryDestination = useSelector(
    (store: any) => store.user.deliveryDestination
  );

  const { orderId, checkoutDetailsFilled } = useSelector(
    (store: any) => store?.user
  );

  const [currentUser, setCurrentUser] = useState<PartialUser>();
  const [myAccount, setMyAccount] = useState(false);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(true);
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false);

  const [isFormComplete, setIsFormComplete] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleFetchUserDetails = () => {
    API.get(`${getUserDetails}${user?.uid}`).then((response) => {
      setCurrentUser(response.data);
    });
  };
  const handleMyAccount = () => {
    setMyAccount(!myAccount);
  };
  const completeCustomerDetails = () => {
    setIsCustomerDetailsOpen(false);
    setIsDeliveryDetailsOpen(true);
    setIsFormComplete(true);
  };
  const editCustomerDetails = () => {
    setIsCustomerDetailsOpen(true);
    setIsDeliveryDetailsOpen(false);
    setIsFormComplete(false);
  };

  const completeDeliveryDetails = () => {
    setIsDeliveryDetailsOpen(false);
    setIsFormComplete(true);
  };

  const editDeliveryDetails = () => {
    setIsDeliveryDetailsOpen(true);
    setIsFormComplete(false);
  };

  const handleConfirmOrder = () => {
    setIsLoading(true);
    const { firstName, lastName } = splitFullName(currentUser?.fullName || "");
    const payload = {
      order_id: orderId,
      email: currentUser?.email,
      firstname: firstName,
      lastname: lastName,
    };

    API.post(`${makePayment}`, payload)
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          setIsLoading(false);
          toast.success("Order confirmed successfully.", {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            // navigate(routerPath.CONFIRMCHECKOUTDETAILS);
            window.location.href = response.data.redirect_url;
          }, 2000);
          dispatch(setCheckoutDetailsFilled(false));
        } else {
          setIsLoading(false);
          toast.error("Error confirming order.", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        toast.error("Error confirming order.", {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };

  const gotToCheckoutDetails = () => {
    if (!checkoutDetailsFilled) {
      toast.error("Please select your delivery details", {
        autoClose: 3000,
        position: "top-right",
      });
      return;
    } else {
      handleConfirmOrder();
    }
  };
  const handleLogout = () => {
    signOut(auth).then(() => {
      dispatch(setUser(null));
      dispatch(setUserToken(null));
      dispatch(setCartId(null));
      dispatch(setWishListId(null));
      dispatch(setOrderId(null));
      dispatch(setMobilePaymentId(null));
      dispatch(setPaymentNumber(null));
      dispatch(setOtpNumber(null));
      dispatch(setCheckoutDetailsFilled(false));
      dispatch(setDeliveryDestination(null));
      dispatch(setOrderDetailsId(null));
      dispatch(setDetailsToAddReview(null));
      dispatch(setReviewId(null))
      toast.success("Sign-out successful.", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate(routerPath.HOMEPAGE);
      }, 2000);
    });
  };

  useEffect(() => {}, []);
  useEffect(() => {
    userToken ? handleFetchUserDetails() : "";
  }, [userToken]);
  return (
    <div>
      <div className=" bg-primary-500">
        <div className="flex justify-between w-2/3 py-4 mx-auto">
          <img
            onClick={() => navigate(routerPath.HOMEPAGE)}
            src={Gugulogo}
            alt=""
            className="w-[100px] hidden md:flex cursor-pointer"
          />
          <div className="flex items-center gap-8 ">
            {user ? (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleMyAccount}
              >
                <img
                  src={Profile}
                  alt="profile"
                  className="w-[22px] h-[20px]"
                />
                <p className="text-white">{currentUser?.fullName}</p>
                <RxCaretDown className="text-white cursor-pointer" />
                {myAccount ? (
                  <div className="absolute w-32 p-2 bg-white border rounded-lg top-14">
                    <ul>
                      <li
                        onClick={() => navigate(routerPath.MYACCOUNT)}
                        className="flex items-center justify-between py-1 cursor-pointer hover:bg-white-primary-400 hover:text-primary-500"
                      >
                        <p>Profile</p>
                        <CgProfile />
                      </li>
                      <li
                        onClick={() => navigate(routerPath.CART)}
                        className="flex items-center justify-between py-1 cursor-pointer hover:bg-white-primary-400 hover:text-primary-500"
                      >
                        <p>Cart</p>
                        <BiCart />
                      </li>
                      <li
                        onClick={handleLogout}
                        className="flex items-center justify-between py-1 cursor-pointer hover:bg-white-primary-400 hover:text-primary-500"
                      >
                        <p>Logout</p>
                        <IoLogOutOutline />
                      </li>
                    </ul>
                  </div>
                ) : (
                  ""
                )}
              </div>
            ) : (
              <div className="text-white">
                <span
                  className="cursor-pointer"
                  onClick={() => navigate(routerPath.LOGIN)}
                >
                  Login
                </span>
              </div>
            )}
            <div className="text-white">
              <p>Call Us Now: 000 888 336 22</p>
              <p>Email: info@gugu@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-2/3 mx-auto">
        <p className="text-[40px] font-medium text-center mt-8">Checkout</p>
        <div
          className="flex items-center gap-2 w-[115px] cursor-pointer text-primary-500 font-medium mb-8 "
          onClick={() => navigate(routerPath.CART)}
        >
          <RxCaretLeft /> <p>Back to Cart</p>
        </div>
        <div className="flex gap-4">
          <div className="w-[75%] flex flex-col gap-4 mb-10">
            <CustomerDetails
              onComplete={completeCustomerDetails}
              isOpen={isCustomerDetailsOpen}
              formComplete={isFormComplete}
              editPayment={editCustomerDetails}
            />
            <DeliveryDetails
              onComplete={completeDeliveryDetails}
              editPayment={editDeliveryDetails}
              isOpen={isDeliveryDetailsOpen}
              formComplete={isFormComplete}
            />
          </div>

          <div className="md:w-[25%] flex flex-col gap-4">
            <div className="font-medium">
              <p className="px-2 py-3 bg-gray-primary-400">Order Summary</p>
              <div className="flex justify-between px-2 py-2 font-medium border-b bg-base-gray-200 border-gray-primary-400">
                <p>Items Total({cart.userCart?.cartProducts?.length})</p>
                <p>
                  {formatMoney(
                    deliveryDestination
                      ? deliveryDestination?.totalAmount
                      : cart.userCart?.subTotal
                      ? cart.userCart?.subTotal
                      : 0
                  )}
                </p>
              </div>

              <div className="flex justify-between px-2 py-2 border-b bg-base-gray-200 border-gray-primary-400">
                <p>Delivery</p>
                <p>
                  {formatMoney(
                    deliveryDestination ? deliveryDestination?.shippingCost : 0
                  )}
                </p>
              </div>
              <div className="flex justify-between px-2 py-2 border-b bg-base-gray-200 border-gray-primary-400">
                <p>Discount</p>
                <p>
                  {formatMoney(
                    cart.userCart?.discount ? cart.userCart?.discount : 0
                  )}
                </p>
              </div>
              <div className="px-2 py-2 bg-base-gray-200">
                <div className="mt-8 mb-3">
                  <div className="flex justify-between">
                    <p className="uppercase">Total</p>
                    <p className="text-lg font-bold text-primary-500">
                      {formatMoney(
                        deliveryDestination
                          ? deliveryDestination?.totalAmount
                          : cart.userCart?.cartCost
                          ? cart.userCart?.cartCost
                          : 0
                      )}
                    </p>
                  </div>
                  <div className="w-full mt-8">
                    <AppButton
                      loading={isLoading}
                      clickHandler={gotToCheckoutDetails}
                      title="Confirm Order"
                      className={`${
                        !checkoutDetailsFilled
                          ? "bg-gray-primary-400"
                          : "bg-primary-500"
                      } flex items-center justify-center w-full px-4 py-2 mt-2 uppercase rounded-md  text-white-primary-400`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-10 text-[11px] flex justify-center items-center text-center">
              <p className="">
                By proceeding, you are automatically accepting the
                <span className="cursor-pointer text-primary-500">
                  {" "}
                  Terms & Conditions
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <MainFooter />
    </div>
  );
};

export default Checkout;
