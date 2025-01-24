import axios, { AxiosInstance } from "axios";
import store from "../store/store";
export const BASE_URL = `${import.meta.env.VITE_APP_BACKEND_BASE_URL}`;
// export const PAYMENT_URL = `${import.meta.env.VITE_APP_PAYMENT_BASE_URL}`;

//Bearer token
export const getBearerToken = `${BASE_URL}User/GetToken`;

//auth endpoints
export const addUserDetails = `${BASE_URL}User/AddUserDetails`;
export const userType = `${BASE_URL}User/UserTypes`;
export const getUserDetails = `${BASE_URL}User/GetUserDetails/`;
export const updatePersonalInfo = `${BASE_URL}User/UpdateUserDetails`;
export const udateAddressBook = `${BASE_URL}User/UpdateShippingAddress`;

//products
export const productsEndpoint = `${BASE_URL}Customer/GetProducts`;
export const featuredProductsUrl = `${BASE_URL}Customer/FeaturedProducts`;
export const productBrands = `${BASE_URL}Management/Brands`;
export const searchProducts = `${BASE_URL}Customer/GetSearchProducts`;

//cart
export const userCart = `${BASE_URL}Cart/CreateCartList/`;
export const createCustomerCart = `${BASE_URL}Cart/CreateCart`;
export const addItemsToUserCart = `${BASE_URL}Cart/AddToCart`;
export const removeItemsFromLoggedInUserCart = `${BASE_URL}Cart/RemoveFromCart`;
export const updateCart = `${BASE_URL}Cart/UpdateCart`;
export const getUserCartItems = `${BASE_URL}Cart/GetCartProductList/`;

//wishlist
export const userWishList = `${BASE_URL}WishList/CreateWishList`;
export const addToWishList = `${BASE_URL}WishList/AddToWishList`;
export const removeFromWishList = `${BASE_URL}WishList/RemoveFromWishList`;
export const getUserWishList = `${BASE_URL}WishList/GetWishList/`;
export const moveItemFromWishListToCart = `${BASE_URL}WishList/MigrateFromWishListToCart`;

//categories
export const getCategories = `${BASE_URL}Management/ProductCategories`;
export const categoryProductsEndpoint = `${BASE_URL}Customer/ProductsByFilters/`;

//regions
export const getRegions = `${BASE_URL}Customer/Regions`;
export const getRegionCities = `${BASE_URL}Customer/Cities/`;

//contact us
export const contactUs = `${BASE_URL}User/ContactUs`;

//checkout
export const coupons = `${BASE_URL}Coupon/RedeemCoupon`;

//Orders
export const checkoutCustomerDetails = `${BASE_URL}Orders/CustomerDetails`;
export const checkoutOrder = `${BASE_URL}Orders/Checkout`;
export const useCurrentAddress = `${BASE_URL}User/GetCheckoutAddress`;
export const saveDeliveryAddress = `${BASE_URL}Orders/Delivery`;
export const orderSendToDetails = `${BASE_URL}Orders/CheckoutDetails`;

export const paidOrders = `${BASE_URL}Orders/CustomerOrders`
export const paidOrderDetails = `${BASE_URL}Orders/CustomerOrderDetails`

//vouchers
export const userVouchers = `${BASE_URL}Coupon/CustomerCoupons`;

//Delivery
export const deliveryOptions = `${BASE_URL}Delivery/DeliveryDestinations`;
export const deliveryType = `${BASE_URL}Customer/DeliveryType`;
export const deliveryInAccra = `${BASE_URL}Customer/DeliveryDestionations`;

//payment
export const getPaymentMethods = `${BASE_URL}Payment/GetPaymentMethods`;
export const sendPaymentOtp = `${BASE_URL}Payment/SendPaymentOTP`;
export const makePayment = `${BASE_URL}Payment/ExpressPay/MakePayment`;
export const paymentStatus = `${BASE_URL}Payment/ExpressPay/CheckPaymentStatus`;


//reviews
export const addProductReview = `${BASE_URL}ProductReview/SubmitReview`;
export const editProductReview = `${BASE_URL}ProductReview/EditReview`;
export const getProductReviews = `${BASE_URL}ProductReview/GetReviews`;
export const getCustomerPendingReviews = `${BASE_URL}ProductReview/ProductsToReview`;
export const getCustomerSubmittedReviews = `${BASE_URL}ProductReview/Reviews`;
export const getEditReviewDetails = `${BASE_URL}ProductReview/EditPendingReviews`;
export const getAddReviewDetails = `${BASE_URL}ProductReview/AddPendingReviews`;

//notifications
export const getNotifications = `${BASE_URL}Notification/GetNotificationMessages`;
export const updateNoficationsAsRead = `${BASE_URL}Notification/UpdateNotificationStatus`;
export const updateNoficationsAsUnRead = `${BASE_URL}Notification/UpdateNotificationStatusMarkAsUnRead`;
export const deleteNotification = `${BASE_URL}Notification/DeleteNotifications`;

//upload files
export const uploadFile = `${BASE_URL}FilesManager/UploadFileDocuments`;


const API: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: false,
});

API.interceptors.request.use(
  (config) => {
    const token = store.getState().user.userToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
