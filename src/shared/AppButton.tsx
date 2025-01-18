import React from "react";
import { buttonProp } from "../helpers/type/types";
// import CircularProgress from "@mui/material/CircularProgress";
import AppLoader from "./AppLoader";

const AppButton: React.FC<buttonProp> = ({
  title,
  className,
  clickHandler,
  icon,
  loading,
}) => {
  return (
    <div>
      <button onClick={clickHandler} className={`${className}`}>
        {loading ? (
          <AppLoader height="20px" width="20px" />
        ) : (
          <div className="flex items-center justify-center gap-1">
            {icon}
            {title}
          </div>
        )}
      </button>
    </div>
  );
};

export default AppButton;
