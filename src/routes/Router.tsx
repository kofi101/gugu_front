import Login from "../views/auth/Login"
import HomePage from "../views/customer/HomePage"
import Register from "../views/auth/Register"
import ForgotPassword from "../views/auth/ForgotPassword"
import ProductDetailsView from "../views/customer/ProductDetailsView"
import SearchProducts from "../views/customer/SearchProducts"
import Cart from "../views/cart/Cart"
import WishList from "../views/wishList/WishList"
import Promotions from "../views/others/promo/Promotions"
import IndividualPromo from "../components/others/promo/IndividualPromotion"
import About from "../views/others/about/About"
import ContactUs from "../views/others/contact/Contact"
import Support from "../views/others/support/Support"
import Categories from "../views/category/CategoriesView"
import Checkout from "../views/checkout/Checkout"
import MyAccount from "../views/Account/MyAccount"
import ProductReview from "../views/customer/ProductReview"
import PageNotFound from "../views/auth/PageNotFound"
import CheckoutComplete from "../views/checkout/CheckoutComplete"
import ConfirmCheckout from "../views/checkout/ConfirmCheckout"
import EditReview from "../views/customer/EditReview"


export const routerPath = {
    LOGIN: "/login",
    REGISTER: "/registration",
    FORGOTPASSWORD: "/forgot-password",
    HOMEPAGE: "/",
    PRODUCTDETAILS: `/product-details/`,
    SEARCHPRODUCTS: "/search-products/",
    CART: "/cart",
    WISHLIST: "/wishlist",
    PROMOTIONS: "/promotions",
    PROMOTIONS_PRODUCTS: "/promotion-products",
    ABOUT: "/about",
    CONTACT: "/contact-us",
    SUPPORT: "/support",
    CATEGORIES: "/categories",
    CHECKOUT: "/checkout",
    MYACCOUNT: "/my-account",
    PRODUCTREVIEW: "/add-product-review",
    EDITPRODUCTREVIEW: "/edit-product-review",
    CONFIRMCHECKOUTDETAILS: "/confirm-checkout-payment",
    CONFIRMATION: "/confirmation",
    PAGENOTFOUND: "*"
}


export const appRoutes  = [
    {
        path: routerPath.LOGIN,
        element: <Login />
    },
    {
        path: routerPath.REGISTER,
        element: <Register />
    },
    {
        path: routerPath.FORGOTPASSWORD,
        element: <ForgotPassword />
    
    },
    {
        path: routerPath.HOMEPAGE,
        element: <HomePage />
    },
   
    {
        path: routerPath.PRODUCTDETAILS + `:productId`,
        element: <ProductDetailsView />
    },
    {
        path: routerPath.SEARCHPRODUCTS + `:searchQuery`,
        element: <SearchProducts />
    },
    {
        path: routerPath.CART,
        element: <Cart />
    },
    {
        path: routerPath.WISHLIST,
        element: <WishList />
    },
    {
        path: routerPath.PROMOTIONS,
        element: <Promotions />
    },
    {
        path: routerPath.PROMOTIONS_PRODUCTS,
        element: <IndividualPromo />
    },
    {
        path: routerPath.ABOUT,
        element: <About />
    },
    {
        path: routerPath.CONTACT,
        element: <ContactUs />
    },
    {
        path: routerPath.SUPPORT,
        element: <Support />
    },
    {
        path: routerPath.CATEGORIES,
        element: <Categories />
    },
    {
        path: routerPath.CHECKOUT,
        element: <Checkout />
    },
    {
        path: routerPath.MYACCOUNT,
        element: <MyAccount />
    },
    {
        path: routerPath.PRODUCTREVIEW,
        element: <ProductReview />
    },
    {
        path: routerPath.EDITPRODUCTREVIEW,
        element: <EditReview />
    },
    {
        path: routerPath.CONFIRMCHECKOUTDETAILS,
        element: <ConfirmCheckout />
    },
    {
        path: routerPath.CONFIRMATION,
        element: <CheckoutComplete />
    },
    {
        path: routerPath.PAGENOTFOUND,
        element: <PageNotFound />
    }
]