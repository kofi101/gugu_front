/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEventHandler } from "react";
export interface UserState {
  currentUser: { uid: string; email: string };
  userToken: string | null;
  cartId: string | null;
  wishListId: string | null;
  orderId: string | null;
  mobilePaymentId: string | null;
  paymentNumber: string | null;
  otpNumber: string | null;
  checkoutDetailsFilled: boolean;
  deliveryDestination: null;
  orderDetailsId: string | null;
  detailsToAddReview: { prodId: string; orderNum: string };
  reviewId: string | null;
  notificationNumber: number | null;
}

export interface selectInputProp {
  name: string;
  options: { productCategoryId: number; productCategory: string }[];
  defaultValue: string;
  onChange: (value: string) => void;
  className: string;
}
export interface regionInputProp {
  name: string;
  options: { regionId: number; regionName: string; cityId?: number }[];
  defaultValue: string;
  onChange: (value: number) => void;
  className: string;
  disabled?: boolean;
}
export interface RadioButtonProps {
  name: string;
  id: string;
  value: string;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  description?: string;
  type?: string;
  disabled?: boolean;
  checked?: boolean;
}

export interface fileUploadProp {
  onFileSelect: (file: File[]) => void;
  className: string;
  title?: string;
  btnTitle: string;
}

export interface Product {
  availability?: string;
  productId?: number;
  productCategory?: string;
  productSubCategory?: string;
  brand?: string;
  productCode?: string;
  productName?: string;
  productDescription?: string;
  size?: string;
  colour?: string;
  material?: string;
  quantity?: number;
  productImages?: string[];
  imageOne?: string;
  salesPrice?: number;
  promotionPrice?: number;
  discountPercentage?: number;
  discountPrice?: number;
  isFeature?: string;
  isPromotion?: string;
  isDiscount?: string;
  reviewStars?: number | null;
}
export interface productCardProp {
  product: Product;
}

export interface categoryProductProp {
  category: Product;
}
export interface TabProps {
  title: string;
  count?: number;
  content: JSX.Element;
}

export interface CartItemProp {
  item: Product;
  // onQuantityChange?: (id: number, quantity: number) => void;
}

export interface WishListItemProp {
  item: Product;
}

export interface Customer {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  secondaryNumber?: string;
  address: string;
  digitalAddress?: string;
  region: string;
  city: string;
}

export interface CheckoutProcessProps {
  onComplete: () => void;
  isOpen: boolean;
  formComplete?: boolean;
  editPayment?: () => void;
  onRadioChange?: (value: string) => void;
}

export interface PrepayNowFormProps {
  cardNumber: string;
  cardName: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCVV: string;

  isOneTimeUseCard: boolean;
  paymentMethod: "visa" | "mastercard";
}
export interface momoFormProps {
  phoneNumber: string;
  paymentMethod: "mtn" | "telecel" | "airteltigo";
}

export interface PaginationComponentProps {
  currentData: any[];
  itemsPerPage: number;
  onPageChange: (pageNumber: number) => void;
}

export interface menuItemProps {
  name: string;
  icon: JSX.Element;
}
export interface Notification {
  notificationId: number;
  messageSubject: string;
  messageBody: string;
  status: number,
  isChecked: boolean;
  isOpen: boolean;
  isRead: boolean;
}

export interface ReviewProps {
  reviewId: number;
  productImage: string;
  productName: string;
  deliveryDate: string;
  orderNumber: string;
}

export interface SubmittedProps {
  reviewId?: number;
  productImage?: string;
  productName?: string;
  productPrice?: number;
  productRating?: number;
  reviewDate?: string;
  reviewTitle?: string;
  reviewContent?: string;
}

export interface textAreaProps {
  error?: string;
  label?: string;
  className?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  value?: string;
  rows?: number;
  placeholder?: string;
  id?: string;
  [key: string]: any;
}

export interface DeliveryType {
  displayName: string;
  name: string;
  id: number;
}

export interface Voucher {
  couponType: string;
  couponCode: string;
  couponAmount: number;
  couponPercentage: number;
  applicationType: string;
  expiryDate: string;
  orderNumber: string | null;
  isRedeemed: boolean;
  status: string;
}

export interface customerOrder {
  checkOutOrderNumber: string;
  quantity: number;
  transactionDate: string;
  checkoutTotal: number;
  checkOutStatus: string,
}

export interface customerOrderDetails {
  orderSummary: {
    checkOutOrderNumber: string;
    quantity: number;
    transactionDate: string;
    checkoutTotal: number;
    checkOutStatus: string,
  };
  orderDetails: {
    productName: string;
    salesPrice: number;
    quantity: number;
    imageOne: string;
  }[];
  deliveryInformation: {
    address: string;
    digitalAddress: string;
    region: string;
    destination: string;
  };
  paymentDetails: {
    itemTotal: number;
    deliveryFees: number;
    discount: number;
    total: number;
  };
}

export interface productReviewProps {
  reviewStatus: string;
  reviewId: number;
  customerId: string;
  orderNumber: string;
  productName: string;
  productId: number;
  shortReview: string;
  reviewDetails: string;
  numberOfStars: number;
  submittedDate: string;
  deliveryDate: string;
  salesPrice: number;
  productImage: string;
}

export interface NotificationProps {
  notificationId: number,
    messageSubject: string,
    messageBody: string,
    status: number,
    isChecked: boolean,
    isOpen: boolean,
    isRead: boolean,
}[]


