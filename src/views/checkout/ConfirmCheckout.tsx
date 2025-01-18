/* eslint-disable @typescript-eslint/no-explicit-any */
import MainFooter from "../../components/footer/MainFooter";
import AppButton from "../../shared/AppButton";
import { formatMoney } from "../../helpers/functions/helperFunctions";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Gugulogo from "../../assets/gugu2.png";
import { routerPath } from "../../routes/Router";
import { useEffect, useState } from "react";
import { loggedInUser } from "../../helpers/type/types";
import Profile from "../../assets/svg/gugu_account.svg";
import { RxCaretDown, RxCaretLeft } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { BiCart } from "react-icons/bi";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import {
  setCartId,
  setCheckoutDetailsFilled,
  setDeliveryDestination,
  setDetailsToAddReview,
  setMobilePaymentId,
  setOrderDetailsId,
  setOrderId,
  setOtpNumber,
  setPaymentNumber,
  setReviewId,
  setUser,
  setUserToken,
  setWishListId,
} from "../../store/features/userSliceFeature";
import { IoLogOutOutline } from "react-icons/io5";
import API, {
  getUserDetails,
  orderSendToDetails,
  paymentStatus,
} from "../../endpoint";
import { FaCheckCircle } from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import { useLocation } from "react-router";

type PartialUser = Partial<loggedInUser>;
const ConfirmCheckout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const urlToken = queryParams.get("token");

  const user = useSelector((store: any) => store?.user?.currentUser);
  const userToken = useSelector((store: any) => store?.user?.userToken);
  // const cart = useSelector((store: any) => store?.cart);
  const { orderId } = useSelector((store: any) => store?.user);
  const [currentUser, setCurrentUser] = useState<PartialUser>();
  const [myAccount, setMyAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<{
    sendTo?: {
      fullName?: string;
      phoneNumber?: string;
      address?: string;
      cityName?: string;
    };
    delivery?: {
      deliveryType?: string;
      deliveryLocation?: string;
    };
    orderSummary?: {
      quantity?: number;
      itemTotal?: number;
      delivery?: number;
      discount?: number;
      total?: number;
    };
  }>({});
  const [sendToLoading, setSendToLoading] = useState(false);

  const handleFetchUserDetails = () => {
    API.get(`${getUserDetails}${user?.uid}`).then((response) => {
      setCurrentUser(response.data);
    });
  };

  const handleFetchSendToDetails = () => {
    setSendToLoading(true);
    API.get(`${orderSendToDetails}/${orderId}`).then((response) => {
      setDeliveryDetails(response?.data);
      setSendToLoading(false);
    });
  };

  const handleMyAccount = () => {
    setMyAccount(!myAccount);
  };

  const editCheckoutDetails = () => {
    navigate(routerPath.CHECKOUT);
  };

  const handleConfirmPayment = () => {
    setIsLoading(true);
    const payload = {
      token: urlToken,
    };
    console.log(payload);

    API.post(`${paymentStatus}`, payload)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          console.log(response.data);
          setIsLoading(false);
          toast.success("Order confirmed successfully.", {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            navigate(routerPath.CONFIRMATION);
          }, 2000);
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

  useEffect(() => {
    userToken ? handleFetchUserDetails() : "";
    handleFetchSendToDetails();
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
      {sendToLoading ? (
        <div className="flex justify-center items-center my-8 h-[500px]">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div className="w-2/3 mx-auto">
          <p className="text-[40px] font-medium text-center mt-8 mb-4">
            Confirm Checkout
          </p>

          <div className="flex gap-4">
            <div className="w-[75%] flex flex-col gap-6 h-[400px] p-4 overflow-y-scroll custom-scrollbar mb-10 bg-gray-primary-400">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <FaCheckCircle className="!text-2xl text-primary-500" />
                    <p className="font-bold text-[18px]">Send To</p>
                  </div>
                  <div
                    onClick={editCheckoutDetails}
                    className="flex items-center mr-4 text-sm cursor-pointer text-primary-500"
                  >
                    <RxCaretLeft /> <p className="">Edit</p>
                  </div>
                </div>
                <div className="pl-12 mt-1">
                  <p>{deliveryDetails.sendTo?.fullName}</p>
                  <p>{deliveryDetails.sendTo?.phoneNumber}</p>
                  <p>{deliveryDetails.sendTo?.address}</p>
                  <p>{deliveryDetails.sendTo?.cityName}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <FaCheckCircle className="!text-2xl text-primary-500" />
                    <p className="font-bold text-[18px]">Delivery</p>
                  </div>
                  <div
                    onClick={editCheckoutDetails}
                    className="flex items-center mr-4 text-sm cursor-pointer text-primary-500"
                  >
                    <RxCaretLeft /> <p className="">Edit</p>
                  </div>
                </div>
                <div className="pl-12 mt-1">
                  <p>{deliveryDetails.delivery?.deliveryType}</p>
                  <p>{deliveryDetails.delivery?.deliveryLocation}</p>
                </div>
              </div>
            </div>

            <div className="md:w-[25%] flex flex-col gap-4">
              <div className="font-medium">
                <p className="px-2 py-3 bg-gray-primary-400">Order Summary</p>
                <div className="flex justify-between px-2 py-2 font-medium border-b bg-base-gray-200 border-gray-primary-400">
                  <p>Items Total({deliveryDetails.orderSummary?.quantity})</p>
                  <p>
                    {formatMoney(
                      deliveryDetails.orderSummary?.itemTotal
                        ? deliveryDetails.orderSummary?.itemTotal
                        : 0
                    )}
                  </p>
                </div>

                <div className="flex justify-between px-2 py-2 border-b bg-base-gray-200 border-gray-primary-400">
                  <p>Delivery</p>
                  <p>
                    {formatMoney(
                      deliveryDetails.orderSummary?.delivery
                        ? deliveryDetails.orderSummary?.delivery
                        : 0
                    )}
                  </p>
                </div>
                <div className="flex justify-between px-2 py-2 border-b bg-base-gray-200 border-gray-primary-400">
                  <p>Discount</p>
                  <p>
                    {formatMoney(
                      deliveryDetails?.orderSummary?.discount
                        ? deliveryDetails?.orderSummary?.discount
                        : 0
                    )}
                  </p>
                </div>
                <div className="px-2 py-2 bg-base-gray-200">
                  <div className="mt-8 mb-3">
                    <div className="flex justify-between">
                      <p className="uppercase">Total</p>
                      <p className="text-lg font-bold text-primary-500">
                        {formatMoney(
                          deliveryDetails.orderSummary?.total
                            ? deliveryDetails.orderSummary?.total
                            : 0
                        )}
                      </p>
                    </div>
                    <div className="w-full mt-8">
                      <AppButton
                        loading={isLoading}
                        clickHandler={handleConfirmPayment}
                        title="Payment Made"
                        className="flex items-center justify-center w-full px-4 py-2 mt-2 uppercase rounded-md bg-primary-500 text-white-primary-400"
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
      )}

      <MainFooter />
    </div>
  );
};

export default ConfirmCheckout;
