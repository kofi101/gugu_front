/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AppButton from "../../shared/AppButton";
import AppInput from "../../shared/AppInput";
import AppSelect from "../../shared/AppSelect";
// import { RxCaretDown } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { BiCart } from "react-icons/bi";
import { IoLogOutOutline, IoCallOutline } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdLogin, MdOutlineEmail } from "react-icons/md";
import { routerPath } from "../../routes/Router";
import { useLocation, useNavigate } from "react-router-dom";
import Badge from "@mui/material/Badge";
import "../../styles/AppCustomCss.css";
import FavSvg from "../../assets/svg/gugu_favourite.svg";
import CartSvg from "../../assets/svg/gugucart.svg";
import GuguLogo from "../../assets/gugu1.png";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import {
  setCartId,
  setCheckoutDetailsFilled,
  setCompanyInfo,
  setDeliveryDestination,
  setDetailsToAddReview,
  setOrderDetailsId,
  setOrderId,
  setReviewId,
  setUser,
  setUserToken,
  setWishListId,
} from "../../store/features/userSliceFeature";
import API, {
  getUserDetails,
  getCategories,
  getCompanyDetails,
} from "../../endpoint";
import { loggedInUser } from "../../helpers/type/types";
import { fetchUserCart, resetUserCart } from "../../store/features/cartFeature";
import { fetchWishListFromServer } from "../../store/features/wishListFeature";
import { companyDetailsProps } from "../../helpers/interface/interfaces";
import { sellOnGuguLink } from "../../helpers/functions/constants";

type PartialUser = Partial<loggedInUser>;

const TopBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  console.log("current path", currentPath);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store: any) => store?.user?.currentUser);
  const userToken = useSelector((store: any) => store?.user?.userToken);
  const cart = useSelector((store: any) => store?.cart);
  const wish = useSelector((store: any) => store?.wishList);
  const [myAccount, setMyAccount] = useState(false);
  const [currentUser, setCurrentUser] = useState<PartialUser>();
  const [searchInput, setSearchInput] = useState({
    search: "",
  });
  const [category, setCategory] = useState([]);
  const [companyDetails, setCompanyDetails] = useState<companyDetailsProps>();

  const handleFetchUserDetails = () => {
    API.get(`${getUserDetails}${user?.uid}`).then((response) => {
      setCurrentUser(response.data);
    });
  };
  const fetchCategories = () => {
    API.get(`${getCategories}`).then((response) => {
      const responsedata = response.data;
      setCategory(responsedata);
    });
  };

  const handleGetCompanyInformation = () => {
    API.get(`${getCompanyDetails}`)
      .then((response) => {
        if (response.status === 200) {
          setCompanyDetails(response.data);
          dispatch(setCompanyInfo(response.data));
        }
      })
      .catch();
  };

  useEffect(() => {
    setCurrentUser(user);
    userToken ? handleFetchUserDetails() : "";
    fetchCategories();
    handleGetCompanyInformation();
    user?.uid ? dispatch(fetchUserCart() as any) : "";
    user?.uid ? dispatch(fetchWishListFromServer() as any) : "";
  }, [userToken]);

  const handleSearch = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setSearchInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const handleMyAccount = () => {
    setMyAccount(!myAccount);
  };

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

  const handleCategoryClick = (item: number) => {
    console.log("category clicked", item);

    navigate(routerPath.CATEGORIES);
  };

  const goToSearch = () => {
    navigate(`${routerPath.SEARCHPRODUCTS}${searchInput.search}`);
  };

  const sellOnGugu = () => {
    window.location.href = sellOnGuguLink;
  };

  const handleCall = () => {
    if (companyDetails?.callUseNowNumber) {
      window.location.href = `tel:${companyDetails.callUseNowNumber}`;
    }
  };

  const handleEmail = () => {
    if (companyDetails?.siteDisplayEmail) {
      window.location.href = `mailto:${companyDetails.siteDisplayEmail}`;
    }
  };
  return (
    <div className="text-center">
      <div className=" bg-primary-500 h-[30px]">
        {currentUser ? (
          <p className=" text-primary-500">{currentUser.fullName}</p>
        ) : (
          ""
        )}
      </div>

      <div className="py-3 md:py-10 bg-white-primary-400">
        <div className="items-center justify-between mx-auto md:w-3/5 md:flex">
          <img
            onClick={() => navigate(routerPath.HOMEPAGE)}
            src={GuguLogo}
            alt=""
            className="w-[130px] hidden md:flex cursor-pointer"
          />

          <div className="flex items-center justify-center">
            <AppSelect
              onChange={(value: string) => handleCategoryClick(Number(value))}
              defaultValue=""
              name=""
              options={category}
              className="px-2 py-2 outline-none md:h-[50px] rounded-l-full md:w-[130px] border-primary-400 border md:block w-[40px] text-xs font-[500]"
            />
            <AppInput
              className="p-2 outline-none md:w-72 md:h-[50px] border-primary-400 border"
              onChange={handleSearch}
              type="text"
              value={searchInput.search}
              id="search"
              placeholder=""
            />
            <AppButton
              title="Search"
              clickHandler={() => goToSearch()}
              className="px-4 py-2 md:h-[50px] rounded-r-full bg-primary-500 text-white-primary-400 font-bold text-xs"
            />
          </div>
          <div className="hidden text-left text-black-primary-400 md:flex gap-4 w-[240px]">
            <p
              onClick={handleCall}
              className="flex items-center p-1 rounded-md cursor-pointer bg-primary-400"
            >
              <IoCallOutline className="text-2xl text-white-primary-400" />
            </p>

            <p
              onClick={handleEmail}
              className="flex items-center p-1 rounded-md cursor-pointer bg-primary-400"
            >
              <MdOutlineEmail className="text-2xl text-white-primary-400" />
            </p>
          </div>
        </div>
      </div>
      <div
        className={`hidden  md:flex h-[63px] items-center justify-between ${
          currentPath === routerPath.HOMEPAGE
            ? "bg-gray-nav-400 !text-black-secondary-500"
            : "bg-primary-500"
        }`}
      >
        <div className="flex items-center justify-between w-3/5 py-6 mx-auto">
          <div>
            <ul
              className={`flex gap-10 font-bold uppercase  text-[12px] ${
                currentPath === routerPath.HOMEPAGE
                  ? "text-black-secondary-500"
                  : "text-white-primary-400"
              }`}
            >
              <li
                className={`cursor-pointer ${
                  currentPath === routerPath.HOMEPAGE
                    ? "hover:text-primary-500 hover:underline"
                    : "text-white-primary-400"
                }`}
                onClick={() => navigate(routerPath.HOMEPAGE)}
              >
                Home
              </li>
              <li
                className={`cursor-pointer ${
                  currentPath === routerPath.HOMEPAGE
                    ? "hover:text-primary-500 hover:underline"
                    : "text-white-primary-400"
                }`}
                onClick={() => navigate(routerPath.PROMOTIONS)}
              >
                Promotions
              </li>
              <li
                className={`cursor-pointer ${
                  currentPath === routerPath.HOMEPAGE
                    ? "hover:text-primary-500 hover:underline"
                    : "text-white-primary-400"
                }`}
                onClick={() => navigate(routerPath.ABOUT)}
              >
                About
              </li>
              <li
                className={`cursor-pointer ${
                  currentPath === routerPath.HOMEPAGE
                    ? "hover:text-primary-500 hover:underline"
                    : "text-white-primary-400"
                }`}
                onClick={() => navigate(routerPath.CONTACT)}
              >
                Contact
              </li>
              <li
                className={`cursor-pointer ${
                  currentPath === routerPath.HOMEPAGE
                    ? "hover:text-primary-500 hover:underline"
                    : "text-white-primary-400"
                }`}
                onClick={() => sellOnGugu()}
              >
                Sell on Gugu
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate(routerPath.WISHLIST)}
              
              className={`flex items-center p-1 rounded-md cursor-pointer ${
                currentPath === routerPath.HOMEPAGE
                  ? "bg-primary-500"
                  : "bg-primary-600"
              }`}
            >
              <Badge
                badgeContent={
                  user
                    ? wish.userWishList?.wishListProducts?.length
                    : wish.guestWishList?.length
                }
                color="primary"
              >
                <img src={FavSvg} alt="" className="w-[24px] h-[24px]" />
              </Badge>
            </div>
            <div
              onClick={() => navigate(routerPath.CART)}
              className={`flex items-center p-1 rounded-md cursor-pointer ${
                currentPath === routerPath.HOMEPAGE
                  ? "bg-primary-500"
                  : "bg-primary-600"
              }`}
            >
              <Badge
                badgeContent={
                  user
                    ? cart.userCart?.cartProducts?.length
                    : cart.guestUserCart?.length
                }
                color="primary"
              >
                <img src={CartSvg} alt="" className="w-[24px] h-[24px]" />
              </Badge>
            </div>
            {user?.uid ? (
              <div className="">
                <div
                  onClick={handleMyAccount}
                  className={`flex items-center p-1 rounded-md cursor-pointer ${
                    currentPath === routerPath.HOMEPAGE
                      ? "bg-primary-500"
                      : "bg-primary-600"
                  }`}
                >
                  <FaRegCircleUser className="!font-bold text-white-primary-400 !h-[24px] !w-[24px]" />
                </div>
                {myAccount ? (
                  <div className="absolute z-10 w-32 p-2 border rounded-[4px] bg-white-primary-400 top-56">
                    <ul>
                      <li
                        onClick={() => navigate(routerPath.MYACCOUNT)}
                        className="flex items-center justify-between py-1 cursor-pointer hover:bg-white-primary-400 hover:text-primary-500"
                      >
                        <p>My Account</p>
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
              <div
                onClick={() => navigate(routerPath.LOGIN)}
                className={`flex items-center p-1 rounded-md cursor-pointer ${
                  currentPath === routerPath.HOMEPAGE
                    ? "bg-primary-500"
                    : "bg-primary-600"
                }`}
              >
                <MdLogin className="!font-bold text-white-primary-400 h-[24px] w-[24px]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
