/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxCaretRight } from "react-icons/rx";
import { formatDate, formatMoney } from "../helpers/functions/helperFunctions";
import AppInput from "./AppInput";
import { boldFont } from "../helpers/functions/constants";
// import { ordersList } from "../helpers/functions/constants";
import { useSelector } from "react-redux";

import { useEffect, useState } from "react";
import API, { paidOrders, searchOrders } from "../endpoint";
import { CircularProgress } from "@mui/material";
import { customerOrder } from "../helpers/interface/interfaces";
import { toast } from "react-toastify";
const OrderCard = ({
  onDetailsClick,
}: {
  onDetailsClick: (orderId: number) => void;
}) => {
  const user = useSelector((store: any) => store?.user);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderList, setOrderList] = useState<customerOrder[]>([]);
  const [searchInput, setSearchInput] = useState({
    search: "",
  });

  const getUserOrder = () => {
    setOrderLoading(true);
    API.get(`${paidOrders}/${user?.currentUser?.uid}`)
      .then((response) => {
        if (response.status === 200) {
          setOrderList(response.data);
          setOrderLoading(false);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleSearch = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setSearchInput((prev) => {
      return {
        ...prev,
        [id]: value,
      };
    });

    if (id === "search" && value.trim() === "") {
      getUserOrder();
    }
  };

  const handleSearchOrders = () => {
    if (searchInput.search.trim() === "") {
      getUserOrder();
      return;
    }

    setOrderLoading(true);
    API.get(`${searchOrders}/${user?.currentUser?.uid}/${searchInput.search}`)
      .then((response) => {
        if (response.status === 200) {
          setOrderList(response.data);
          setOrderLoading(false);
        }
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("An error occurred. Try again", {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };
  useEffect(() => {
    getUserOrder();
  }, []);
  return (
    <div>
      <div className="flex items-center p-2 h-[52px] bg-gray-primary-400 ">
        <p className="font-bold w-[20%] pl-2">Orders</p>
        <div className="flex items-center w-[80%]   bg-white-primary-400 rounded-xl">
          <div className="w-full">
            <AppInput
              onChange={handleSearch}
              type="text"
              value={searchInput.search}
              id="search"
              className="w-full px-2 py-1 outline-none rounded-xl"
              placeholder="Search by order number"
            />
          </div>
          <p
            className="px-2 text-sm border-l-2 border-black cursor-pointer w-[12%]"
            onClick={handleSearchOrders}
          >
            Search
          </p>
        </div>
      </div>
      {orderLoading ? (
        <div className="flex justify-center items-center my-8 h-[500px]">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div className="bg-base-gray-200 h-[450px] overflow-y-scroll custom-scrollbar">
          {orderList?.map((order: any) => (
            <div className="flex gap-2" key={order?.checkOutOrderNumber}>
              <div className="flex justify-between w-full py-2 pl-4 border-b h-[142px]">
                <div className="flex flex-col gap-2">
                  <p className={`${boldFont} text-xl`}>
                    Order no. {order?.checkOutOrderNumber}
                  </p>
                  <p className={`${boldFont}`}>
                    {order?.quantity} {order?.quantity === 1 ? "item" : "items"}
                  </p>
                  <p className="text-sm">
                    Order Date : {formatDate(order?.transactionDate)}
                  </p>

                  <p className={`${boldFont}`}>
                    Total: {formatMoney(order?.checkoutTotal)}
                  </p>
                </div>
                <div className="flex flex-col justify-between mr-4">
                  <div
                    className="flex items-center justify-end font-bold cursor-pointer text-primary-500"
                    onClick={() => onDetailsClick(order?.checkOutOrderNumber)}
                  >
                    <p>Details</p>
                    <RxCaretRight className="mt-1 !text-lg !font-bold text-primary-500" />
                  </div>
                  <div
                    className={`px-4 py-1 text-sm text-center rounded-md text-white-primary-400 ${
                      order.checkOutStatus.toLowerCase() === "order placed"
                        ? "bg-shade-orange"
                        : order.checkOutStatus.toLowerCase() === "delivered"
                        ? " bg-primary-500"
                        : "bg-blue-shade"
                    }`}
                  >
                    {order.checkOutStatus}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
