/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { appRoutes } from "./routes/Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLayout from "./views/main/MainLayout";
// import { signOut } from "firebase/auth";
// import { auth } from "./firebase/config";
// import { useDispatch } from "react-redux";
// import {
//   setCartId,
//   setCheckoutDetailsFilled,
//   setDeliveryDestination,
//   setDetailsToAddReview,
//   setOrderDetailsId,
//   setOrderId,
//   setReviewId,
//   setUser,
//   setUserToken,
//   setWishListId,
// } from "./store/features/userSliceFeature";
// import { resetUserCart } from "./store/features/cartFeature";
// import { useEffect } from "react";
// import useInactivityHook from "./helpers/hooks/inactivityHook";
// import useBrowserCloseHook from "./helpers/hooks/browserCloseHook";

function App() {
  // useBrowserCloseHook()

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   const handleLogout = (event: any) => {
  //     signOut(auth).then(() => {
  //       dispatch(setUser(null));
  //       dispatch(setUserToken(null));
  //       dispatch(setCartId(null));
  //       dispatch(setWishListId(null));
  //       dispatch(setOrderId(null));
  //       dispatch(setCheckoutDetailsFilled(false));
  //       dispatch(setDeliveryDestination(null));
  //       dispatch(setOrderDetailsId(null));
  //       dispatch(setDetailsToAddReview(null));
  //       dispatch(setReviewId(null));
  //       console.log("User signed out", event);

  //       localStorage.clear();
  //       dispatch(resetUserCart());
  //     });
  //   };
  //   window.addEventListener("beforeunload", handleLogout);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleLogout);
  //   };
  // }, []);
  
  
  return (
    <div className="text-black-primary-400 app">
      <Router>
        <ToastContainer />
        {/* <InactivityHandler/> */}
        <MainLayout>
          <Routes>
            {appRoutes.map(({ path, element }, key) => (
              <Route key={key} path={path} element={element} />
            ))}
          </Routes>
        </MainLayout>
      </Router>
    </div>
  );
}

// function InactivityHandler() {
//   useInactivityHook();
//   return null;
// }

export default App;
