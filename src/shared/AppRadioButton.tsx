import React from "react";
import { RadioButtonProps } from "../helpers/interface/interfaces";
import "../styles/AppCustomCss.css";

const AppRadioButton: React.FC<RadioButtonProps> = ({
  name,
  id,
  value,
  label,
  className,
  onChange,
  type,
  disabled = false,
  checked
}) => {
  return (
    <div
      className={` flex items-center ${className} ${
        type === "delivery"
          ? "w-[80%]"
          : type === "deliverystation"
          ? "w-full"
          : "w-[50%]"
      }`}
    >
      <input
        type="radio"
        name={name}
        id={id}
        value={value}
        className="hidden"
        onChange={!disabled ? onChange : undefined}
        disabled={disabled}
        checked={checked}
      />
      <label
        htmlFor={id}
        className={`${
          type === "delivery"
            ? "flex items-center pl-2 text-[14px] cursor-pointer"
            : type === "deliverystation"
            ? "flex text-[14px] cursor-pointer"
            : "flex items-center pl-2 text-[14px] cursor-pointer"
        } ${disabled ? "text-gray-400 cursor-not-allowed" : ""}`}
      >
        <span
          className={`inline-block w-4 h-4 mr-2 bg-white border ${
            disabled ? "border-gray-300" : "border-gray-500"
          } rounded-full shadow-inner`}
        ></span>
        <div>
          <p
            className={`${
              type === "delivery" || type === "deliverystation"
                ? "font-bold"
                : ""
            }`}
          >
            {label}
          </p>
          {/* {description && <p className="text-xs">{description}</p>} */}
        </div>
      </label>
    </div>
  );
};

export default AppRadioButton;
