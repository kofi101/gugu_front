import React from "react";
import { inputProp } from "../helpers/type/types";

const AppInput: React.FC<inputProp> = ({
  id,
  type,
  value,
  placeholder,
  onChange,
  className,
  disabled
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ id: id || '', value: event.target.value });
  };
  return (
    <div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className={`${className}`}
        disabled={disabled}
      />
    </div>
  );
};

export default AppInput;
