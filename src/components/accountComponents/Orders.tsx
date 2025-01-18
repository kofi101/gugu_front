import { useState } from "react";
import OrderCard from "../../shared/OrderCard";
import OrderDetails from "../../views/customer/OrderDetails";
import { useDispatch } from "react-redux";
import { setOrderDetailsId } from "../../store/features/userSliceFeature";

const Orders = () => {
  const dispatch = useDispatch();
  const [viewDetails, setViewDetails] = useState<number | null>(null);

  const handleDetailsClicked = (orderId: number) => {
    console.log("Order details clicked", orderId);
    dispatch(setOrderDetailsId(orderId));
    setViewDetails(orderId!);
  };

  const handleBackClicked = () => {
    setViewDetails(null);
  };
  return (
    <div>
      {viewDetails === null ? (
        <OrderCard onDetailsClick={handleDetailsClicked} />
      ) : (
        <OrderDetails onBackClick={handleBackClicked} />
      )}
    </div>
  );
};

export default Orders;
