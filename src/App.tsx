import { lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "./components/layout/Layout";
import { RequireAuth } from "./components/Common";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";
import Home from "./pages/Home";
import { RouteError } from "./components/RouteError";

const Category = lazy(() => import("./pages/Category"));
const Search = lazy(() => import("./pages/Search"));
const ProductPage = lazy(() => import("./pages/Product"));
const Store = lazy(() => import("./pages/Store"));
const Stores = lazy(() => import("./pages/Stores"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const Profile = lazy(() => import("./pages/account/Profile"));
const Orders = lazy(() => import("./pages/account/Orders"));
const OrderDetail = lazy(() => import("./pages/account/OrderDetail"));
const MyReviews = lazy(() => import("./pages/account/MyReviews"));
const Checkout = lazy(() => import("./pages/checkout/Checkout"));
const CheckoutConfirm = lazy(() => import("./pages/checkout/CheckoutConfirm"));
const Sell = lazy(() => import("./pages/Sell"));
const About = lazy(() => import("./pages/info/About"));
const Contact = lazy(() => import("./pages/info/Contact"));
const Terms = lazy(() => import("./pages/info/Terms"));
const Privacy = lazy(() => import("./pages/info/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: "c/:categoryId", element: <Category /> },
      { path: "search", element: <Search /> },
      { path: "p/:productId", element: <ProductPage /> },
      { path: "store/:merchantId", element: <Store /> },
      { path: "stores", element: <Stores /> },
      { path: "cart", element: <Cart /> },
      { path: "wishlist", element: <Wishlist /> },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      {
        path: "account",
        element: (
          <RequireAuth>
            <AccountLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Profile /> },
          { path: "orders", element: <Orders /> },
          { path: "orders/:orderId", element: <OrderDetail /> },
          { path: "reviews", element: <MyReviews /> },
        ],
      },
      {
        path: "checkout",
        element: (
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        ),
      },
      {
        path: "checkout/confirm",
        element: (
          <RequireAuth>
            <CheckoutConfirm />
          </RequireAuth>
        ),
      },
      { path: "sell", element: <Sell /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "terms", element: <Terms /> },
      { path: "privacy", element: <Privacy /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
