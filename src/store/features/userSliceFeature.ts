import { createSlice } from "@reduxjs/toolkit";
import { UserState } from "../../helpers/interface/interfaces";

const initialState: UserState = {
  currentUser: { uid: "", email: "" },
  userToken: null,
  cartId: null,
  wishListId: null,
  orderId: null,
  mobilePaymentId: null,
  paymentNumber: null,
  otpNumber: null,
  checkoutDetailsFilled: false,
  deliveryDestination: null,
  orderDetailsId: null,
  detailsToAddReview: {prodId: '', orderNum: ''},
  reviewId: null
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setUserToken: (state, action) => {
      state.userToken = action.payload;
    },
    setCartId: (state, action) => {
      state.cartId = action.payload;
    },
    setWishListId: (state, action) => {
      state.wishListId = action.payload;
    },
    setOrderId: (state, action) => {
      state.orderId = action.payload;
    },
    setMobilePaymentId: (state, action) => {
      state.mobilePaymentId = action.payload;
    },
    setPaymentNumber: (state, action) => {
      state.paymentNumber = action.payload;
    },
    setOtpNumber: (state, action) => {
      state.otpNumber = action.payload;
    },
    setCheckoutDetailsFilled: (state, action) => {
      state.checkoutDetailsFilled = action.payload
    },
    setDeliveryDestination: (state, action) => {
      state.deliveryDestination = action.payload
    },
    setOrderDetailsId: (state, action) => {
      state.orderDetailsId = action.payload
    },
    setDetailsToAddReview: (state, action) => {
      state.detailsToAddReview = action.payload
    },
    setReviewId: (state, action) => {
      state.reviewId = action.payload
    }
  },
});

export const {
  setUser,
  setUserToken,
  setCartId,
  setWishListId,
  setOrderId,
  setMobilePaymentId,
  setPaymentNumber,
  setOtpNumber,
  setCheckoutDetailsFilled,
  setDeliveryDestination,
  setOrderDetailsId,
  setDetailsToAddReview,
  setReviewId
} = userSlice.actions;

export const selectUser = (state: { users: UserState }) => state.users;

export default userSlice.reducer;
