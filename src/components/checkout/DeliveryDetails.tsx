/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  CheckoutProcessProps,
  DeliveryType,
} from "../../helpers/interface/interfaces";
import { FaCheckCircle } from "react-icons/fa";
import { RxCaretLeft } from "react-icons/rx";
import AppButton from "../../shared/AppButton";
import AppRadioButton from "../../shared/AppRadioButton";
import { useSelector } from "react-redux";
import API, {
  deliveryInAccra,
  deliveryOptions,
  deliveryType,
  saveDeliveryAddress,
} from "../../endpoint";
import AppRegionSelect from "../../shared/AppRegionSelect";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setCheckoutDetailsFilled, setDeliveryDestination } from "../../store/features/userSliceFeature";


const DeliveryDetails: React.FC<CheckoutProcessProps> = ({
  onComplete,
  isOpen,
  formComplete,
  editPayment,
 
}) => {
  const dispatch = useDispatch();
  const user = useSelector((store: any) => store?.user);

  const [delivery, setDelivery] = useState<DeliveryType[]>([]);

  const [deliveryOption, setDeliveryOption] = useState<[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getDeliveryTypes = () => {
    API.get(`${deliveryType}`)
      .then((response) => {
        if (response.data) {
          // console.log(response.data);
          setDelivery(response.data);
        } else {
          toast.error("Unable to fecth delivery options.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Unable to fetch delivery options.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  const handleDeliverySelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target);
    const {value, id} = e.target;
    setSelectedDelivery(value);
    setSelectedDeliveryId(id);
  };

  const getWithAccra = () => {
    API.get(`${deliveryInAccra}`)
      .then((response) => {
        if (response.status === 200) {
          // console.log(response.data);
          const modifiedOptions = response.data?.map((option: any) => ({
            regionId: option.destination_id,
            regionName: option.destination_name,
          }))
          setDeliveryOption(modifiedOptions);
        } else {
          toast.error("Unable to fetch delivery destinations.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Unable to fetch delivery destinations.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  const getOutsideAccra = () => {
    API.post(`${deliveryOptions}`)
      .then((response) => {
        if (response.status === 200) {
          const modifiedOptions = response.data?.map((option: any) => ({
            regionId: option.destination_id,
            regionName: option.destination_name,
          }));
          setDeliveryOption(modifiedOptions);
        } else {
          toast.error("Unable to fetch delivery destinations.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Unable to fetch delivery destinations.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    getDeliveryTypes();
  }, []);

  useEffect(() => {
    console.log("selected option for delivery",deliveryOption);
    if (selectedDelivery === "WithinAccra") {
      getWithAccra();
    } else {
      getOutsideAccra();
    }
  }, [selectedDelivery]);
  
  const handleSelection = (el: any) => {
    console.log("selected inside",el);
    setSelectedDestination(el);
  }

  const handleSaveDelivery = () => {
    
    setIsLoading(true);
    const payload = {
      checkOutOrderNumber: user?.orderId,
      deliveryType: selectedDeliveryId,
      destinationId: selectedDestination,
    };

    if(payload.destinationId === undefined || payload.destinationId === ""){
      toast.error("Please select a delivery destination", {
        autoClose: 2000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    } else {
      
      API.post(`${saveDeliveryAddress}`, payload)
        .then((response) => {
          if (response.status === 200) {
            setIsLoading(false);
  console.log("response from delivery",response.data)
            toast.success("Delivery details saved.", {
              autoClose: 2000,
              position: "top-right",
            });
            onComplete();
            dispatch(setDeliveryDestination(response.data))
            dispatch(setCheckoutDetailsFilled(true))
          } else {
            setIsLoading(false);
            toast.error("Unable to save delivery details.", {
              autoClose: 2000,
              position: "top-right",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
          toast.error("Unable to save delivery details.", {
            autoClose: 2000,
            position: "top-right",
          });
        });
    }
  };
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSaveDelivery();
  };
  // const [openOption, setOpenOption] = React.useState<boolean>(false);
  // const handleShowOptions = () => {
  //   setOpenOption(true);
  // };
  // const onCancel = () => {
  //   setOpenOption(false);
  // }
  return (
    <div>
      <div className="flex items-center justify-between p-2 text-lg font-medium bg-gray-primary-400">
        <div className="flex items-center">
          {!isOpen && formComplete ? (
            <FaCheckCircle className="text-primary-500" />
          ) : (
            ""
          )}
          <p className="pl-4">Delivery</p>
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
          <form onSubmit={handleFormSubmit}>
            <div className="flex gap-4">
              {delivery &&
                delivery?.map((item: any) => (
                  <div className="flex flex-col w-[50%] gap-16 mt-4 mb-10">
                    <AppRadioButton
                      label={item.displayName}
                      description=""
                      name="delivery"
                      id={item.id}
                      value={item.name}
                      onChange={handleDeliverySelection}
                      type="delivery"
                      checked={selectedDelivery === item.name}
                    />
                  </div>
                ))}
            </div>
            
            <div className="flex justify-end gap-4 mb-6">
              <AppRegionSelect
                onChange={(value: number) => handleSelection(value)}
                defaultValue=""
                name=""
                options={deliveryOption}
                className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
              />
              <AppButton
                loading={isLoading}
                title="Save"
                clickHandler={() => handleFormSubmit}
                className="px-8 py-1.5 text-white uppercase rounded-md bg-primary-500"
              />
            </div>
          </form>
          {/* {
            openOption && <DeliveryOption onCancel={onCancel} />
          } */}
        </div>
      )}
    </div>
  );
};

export default DeliveryDetails;
