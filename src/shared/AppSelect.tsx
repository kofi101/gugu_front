import { selectInputProp } from "../helpers/interface/interfaces";
const AppSelect: React.FC<selectInputProp> = ({
  name,
  options,
  defaultValue,
  onChange,
  className,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };
  return (
    <select name={name} defaultValue={defaultValue} onChange={handleChange} className={`${className}`}>
      {options?.map((option) => (
        <option key={option.productCategoryId} value={option.productCategoryId}>
          {option.productCategory}
        </option>
      ))}
    </select>
  );
};

export default AppSelect;
