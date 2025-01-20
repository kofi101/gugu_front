/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { routerPath } from "../../routes/Router";
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

const inactivityTime = 1000 * 60 * 5;

function useInactivityHook() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store: any) => store?.user?.currentUser);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      dispatch(setReviewId(null));
      toast.success("No activity detected, user logged out", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate(routerPath.HOMEPAGE);
      }, 2000);
    });
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, inactivityTime);
  };

  useEffect(() => {
    if (user === null) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }
    const handleActivity = () => resetTimeout();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    

    resetTimeout();

    return () => {
      clearTimeout(timeoutRef.current!);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [user]);

  return null;
}

export default useInactivityHook;
