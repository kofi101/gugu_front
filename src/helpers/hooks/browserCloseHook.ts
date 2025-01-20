import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
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

function useBrowserCloseHook() {
  const dispatch = useDispatch();

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
    });
  };

  useEffect(() => {
    sessionStorage.setItem("isReloading", "true");

    const handleBroswerClose = () => {
      if (document.visibilityState === "hidden") {
        const isReloading = sessionStorage.getItem("isReloading");
        if (!isReloading || isReloading === "false") {
          handleLogout();
          sessionStorage.clear();
        }
      }
    };
    const handlePageLoad = () => {
      sessionStorage.setItem("isReloading", "false");
    };
    document.addEventListener("visibilitychange", handleBroswerClose);
    window.addEventListener("load", handlePageLoad);
    return () => {
      document.removeEventListener("visibilitychange", handleBroswerClose);
      window.removeEventListener("load", handlePageLoad);
    };
  }, []);
}

export default useBrowserCloseHook;
