// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from "react";
// import { FaCheckCircle } from "react-icons/fa";
// import { RxCaretLeft } from "react-icons/rx";
// import AppSelect from "../../shared/AppSelect";
// import {
//   PrepayNowFormProps,
//   momoFormProps,
// } from "../../helpers/interface/interfaces";
// import AppInput from "../../shared/AppInput";
// import AppButton from "../../shared/AppButton";
// import API, { getPaymentMethods, sendPaymentOtp } from "../../endpoint";
// import { toast } from "react-toastify";
// import AppOTP from "../../shared/AppOTP";
// import { setMobilePaymentId, setPaymentNumber } from "../../store/features/userSliceFeature";
// import { useDispatch } from "react-redux";
// import { validatePhoneNumber } from "../../helpers/functions/helperFunctions";

// const paymentOptions = [
//   { productCategoryId: 1, productCategory: "Credit Card" },
//   { productCategoryId: 2, productCategory: "Mobile money" },
// ];

// const PrePayNow = () => {
//   const dispatch = useDispatch();
//   const [payMethod, setPayMethod] = useState<string>("1");
//   const [payNowForm, setPayNowForm] = useState<PrepayNowFormProps>({
//     cardNumber: "",
//     cardName: "",
//     cardExpiryMonth: "",
//     cardExpiryYear: "",
//     cardCVV: "",
//     isOneTimeUseCard: false,
//     paymentMethod: "visa",
//   });

//   const [mobileMethod, setMobileMethod] = useState<[]>([]);
//   const [mobileMethodId, setMobileMethodId] = useState<number>();
//   const [showOtp, setShowOtp] = useState<boolean>(false);

//   const [mobilePay, setMobilePay] = useState<momoFormProps>({
//     phoneNumber: "",
//     paymentMethod: "mtn",
//   });

//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleChange = (event: { id: string; value: string }) => {
//     const { id, value } = event;
//     payMethod === "1"
//       ? setPayNowForm({
//           ...payNowForm,
//           [id]: value,
//         })
//       : setMobilePay({
//           ...mobilePay,
//           [id]: value,
//         });
//   };
//   const handleChangePaymentOptions = (methodId: string) => {
//     const selectedMethod = paymentOptions.find(
//       (option) => option.productCategoryId.toString() === methodId
//     );
//     console.log(selectedMethod);
//     setPayMethod(methodId);
//   };

//   const handleMobileMethodChange = (mobileId: number) => {
//     const selectedMobileMethod = mobileMethod.find(
//       (option) => option?.productCategoryId === mobileId
//     );
//     console.log("mobile method", selectedMobileMethod);
//     setMobileMethodId(mobileId);
//   };

//   const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPayNowForm({
//       ...payNowForm,
//       isOneTimeUseCard: e.target.checked,
//     });
//   };
//   const handleCreditCardPayment = () => {
//     console.log(payNowForm);
//   };
//   const handleMobilePayment = () => {
//     if(validatePhoneNumber(mobilePay.phoneNumber) === false){
//       toast.error("Invalid phone number. Try again", {
//         autoClose: 3000,
//         position: "top-right",
//       });
//       return;
//     }
//     const payload = {
//       customer_contact: mobilePay.phoneNumber,
//     };
//     setIsLoading(true);
//     API.post(`${sendPaymentOtp}`, payload)
//       .then((response) => {
//         if (response.status === 200) {
//           toast.success(response.data?.successResponse?.message, {
//             autoClose: 3000,
//             position: "top-right",
//           });
          
//           dispatch(setMobilePaymentId(mobileMethodId))
//           dispatch(setPaymentNumber(mobilePay.phoneNumber));
//           setIsLoading(false);
//           setShowOtp(true);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//         setIsLoading(false);
//       });
//     console.log(mobilePay);
//   };
//   const handleGetPaymentMethod = () => {
//     const payload = {
//       currency: "GHS",
//     };
//     API.post(`${getPaymentMethods}`, payload)
//       .then((response) => {
//         if (response.status === 200) {
//           console.log(response.data?.data);

//           const modifiedResponse = response.data?.data?.map((option: any) => ({
//             productCategoryId: option.id,
//             productCategory: option.name,
//           }));

//           setMobileMethod(modifiedResponse);
//           if (modifiedResponse.length > 0) {
//             setMobileMethodId(modifiedResponse[0].productCategoryId);
//           }
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   useEffect(() => {
//     handleGetPaymentMethod();
//   }, []);
//   return (
//     <div>
//       <div className="flex items-center justify-between p-2 text-lg font-medium bg-gray-primary-400">
//         <div className="flex items-center">
//           <FaCheckCircle className="text-primary-500" />
//           <p className="pl-4">Pre-pay Now</p>
//         </div>

//         {showOtp ? (
//           <div
//             className="flex items-center mr-4 text-sm cursor-pointer text-primary-500"
//             onClick={() => setShowOtp(false)}
//           >
//             <RxCaretLeft /> <p className="">Edit number</p>
//           </div>
//         ) : (
//           ""
//         )}
//       </div>

//       {showOtp ? (
//         <AppOTP />
//       ) : (
//         <div className="px-5 py-3 bg-base-gray-200">
//           <p className="mb-3">Select payment method</p>
//           <div className="flex gap-8">
//             <div className="w-[50%]">
//               <AppSelect
//                 onChange={handleChangePaymentOptions}
//                 defaultValue=""
//                 name="paymentMethod"
//                 options={paymentOptions}
//                 className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
//               />
//             </div>
//             {payMethod === "2" ? (
//               <div className="w-[50%]">
//                 <AppSelect
//                   onChange={handleMobileMethodChange}
//                   defaultValue=""
//                   name="mobileMethod"
//                   options={mobileMethod}
//                   className="outline-none w-full rounded-md bg-gray-primary-400 h-[36px] pl-4"
//                 />
//               </div>
//             ) : (
//               ""
//             )}
//           </div>
//           {payMethod === "1" ? (
//             <div className="creditCard">
//               <div>
//                 <AppInput
//                   id="cardNumber"
//                   type="text"
//                   value={payNowForm.cardNumber}
//                   onChange={handleChange}
//                   placeholder="Card Number"
//                   className="outline-none w-full rounded-md bg-white h-[36px] pl-4 mt-4"
//                 />
//               </div>
//               <div className="flex w-[50%] gap-2">
//                 <AppInput
//                   id="cardExpiryMonth"
//                   type="text"
//                   value={payNowForm.cardExpiryMonth}
//                   onChange={handleChange}
//                   placeholder="Month"
//                   className="outline-none w-full rounded-md bg-white-primary-400 h-[36px] pl-4 mt-4"
//                 />
//                 <AppInput
//                   id="cardExpiryYear"
//                   type="text"
//                   value={payNowForm.cardExpiryYear}
//                   onChange={handleChange}
//                   placeholder="Year"
//                   className="outline-none w-full rounded-md bg-white-primary-400 h-[36px] pl-4 mt-4"
//                 />
//                 <AppInput
//                   id="cardCVV"
//                   type="text"
//                   value={payNowForm.cardCVV}
//                   onChange={handleChange}
//                   placeholder="CVV"
//                   className="outline-none w-full rounded-md bg-white-primary-400 h-[36px] pl-4 mt-4"
//                 />
//               </div>
//               <div>
//                 <AppInput
//                   id="cardName"
//                   type="text"
//                   value={payNowForm.cardName}
//                   onChange={handleChange}
//                   placeholder="Name on card"
//                   className="outline-none w-full rounded-md bg-white-primary-400 h-[36px] pl-4 mt-4"
//                 />
//               </div>
//               <div className="flex items-center justify-between gap-4 mt-4 mb-3">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     value={payNowForm.isOneTimeUseCard.toString()}
//                     onClick={() => handleCheckboxChange(event)}
//                     className="h-[14px] w-[14px] cursor-pointer !bg-transparent "
//                   />
//                   <p className="text-sm text-gray-tertiary-600">
//                     I am using a debit card one time use card
//                   </p>
//                 </div>
//                 <div className="">
//                   <AppButton
//                     clickHandler={handleCreditCardPayment}
//                     title="Save"
//                     className="px-8 py-1 text-white uppercase rounded-md bg-primary-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <AppInput
//                 id="phoneNumber"
//                 type="text"
//                 value={mobilePay.phoneNumber}
//                 onChange={handleChange}
//                 placeholder="Phone number"
//                 className="outline-none w-full rounded-md bg-white h-[36px] pl-4 mt-4"
//               />
//               <div className="flex justify-end">
//                 <AppButton
//                   title="Save"
//                   loading={isLoading}
//                   clickHandler={handleMobilePayment}
//                   className="px-8 py-1 mt-4 text-white uppercase rounded-md bg-primary-500"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PrePayNow;
