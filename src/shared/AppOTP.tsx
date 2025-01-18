/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API, { sendPaymentOtp } from "../endpoint";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setOtpNumber } from "../store/features/userSliceFeature";

const AppOTP = () => {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const { paymentNumber } = useSelector((store: any) => store?.user);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(+value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // dispatch(setOtpNumber(otp.join("")));
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }

    console.log(otp.join(""));
  };

  useEffect(() => {
    dispatch(setOtpNumber(otp.join("")));
  }, [otp, dispatch]);

  const handleMobilePayment = () => {
    const payload = {
      customer_contact: paymentNumber,
    };
    API.post(`${sendPaymentOtp}`, payload)
      .then((response) => {
        if (response.status === 200) {
          toast.success(response.data?.successResponse?.message, {
            autoClose: 3000,
            position: "top-right",
          });

          //   dispatch(setMobilePaymentId(mobileMethodId))
          //   dispatch(setPaymentNumber(mobilePay.phoneNumber));
          //   setIsLoading(false);
          //   setShowOtp(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleResendOtp = () => {
    setTimeLeft(120);
    setOtp(Array(6).fill(""));
    handleMobilePayment();
  };
  return (
    <div className="otp-container bg-base-gray-200">
      <div className="label">Please input OTP</div>
      <div className="w-1/2 otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            className="outline-none otp-input"
          />
        ))}
      </div>
      <div className="info-text">OTP times out in {timeLeft} sec</div>
      <div className="flex justify-end">
        <button
          onClick={handleResendOtp}
          disabled={timeLeft > 0}
          className={`${
            timeLeft > 0
              ? "bg-gray-primary-400 cursor-not-allowed"
              : "bg-primary-500 cursor-pointer"
          } text-white-primary-400 px-8 py-1 mt-4 uppercase rounded-md`}
        >
          Resend
        </button>
      </div>
    </div>
  );
};

export default AppOTP;
