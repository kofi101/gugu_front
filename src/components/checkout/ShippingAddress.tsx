import React, { useEffect, useState } from "react";
import {Customer, CheckoutProcessProps} from "../../helpers/interface/interfaces";
import AppInput from "../../shared/AppInput";

import AppButton from "../../shared/AppButton";
import { FaCheckCircle } from "react-icons/fa";
import { RxCaretLeft } from "react-icons/rx";

import API, { getRegionCities, getRegions } from "../../endpoint";
import AppRegionSelect from "../../shared/AppRegionSelect";



const ShippingAddress: React.FC<CheckoutProcessProps> = ({
  onComplete,
  isOpen,
  formComplete,
  editPayment
}) => {
  const [details, setDetails] = useState<Customer>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    digitalAddress: "",
    region: "",
    city: "",
  });
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState<{ regionId: number; regionName: string; cityId: number }[]>([]);
  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setDetails((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    onComplete();
  };

  useEffect(() => {
    API.get(`${getRegions}`)
      .then((response) => {
        console.log(response.data);
        setRegions(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const transformCityData = (
    data: { regionId: number; cityId: number; cityName: string }[]
  ): { regionId: number; regionName: string; cityId: number }[] => {
    return data.map((city) => ({
      regionId: city.regionId,
      regionName: city.cityName,
      cityId: city.cityId,
    }));
  };
  const handleSelectRegion = (regionId: number) => {
    // console.log("region selected", regionId);
    API.get(`${getRegionCities}/${regionId}`)
      .then((response) => {
        console.log(response.data);
        setCities(transformCityData(response.data));
        // console.log("cities", cities);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div>
      <div className="flex items-center justify-between p-2 text-lg font-medium bg-gray-primary-400">
        <div className="flex items-center">
          {!isOpen && formComplete ? <FaCheckCircle className="text-primary-500" /> : ""}
          <p className="pl-4">Shipping Address</p>
        </div>
        {!isOpen && formComplete ? (
          <div
            onClick={editPayment}
            className="flex items-center mr-4 text-sm cursor-pointer text-primary-500"
          >
            <RxCaretLeft /> <p className="">Edit</p>
          </div>
        ) : (
          ""
        )}
      </div>
      {isOpen && (
        <div className="px-5 py-3 bg-base-gray-200">
          <p className="mb-3">Shipping Details</p>
          <form onSubmit={handleFormSubmit}>
            <div className="flex gap-4 mb-3">
              <div className="w-[50%]">
                <AppInput
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={details.firstName}
                  onChange={handleChange}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
              <div className="w-[50%]">
                <AppInput
                  id="lastName"
                  type="text"
                  value={details.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-[50%]">
                <AppInput
                  id="phoneNumber"
                  type="text"
                  placeholder="Phone Number"
                  value={details.phoneNumber}
                  onChange={handleChange}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
              <div className="w-[50%]">
                <AppInput
                  id="secondaryNumber"
                  type="text"
                  value={details.secondaryNumber || ""}
                  onChange={handleChange}
                  placeholder="Secondary Number"
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-full">
                <AppInput
                  id="address"
                  type="text"
                  value={details.address}
                  onChange={handleChange}
                  placeholder="Enter Your Address"
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-full">
                <AppInput
                  id="secondaryAddress"
                  type="text"
                  placeholder="Secondary Address"
                  value={details.digitalAddress || ""}
                  onChange={handleChange}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-[50%]">
                <AppRegionSelect
                  onChange={(value: number) => handleSelectRegion(value)}
                  defaultValue=""
                  name=""
                  options={regions}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
              <div className="w-[50%]">
                <AppRegionSelect
                  onChange={() => {}}
                  defaultValue=""
                  name=""
                  options={cities}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 mb-3">
              <div className="">
                <AppButton
                  clickHandler={()=>handleFormSubmit}
                  title="Save"
                  className="px-8 py-1 text-white uppercase rounded-md bg-primary-500"
                />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ShippingAddress;
