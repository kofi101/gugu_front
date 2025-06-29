/* eslint-disable @typescript-eslint/no-explicit-any */
import { MdOutlineEdit } from "react-icons/md";
import AppButton from "../../shared/AppButton";
import { useEffect, useState } from "react";
import AppInput from "../../shared/AppInput";
import AppRadioButton from "../../shared/AppRadioButton";
import API, {
  getRegionCities,
  getRegions,
  getUserDetails,
  udateAddressBook,
  updatePersonalInfo,
  uploadFile,
} from "../../endpoint";
import AppRegionSelect from "../../shared/AppRegionSelect";
import { useSelector } from "react-redux";
import { loggedInUser } from "../../helpers/type/types";
import { formatDate } from "../../helpers/functions/helperFunctions";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

type PartialUser = Partial<loggedInUser> & { userImage?: string };

const MyAccount = () => {
  const [file, setFile] = useState<Blob>();
  const [fileUrl, setFileUrl] = useState<string>("");
  const [regions, setRegions] = useState<
    { regionId: number; regionName: string }[]
  >([]);
  const [cities, setCities] = useState<
    { regionId: number; regionName: string; cityId: number }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<PartialUser>();

  const [addressBook, setAddressBook] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dob: "",
    gender: "",
    digitalAddress: "",
    regionId: 0,
    cityId: 0,
    shipping_BillingAddress: "",
  });

  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  // const [isAddress, setIsAddress] = useState("");
  // const [isDigitalAddress, setIsDigitalAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const user = useSelector((store: any) => store?.user?.currentUser);

  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setAddressBook((prev) => ({ ...prev, [id]: value }));
  };

  const handleUploadFile = (e: any) => {
    const selectedProfileImage = e.target.files[0];
    setFile(selectedProfileImage);
    // setFileUrl(URL.createObjectURL(e.target.files[0]));

    const formData = new FormData();
    formData.append("files", selectedProfileImage);

    API.post(`${uploadFile}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        if (response.status === 200) {
          setFileUrl(response.data.path);
          setCurrentUser({ ...currentUser, userImage: response.data.path });
          console.log(file);

          toast.success("Profile picture updated successfully", {
            autoClose: 2000,
            position: "top-right",
          });
        } else {
          toast.error("Error uploading file", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error uploading file", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  

  useEffect(() => {
    const fetchInitData = async () => {
      setIsDetailsLoading(true);
      try {
        const [{ data: regionData }, { data: userData }] = await Promise.all([
          API.get(getRegions),
          API.get(`${getUserDetails}${user?.uid}`),
        ]);

        setRegions(regionData);
        setCurrentUser(userData);
        setAddressBook({
          ...addressBook,
          fullName: userData?.fullName,
          email: userData?.email,
          phoneNumber: userData?.phoneNumber,
          address: userData?.address || "",
          digitalAddress: userData?.digitalAddress || "",
          regionId: 0,
          cityId: 0,
          dob: formatDate(userData.dateofBirth),
          gender: userData?.gender || "",
          shipping_BillingAddress: userData?.shipping_BillingAddress || "",
        });
        setDob(formatDate(userData?.dateofBirth));
        setGender(userData?.gender || "");

        const region = regionData.find((r: any) => r.regionName === userData?.region);
        if (region) {
          handleSelectRegion(region.regionId);
          setAddressBook((prev) => ({ ...prev, regionId: region.regionId }));
        }
      } catch (error) {
        toast.error("Error loading user details", { autoClose: 2000 });
      } finally {
        setIsDetailsLoading(false);
      }
    };

    fetchInitData();
  }, []);
  useEffect(() => {
    if (regions.length > 0) {
      setIsDetailsLoading(false);
    }
  }, [currentUser]);

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
    setAddressBook((prev) => ({ ...prev, regionId }));
    API.get(`${getRegionCities}/${regionId}`)
      .then((response) => {
        setCities(transformCityData(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSelectCity = (cityId: number) => {
    setAddressBook((prev) => ({ ...prev, cityId }));
  };
  const handleGenderSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value);
  };
  const handleSavePersonalInfo = () => {
    setIsLoading(true);
    const payload = {
      id: user?.uid,
      registrationDate: new Date(),
      fullName: addressBook.fullName,
      email: addressBook.email,
      phoneNumber: addressBook.phoneNumber,
      address: currentUser?.address,
      shipping_BillingAddress: currentUser?.shipping_BillingAddress,
      dateofBirth: dob,
      gender: gender,
      userImage: fileUrl,
      businessCategoryId: 0,
      businessDocument: "",
      firebaseId: user?.uid,
      modifiedBy: user?.uid,
    };
    API.put(`${updatePersonalInfo}`, payload)
      .then((response) => {
        if (response.status === 200) {
          setIsLoading(false);
          toast.success("Personal information saved successfully", {
            autoClose: 2000,
            position: "top-right",
          });
        } else {
          setIsLoading(false);
          toast.error("Something went wrong. Personal information not saved", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        toast.error("Something went wrong. Personal information not saved", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  const handleSaveAddressBook = () => {
    setIsAddressLoading(true);

    const payload = {
      id: currentUser?.id,
      shipping_BillingAddress: addressBook.shipping_BillingAddress,
      digitalAddress: addressBook.digitalAddress,
      regionId: cities[0]?.regionId,
      cityId: cities[0]?.regionId,
      modifiedBy: user?.uid,
    };

    API.put(`${udateAddressBook}`, payload)
      .then((response) => {
        if (response.status === 200) {
          setIsAddressLoading(false);
          toast.success("Shipping information saved successfully", {
            autoClose: 2000,
            position: "top-right",
          });
        } else {
          setIsAddressLoading(false);
          toast.error("Soemthing went wrong. Shipping information not saved.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        setIsAddressLoading(false);
        toast.error("Soemthing went wrong. Shipping information not saved.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };
  return (
    <div>
      <div className="p-3 font-bold bg-gray-primary-400 h-[52px]">Details</div>
      {isDetailsLoading ? (
        <div className="flex justify-center my-8">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div className="flex gap-4 mt-4 ">
          <div className="w-[50%] border bg-base-gray-200 p-4">
            <div className="flex justify-end">
              <div className="flex items-center p-1 rounded-full cursor-pointer bg-primary-500 w-fit">
                <MdOutlineEdit className=" text-white-primary-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative ml-3">
                <img
                  src={
                    currentUser?.userImage
                      ? currentUser?.userImage
                      : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                  }
                  alt="profile image"
                  className="w-[90px] h-[90px] rounded-full object-cover"
                />
                <label
                  htmlFor="file"
                  className="absolute bottom-0 right-0 flex items-center p-1 rounded-full cursor-pointer justify bg-white-primary-400 w-fit"
                >
                  <MdOutlineEdit className="" />
                </label>
                <input
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleUploadFile}
                ></input>
              </div>
              <div className="px-3 py-2">
                <p className="font-bold text-[12px]">Personal Information</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <div>
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Name
                </label>
                <AppInput
                  id="fullName"
                  onChange={handleChange}
                  type="text"
                  value={addressBook.fullName}
                  className="w-full px-3 py-1 rounded-full outline-none bg-gray-primary-400"
                />
              </div>
              <div>
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Phone
                </label>
                <AppInput
                  id="phoneNumber"
                  onChange={handleChange}
                  type="text"
                  value={addressBook.phoneNumber}
                  className="w-full px-3 py-1 rounded-full outline-none bg-gray-primary-400"
                />
              </div>
              <div>
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Email
                </label>
                <AppInput
                  id="email"
                  onChange={handleChange}
                  type="email"
                  value={addressBook.email}
                  className="w-full px-3 py-1 rounded-full outline-none bg-gray-primary-400"
                />
              </div>
              <div>
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Date of Birth
                </label>
                {/* <AppInput
              id="dob"
                onChange={handleChange}
                type="date"
                value={dob}
                className="w-full px-3 py-1 rounded-full outline-none bg-gray-primary-400"
              /> */}
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  value={dob}
                  onChange={(e: any) => setDob(e.target.value)}
                  className="w-full px-3 py-1 rounded-full outline-none bg-gray-primary-400"
                />
              </div>
              <div>
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Gender
                </label>
                <div className="flex w-[60%]">
                  <AppRadioButton
                    label="Male"
                    name="sex"
                    value="male"
                    id="male"
                    onChange={handleGenderSelection}
                    checked={gender === "male"}
                  />
                  <AppRadioButton
                    label="Female"
                    name="sex"
                    value="female"
                    id="female"
                    onChange={handleGenderSelection}
                    checked={gender === "female"}
                  />
                </div>
              </div>
              <AppButton
                loading={isLoading}
                clickHandler={() => handleSavePersonalInfo()}
                className="w-full p-2 my-2 rounded-md bg-primary-500 text-white-primary-400"
                title="Save"
              />
            </div>
          </div>

          <div className="w-[50%]">
            <div className="py-1 pl-5 font-bold bg-gray-primary-400 h-[33px] text-[12px] flex items-center">
              Address Book
            </div>
            <div className="px-3 pt-2 pb-4 bg-base-gray-200">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[12px]">
                  Your default shipping address:
                </p>
                <div className="flex items-center p-1 rounded-full cursor-pointer justify bg-primary-500 ">
                  <MdOutlineEdit className=" text-white-primary-400" />
                </div>
              </div>
              <div className="my-3">
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Address
                </label>
                <AppInput
                  id="shipping_BillingAddress"
                  onChange={handleChange}
                  type="text"
                  value={addressBook.shipping_BillingAddress}
                  className="w-full px-3 py-1 rounded-full outline-none bg-gray-primary-400 "
                />
              </div>
              <div className="my-3">
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Digital Address
                </label>
                <AppInput
                  id="digitalAddress"
                  onChange={handleChange}
                  type="text"
                  value={addressBook.digitalAddress}
                  className="w-full px-3 py-1 rounded-full outline-none bg-gray-primary-400"
                />
              </div>
              <div className="my-3">
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  Region
                </label>
                <AppRegionSelect
                  onChange={(value: number) => handleSelectRegion(value)}
                  defaultValue="Greater Accra"
                  name=""
                  value={addressBook.regionId}
                  options={regions}
                  className="outline-none w-full rounded-full bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>
              <div className="my-3">
                <label className="px-3 text-[12px] font-bold" htmlFor="">
                  City/Town
                </label>
                <AppRegionSelect
                  onChange={handleSelectCity}
                  value={addressBook.cityId}
                  defaultValue=""
                  name=""
                  options={cities}
                  className="outline-none w-full rounded-full bg-gray-primary-400 h-[36px] pl-4"
                />
              </div>

              <div className="mt-6 text-center">
                <AppButton
                  clickHandler={() => handleSaveAddressBook()}
                  loading={isAddressLoading}
                  title="Save"
                  className="w-[95%] bg-primary-500 text-white-primary-400 p-2 rounded-md border text-[20px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
