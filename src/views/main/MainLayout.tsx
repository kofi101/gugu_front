import { useEffect, useState } from "react";
import MainHeader from "../../components/topbar/TopBar";
import MainFooter from "../../components/footer/MainFooter";
import { MainLayoutProp } from "../../helpers/type/types";
import { useLocation } from "react-router";
import { routerPath } from "../../routes/Router";

import "../../styles/AppCustomCss.css";

const MainLayout: React.FC<MainLayoutProp> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [truePath, setTruePath] = useState(false);

  useEffect(() => {
    if (
      currentPath === routerPath.LOGIN ||
      currentPath === routerPath.FORGOTPASSWORD ||
      currentPath === routerPath.REGISTER ||
      currentPath === routerPath.CHECKOUT ||
      currentPath === routerPath.CONFIRMCHECKOUTDETAILS
    ) {
      setTruePath(true);
    } else {
      setTruePath(false);
    }
  }, [currentPath]);
  return (
    <div className="">
      {truePath ? (
        <div className="h-screen">{children}</div>
      ) : (
        <div>
          <MainHeader />
          <div className="flex gap-3">
            <div
              className={`w-[22%] advert ${
                currentPath === routerPath.HOMEPAGE ? "block" : "hidden"
              }`}
            ></div>
            <div className={`h-full ${currentPath === routerPath.HOMEPAGE ? 'w-[80%]' : 'w-full'}`}>{children}</div>
            <div
              className={`w-[22%] advert ${
                currentPath === routerPath.HOMEPAGE ? "block" : "hidden"
              }`}
            ></div>
          </div>
          <MainFooter />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
