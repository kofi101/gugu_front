/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import Complete from "../../assets/svg/Complete";

const CheckoutComplete = () => {
  const orderId = useSelector((store: any) => store?.user);
  const flex = "flex items-center justify-center";
  return (
    <div className={`${flex} w-2/3 mx-auto h-[510px]`}>
      <div className={`${flex} flex-col my-20 gap-4`}>
        <p className="font-bold text-[36px]">Confirmation</p>

        <Complete />

        <p className="font-bold text-[24px]">Check Out Complete</p>
        <p>We have sent you email with your order details</p>
        <p className="text-[24px]">Order No. {orderId?.orderId}</p>
      </div>
    </div>
  );
};

export default CheckoutComplete;
