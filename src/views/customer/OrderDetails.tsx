/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxCaretLeft } from "react-icons/rx";
import { boldFont } from "../../helpers/functions/constants";
import {
  formatDate,
  formatMoney,
  subStringLongText,
} from "../../helpers/functions/helperFunctions";
import StatusProgress from "../../shared/StatusProgress";
import { useSelector } from "react-redux";
import API, { paidOrderDetails } from "../../endpoint";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { customerOrderDetails } from "../../helpers/interface/interfaces";
  const OrderDetails = ({ onBackClick }: { onBackClick: () => void }) => {
  const user = useSelector((store: any) => store?.user);

  const [orderDetails, setOrderDetails] = useState<customerOrderDetails>();
  const [detailsLoading, setDetailsLoading] = useState(false);
  const getOrderStep = (
    orderStatus: string,
    
  ): number => {
    switch (orderStatus) {
      case "Order Placed":
        return 0;
      case "Pending":
        return 1;
      case "Confirmed":
        return 2;
      case "Shipped":
        return 3;
      case "Out for delivery":
        return 4;
      case "Delivered":
        return 5;
      default:
        return 0;
    }
  };

  const handleGetOrderDetails = () => {
    setDetailsLoading(true);
    API.get(
      `${paidOrderDetails}/${user?.currentUser?.uid}/${user?.orderDetailsId}`
    )
      .then((response) => {
        if (response.status === 200) {
          setOrderDetails(response?.data);
          setDetailsLoading(false);
        } else {
          setDetailsLoading(false);
          toast.error("Unable to fetch order details.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
        setDetailsLoading(false);
        toast.error("Unable to fetch order details.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    handleGetOrderDetails();
  }, []);
  const currentStep = getOrderStep(
    orderDetails?.orderSummary?.checkOutStatus ?? '',
    
  );
  return (
    <div className="">
      <div className="flex items-center p-3 font-bold bg-gray-primary-400">
        <RxCaretLeft
          className="text-xl font-bold cursor-pointer"
          onClick={onBackClick}
        />
        <p>Order Details</p>
      </div>
      {detailsLoading ? (
        <div className="flex justify-center items-center my-8 h-[500px]">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div className=" h-[500px] overflow-y-scroll custom-scrollbar flex flex-col gap-2">
          <div className="p-4 bg-base-gray-200 h-[250px] ">
            <div className="flex justify-between">
              <div className="flex flex-col gap-2">
                <p className={`${boldFont}`}>
                  Order no. {orderDetails?.orderSummary?.checkOutOrderNumber}
                </p>
                <p className={`${boldFont}`}>
                  {orderDetails?.orderSummary?.quantity}{" "}
                  {orderDetails?.orderSummary?.quantity === 1
                    ? "Item"
                    : "Items"}
                </p>
                <p className="text-sm">
                  Order Date :{" "}
                  {formatDate(
                    orderDetails?.orderSummary?.transactionDate ?? ""
                  )}
                </p>
              </div>
              <div>
                <p className={`${boldFont} !text-2xl`}>
                  Total:{" "}
                  {formatMoney(orderDetails?.orderSummary?.checkoutTotal ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 my-2">
              <p className={`${boldFont} text-sm`}>Status History</p>
              <StatusProgress currentStep={currentStep} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <div className="flex items-center p-3 font-bold bg-gray-primary-400">
                <p>
                  {orderDetails?.orderDetails.length === 1 ? "Item" : "Items"}
                </p>
              </div>
              {orderDetails?.orderDetails?.map((detail) => (
                <div className="flex items-center gap-4 border-b bg-base-gray-200">
                  <div className="bg-white-primary-400 w-[130px] h-[130px]">
                    <img
                      src={detail?.imageOne}
                      alt="orderimage"
                      className="object-cover w-[140px] h-[140px]"
                    />
                  </div>
                  <div>
                    <p className={`${boldFont} text-[18px]`}>
                      {subStringLongText(detail?.productName as string, 20)}
                    </p>
                    <p className={`${boldFont} text-xl`}>
                      {formatMoney(detail?.salesPrice)}
                    </p>
                    <p className="text-sm">Qty: {detail?.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-1/2">
              <div className="flex items-center p-3 !pl-4 font-bold bg-gray-primary-400">
                <p>Payment Information</p>
              </div>
              <div className="flex flex-col gap-4 p-4 border bg-base-gray-200 h-[200px]">

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold">Payment Details</p>
                  <p className="text-sm">
                    Items total:{" "}
                    {formatMoney(orderDetails?.paymentDetails?.itemTotal ?? 0)}
                  </p>
                  <p className="text-sm">
                    Delivery Fees:{" "}
                    {formatMoney(
                      orderDetails?.paymentDetails?.deliveryFees ?? 0
                    )}
                  </p>
                  <p className="text-sm">
                    Total:{" "}
                    {formatMoney(orderDetails?.paymentDetails?.total ?? 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 font-bold bg-gray-primary-400 ">
                <p>Delivery Information</p>
              </div>
              <div className="flex flex-col gap-4 p-4 border bg-base-gray-200 h-[170px]">
                <div className="flex flex-col gap-1">
                  <p className="text-sm">
                    {orderDetails?.deliveryInformation.destination}
                  </p>
                  <p className="text-sm">
                    {orderDetails?.deliveryInformation.address},{" "}
                    {orderDetails?.deliveryInformation.region}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
