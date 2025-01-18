// import React from "react";
// import AppRadioButton from "../../shared/AppRadioButton";
// import AppButton from "../../shared/AppButton";
// import { CheckoutProcessProps } from "../../helpers/interface/interfaces";
// import { FaCheckCircle } from "react-icons/fa";
// import { RxCaretLeft } from "react-icons/rx";

// const PaymentMethods: React.FC<CheckoutProcessProps> = ({
//   onComplete,
//   isOpen,
//   formComplete,
//   editPayment,
//   onRadioChange,
// }) => {
//   const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     onComplete();
//   };
//   return (
//     <div>
//       <div className="flex items-center justify-between p-2 text-lg font-medium bg-gray-primary-400">
//         <div className="flex items-center">
//           {!isOpen && formComplete ? (
//             <FaCheckCircle className="text-primary-500" />
//           ) : (
//             ""
//           )}
//           <p className="pl-4">Payment Methods</p>
//         </div>
//         {!isOpen && formComplete ? (
//           <div
//             onClick={editPayment}
//             className="flex items-center mr-4 text-sm cursor-pointer text-primary-500"
//           >
//             <RxCaretLeft /> <p className="">Edit</p>
//           </div>
//         ) : (
//           ""
//         )}
//       </div>
//       {isOpen && (
//         <div className="px-5 py-3 bg-base-gray-200">
//           <p className="mb-3 font-bold">
//             Payment on delivery{" "}
//             <span className="text-red-primary-500">(currently unavailable)</span>
//           </p>
//           <form onSubmit={handleFormSubmit}>
//             <div className="flex flex-col gap-4 mb-3">
//               <AppRadioButton
//                 label="Cash on delivery"
//                 name="payment"
//                 id="cashondelivery"
//                 value="cashondelivery"
//                 onChange={onRadioChange}
//                 disabled={true}
//               />

//             <AppRadioButton
//                 label=" Mobile Money on delivery"
//                 name="payment"
//                 id="mobilemoneyondelivery"
//                 value="mobilemoneyondelivery"
//                 onChange={onRadioChange}
//                 disabled={true}
//               />

            

//               <AppRadioButton
//                 label=" Pre-Pay Now"
//                 name="payment"
//                 id="prepaynow"
//                 value="prepaynow"
//                 onChange={onRadioChange}
//               />
//             </div>
//             <div className="flex justify-end">
//               <AppButton
//                 title="Save"
//                 clickHandler={() => handleFormSubmit}
//                 className="px-8 py-1 text-white uppercase rounded-md bg-primary-500"
//               />
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentMethods;
