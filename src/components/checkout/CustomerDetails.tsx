/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Customer,
  CheckoutProcessProps,
} from "../../helpers/interface/interfaces";
import AppInput from "../../shared/AppInput";
import AppButton from "../../shared/AppButton";
import { FaCheckCircle } from "react-icons/fa";
import { RxCaretLeft } from "react-icons/rx";
import AppRegionSelect from "../../shared/AppRegionSelect";
import API, {
  checkoutCustomerDetails,
  getRegionCities,
  getRegions,
} from "../../endpoint";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const CustomerDetails: React.FC<CheckoutProcessProps> = ({
  onComplete,
  isOpen,
  formComplete,
  editPayment,
}) => {
  //   const [isOpen, setIsOpen] = useState(true);
  const [details, setDetails] = useState<Customer>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    secondaryNumber: "",
    digitalAddress: "",
    region: "",
    city: "",
  });
  const user = useSelector((store: any) => store?.user);

  const [isLoading, setIsLoading] = useState(false);

  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState<
    { regionId: number; regionName: string; cityId: number }[]
  >([]);
  const [isChecked, setIsChecked] = useState(false);

  const handleUseCurrentAddress = () => {
    setIsChecked(!isChecked);
  };

  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setDetails((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  useEffect(() => {
    API.get(`${getRegions}`)
      .then((response) => {
        setRegions(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const transformCityData = (
    data: { regionId: number; cityId: number; cityName: string }[]
  ): { regionId: number; regionName: string; cityId: number }[] => {
    return data?.map((city) => ({
      regionId: city.regionId,
      regionName: city.cityName,
      cityId: city.cityId,
    }));
  };
  const handleSelectRegion = (regionId: number) => {
    API.get(`${getRegionCities}/${regionId}`)
      .then((response) => {
        setCities(transformCityData(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (cities.length > 0) {
      console.log("Updated cities:", cities);
    }
  }, [cities]);

  const handleSaveCustomerDetails = () => {
    setIsLoading(true);
    const payload = {
      fullName: `${details.firstName} ${details.lastName}`,
      phoneNumber: details.phoneNumber,
      secondaryNumber: details.secondaryNumber,
      address: details.address,
      digitalAddress: details.digitalAddress,
      regionId: cities[0]?.regionId,
      cityId: cities[0]?.cityId,
      checkOutOrderNumber: user.orderId,
      useCurrentAddress: isChecked ? 1 : 0,
    };

    if (
      (!isChecked && !payload.fullName) ||
      (!isChecked && !payload.phoneNumber) ||
      (!isChecked && !payload.address) ||
      (!isChecked && !payload.regionId) ||
      (!isChecked && !payload.cityId)
    ) {
      setIsLoading(false);
      toast.error("Please fill in all fields", {
        autoClose: 2000,
        position: "top-right",
      });
      return;
    } else {
      API.post(`${checkoutCustomerDetails}`, payload)
        .then((response) => {
          if (response.status === 200) {
            setIsLoading(false);
            toast.success("Addressed Saved", {
              autoClose: 2000,
              position: "top-right",
            });
            onComplete();
          } else {
            toast.error("Something went wrong.", {
              autoClose: 2000,
              position: "top-right",
            });
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
          toast.error("Something went wrong.", {
            autoClose: 2000,
            position: "top-right",
          });
        });
    }
  };

  // const handleUseMyAddress = () => {
  //   setIsLoading(true);
  //   API.get(`${useCurrentAddress}/${user?.currentUser?.uid}`)
  //     .then((response) => {
  //       if (response.status === 200) {
  //         setIsLoading(false);
  //         toast.success("User address used", {
  //           autoClose: 2000,
  //           position: "top-right",
  //         });
  //         onComplete();
  //       } else {
  //         setIsLoading(false);
  //         toast.error("Something went wrong. Try again", {
  //           autoClose: 2000,
  //           position: "top-right",
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       setIsLoading(false);
  //       toast.error("Something went wrong. Try again", {
  //         autoClose: 2000,
  //         position: "top-right",
  //       });
  //     });
  // };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSaveCustomerDetails();
  };

  return (
    <div>
      <div className="flex items-center justify-between p-2 text-lg font-medium bg-gray-primary-400">
        <div className="flex items-center">
          {!isOpen && formComplete ? (
            <FaCheckCircle className="text-primary-500" />
          ) : (
            ""
          )}
          <p className="pl-4">Send to</p>
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
          <div className="flex items-center mb-6">
            <div>
              <input
                type="checkbox"
                name="useCurrentAddress"
                id="useCurrentAddress"
                className="hidden"
                onChange={handleUseCurrentAddress}
              />
              <label htmlFor="useCurrentAddress" className="">
                <span
                  className={`inline-block w-4 h-4 mr-2 border border-gray-300 shadow-inner cursor-pointer ${
                    isChecked ? "bg-primary-500" : "bg-white"
                  }`}
                ></span>
              </label>
            </div>
            <p className=""> Use my current address</p>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="flex gap-4 mb-3">
              <div className="w-[50%]">
                <AppInput
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={details.firstName}
                  onChange={handleChange}
                  disabled={isChecked}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
              <div className="w-[50%]">
                <AppInput
                  id="lastName"
                  type="text"
                  value={details.lastName}
                  onChange={handleChange}
                  disabled={isChecked}
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
                  disabled={isChecked}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
              <div className="w-[50%]">
                <AppInput
                  id="secondaryNumber"
                  type="text"
                  value={details.secondaryNumber || ""}
                  onChange={handleChange}
                  disabled={isChecked}
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
                  placeholder="Enter Address"
                  disabled={isChecked}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-full">
                <AppInput
                  id="digitalAddress"
                  type="text"
                  placeholder="Digital Address"
                  value={details.digitalAddress || ""}
                  onChange={handleChange}
                  disabled={isChecked}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-[50%]">
                <AppRegionSelect
                  onChange={(value: number) => handleSelectRegion(value)}
                  defaultValue="Greater Accra"
                  name=""
                  options={regions}
                  disabled={isChecked}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
              <div className="w-[50%]">
                <AppRegionSelect
                  onChange={() => {}}
                  defaultValue=""
                  name=""
                  options={cities}
                  disabled={isChecked}
                  className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mb-3">
              {/* <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-[14px] w-[14px] cursor-pointer !bg-transparent "
                />
                <p className="text-sm text-gray-tertiary-600">
                  My shipping address is the same as my billing address
                </p>
              </div> */}
              <div className="flex ">
                <AppButton
                  loading={isLoading}
                  clickHandler={() => handleFormSubmit}
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

export default CustomerDetails;
