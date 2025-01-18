/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AppButton from "../../shared/AppButton";
import AppRegionSelect from "../../shared/AppRegionSelect";
import API, { getRegionCities, getRegions } from "../../endpoint";
import AppRadioButton from "../../shared/AppRadioButton";

const DeliveryOption = ({
    onCancel,
    }: {
    onCancel: () => void;
}) => {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState<{ regionId: number; regionName: string; cityId: number }[]>([]);

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
    API.get(`${getRegionCities}/${regionId}`)
      .then((response) => {
        console.log(response.data);
        setCities(transformCityData(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onRadioChange = (event: any) => {
    console.log("radio changed", event);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 h-[100dvh] bg-black-primary-400">
      <div className="bg-white border w-[50%] h-[478px] rounded-md py-4 px-6">
        <p className="flex items-center justify-center mb-8 font-medium">
          Select a station near you
        </p>
        <div className="flex gap-4 mb-3">
          <div className="w-[50%]">
            <AppRegionSelect
              onChange={(value: number) => handleSelectRegion(value)}
              defaultValue="Greater Accra"
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
        <div className="grid grid-cols-1 gap-4 h-[65%] overflow-y-scroll custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <AppRadioButton
              label="Pick-Up station 1"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation1"
              value="pickupstation1"
              type="deliverystation"
              onChange={onRadioChange}
            />
            <AppRadioButton
              label="Pick-Up station 2"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation2"
              value="pickupstation2"
              type="deliverystation"
              onChange={onRadioChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppRadioButton
              label="Pick-Up station 1"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation1"
              value="pickupstation1"
              type="deliverystation"
              onChange={onRadioChange}
            />
            <AppRadioButton
              label="Pick-Up station 2"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation2"
              value="pickupstation2"
              type="deliverystation"
              onChange={onRadioChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppRadioButton
              label="Pick-Up station 1"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation1"
              value="pickupstation1"
              type="deliverystation"
              onChange={onRadioChange}
            />
            <AppRadioButton
              label="Pick-Up station 2"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation2"
              value="pickupstation2"
              type="deliverystation"
              onChange={onRadioChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppRadioButton
              label="Pick-Up station 1"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation1"
              value="pickupstation1"
              type="deliverystation"
              onChange={onRadioChange}
            />
            <AppRadioButton
              label="Pick-Up station 2"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation2"
              value="pickupstation2"
              type="deliverystation"
              onChange={onRadioChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppRadioButton
              label="Pick-Up station 1"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation1"
              value="pickupstation1"
              type="deliverystation"
              onChange={onRadioChange}
            />
            <AppRadioButton
              label="Pick-Up station 2"
              description="Station address and location details. Station contact information"
              name="deliveryregion"
              id="pickupstation2"
              value="pickupstation2"
              type="deliverystation"
              onChange={onRadioChange}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <AppButton
            title="Cancel"
            clickHandler={() => onCancel()}
            className="px-8 py-1 text-white uppercase rounded-md bg-blue-primary-400"
          />
          <AppButton
            title="Save"
            clickHandler={() => {}}
            className="px-8 py-1 text-white uppercase rounded-md bg-primary-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryOption;
