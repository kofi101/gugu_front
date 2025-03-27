/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { menuItemProps } from "../../helpers/interface/interfaces";
import { CgProfile } from "react-icons/cg";
import MailSvg from "../../assets/svg/mailSvg";
import ReviewsSvg from "../../assets/svg/reviewSvg";
import OrderSvg from "../../assets/svg/orderSvg";
import VoucherSvg from "../../assets/svg/voucherSvg";
import Orders from "../../components/accountComponents/Orders";
import Reviews from "../../components/accountComponents/Reviews";
import Vouchers from "../../components/accountComponents/Vouchers";
import Notification from "../../components/accountComponents/Notifications";
import MyAccountDetails from "../../components/accountComponents/MyAccount";
import AppButton from "../../shared/AppButton";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  setCartId,
  setCheckoutDetailsFilled,
  setDeliveryDestination,
  setDetailsToAddReview,
  setOrderDetailsId,
  setOrderId,
  setReviewId,
  setUser,
  setUserToken,
  setWishListId,
} from "../../store/features/userSliceFeature";
import { resetUserCart } from "../../store/features/cartFeature";
import { routerPath } from "../../routes/Router";

const MyAccount = () => {
  const [active, setActive] = useState<string>("My Account");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const user = useSelector((store: any) => store?.user);

  const menuItems: menuItemProps[] = [
    { name: "My Account", icon: <CgProfile /> },
    { name: "Orders", icon: <OrderSvg /> },
    { name: `Notification`, icon: <MailSvg /> },
    { name: "Reviews", icon: <ReviewsSvg /> },
    { name: "Vouchers", icon: <VoucherSvg /> },
  ];
  const handleLogout = () => {
    signOut(auth).then(() => {
      dispatch(setUser(null));
      dispatch(setUserToken(null));
      dispatch(setCartId(null));
      dispatch(setWishListId(null));
      dispatch(setOrderId(null));
      dispatch(setCheckoutDetailsFilled(false));
      dispatch(setDeliveryDestination(null));
      dispatch(setOrderDetailsId(null));
      dispatch(setDetailsToAddReview(null));
      dispatch(setReviewId(null));
      localStorage.clear();
      dispatch(resetUserCart());
      toast.success("Sign-out successful.", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate(routerPath.HOMEPAGE);
      }, 2000);
    });
  };
  return (
    <div className="flex gap-4 mt-10 mb-10  w-[60%] mx-auto">
      <div className="flex flex-col justify-between w-[25%]">
        <ul className=" bg-base-gray-200">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`flex items-center p-3 cursor-pointer border-b h-[52px] ${
                active === item.name
                  ? "bg-gray-primary-400 font-medium"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActive(item.name)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </li>
          ))}
        </ul>
        <div className=" bg-base-gray-200">
          <AppButton
            title="Close Account"
            className="flex justify-center w-full p-2 border-b hover:bg-gray-200 h-[52px]"
            clickHandler={() => navigate(routerPath.HOMEPAGE)}
          />
          <AppButton
            title="Logout"
            className="flex justify-center w-full p-2 font-bold text-primary-400 hover:bg-gray-200 h-[52px]"
            clickHandler={() => handleLogout()}
          />
        </div>
      </div>
      <div className="md:w-[75%]  h-[500px] overflow-y-scroll custom-scrollbar">
        {active === "My Account" && <MyAccountDetails />}
        {active === "Orders" && <Orders />}
        {active === "Notification" && <Notification />}
        {active === "Reviews" && <Reviews />}
        {active === "Vouchers" && <Vouchers />}
      </div>
    </div>
  );
};

export default MyAccount;
