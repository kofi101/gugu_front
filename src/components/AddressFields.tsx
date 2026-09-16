import { getRegions } from "../data/catalog";
import { useAsync } from "../hooks/useAsync";
import type { ShippingAddress } from "../lib/types";

export const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

export type AddressErrors = Partial<Record<keyof ShippingAddress, string>>;

export function validateAddress(a: ShippingAddress): AddressErrors {
  const e: AddressErrors = {};
  if (!a.fullName.trim()) e.fullName = "Enter the name of the person receiving the order.";
  if (!a.line1.trim()) e.line1 = "Enter a street, house number or landmark.";
  if (!a.city.trim()) e.city = "Enter a town or city.";
  if (!a.region.trim()) e.region = "Choose a region.";
  const digits = a.phone.replace(/[^\d]/g, "");
  if (digits.length < 9 || digits.length > 13) e.phone = "Enter a phone number the rider can call, e.g. 024 123 4567.";
  return e;
}

export function AddressFields({
  value,
  onChange,
  errors = {},
  disabled,
  idPrefix = "ship",
}: {
  value: ShippingAddress;
  onChange: (v: ShippingAddress) => void;
  errors?: AddressErrors;
  disabled?: boolean;
  idPrefix?: string;
}) {
  const regions = useAsync(getRegions, []);
  const regionNames = regions.data && regions.data.length ? regions.data.map((r) => r.name) : GHANA_REGIONS;
  const options = value.region && !regionNames.includes(value.region) ? [value.region, ...regionNames] : regionNames;

  const set = (k: keyof ShippingAddress) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  const a11y = (k: keyof ShippingAddress, hint?: string) => ({
    id: `${idPrefix}-${k}`,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${idPrefix}-${k}-error` : hint,
    disabled,
  });
  const err = (k: keyof ShippingAddress) =>
    errors[k] ? (
      <p id={`${idPrefix}-${k}-error`} className="field-error">
        {errors[k]}
      </p>
    ) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-fullName`} className="field-label">
          Full name
        </label>
        <input className="input" autoComplete="name" value={value.fullName} onChange={set("fullName")} {...a11y("fullName")} />
        {err("fullName")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-phone`} className="field-label">
          Phone number
        </label>
        <input className="input" type="tel" inputMode="tel" autoComplete="tel" value={value.phone} onChange={set("phone")} {...a11y("phone")} />
        {err("phone")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-line1`} className="field-label">
          Address
        </label>
        <input className="input" autoComplete="address-line1" placeholder="House number, street or landmark" value={value.line1} onChange={set("line1")} {...a11y("line1")} />
        {err("line1")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-line2`} className="field-label">
          Area or directions <span className="font-normal text-text-muted">(optional)</span>
        </label>
        <input className="input" autoComplete="address-line2" value={value.line2} onChange={set("line2")} {...a11y("line2")} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-city`} className="field-label">
          Town or city
        </label>
        <input className="input" autoComplete="address-level2" value={value.city} onChange={set("city")} {...a11y("city")} />
        {err("city")}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-region`} className="field-label">
          Region
        </label>
        <select className="input" autoComplete="address-level1" value={value.region} onChange={set("region")} {...a11y("region")}>
          <option value="">Choose a region</option>
          {options.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {err("region")}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-postalCode`} className="field-label">
          GhanaPost GPS or postal code <span className="font-normal text-text-muted">(optional)</span>
        </label>
        <input className="input" autoComplete="postal-code" placeholder="e.g. GA-123-4567" value={value.postalCode} onChange={set("postalCode")} {...a11y("postalCode")} />
      </div>
    </div>
  );
}
