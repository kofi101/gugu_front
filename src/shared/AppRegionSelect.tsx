import { regionInputProp } from "../helpers/interface/interfaces";
const AppRegionSelect: React.FC<regionInputProp> = ({
  name,
  options,
  defaultValue,
  onChange,
  className,
  disabled,
  value
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(event.target.value));
  };
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      value={value}
      onChange={handleChange}
      className={`${className}`}
      disabled={disabled}
    >
      {options?.map((option) => (
        <option key={option.regionId} value={option.regionId}>
          {option.regionName}
        </option>
      ))}
    </select>
  );
};

export default AppRegionSelect;
