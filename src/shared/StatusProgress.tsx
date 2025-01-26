// import React from "react";

// interface OrderProgressBarProps {
//   currentStep: number;
// }

// const StatusProgress: React.FC<OrderProgressBarProps> = ({ currentStep }) => {
//   const steps = [
//     "Order placed",
//     "Confirmed",
//     "Shipped",
//     "Out for delivery",
//     "Delivered",
//   ];
//   return (
//     <div className="flex justify-between mt-2">
//       {steps.map((step, index) => (
//         <div
//           key={index}
//           className={`relative flex-1 ${
//             index === steps.length - 1 ? "flex items-end" : ""
//           }`}
//         >
//           {index < steps.length && (
//             <div
//               className={`w-full h-2 ${
//                 index <= currentStep ? "bg-primary-400" : "bg-gray-300"
//               }`}
//             ></div>
//           )}
//           <div
//             className={` w-fit px-2  rounded-md  text-center absolute top-[-6px] ${
//               index <= currentStep
//                 ? "border-primary-600 bg-primary-400"
//                 : "border-gray-300 bg-gray-300"
//             }`}
//           >
//             <p
//               className={` text-[13px] ${
//                 index <= currentStep
//                   ? "text-white-primary-400"
//                   : "text-black-primary-400"
//               }`}
//             >
//               {step}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StatusProgress;

import React from "react";

interface OrderProgressBarProps {
  currentStep: number;
}

const StatusProgress: React.FC<OrderProgressBarProps> = ({ currentStep }) => {
  const steps = [
    "Order placed",
    "Confirmed",
    "Shipped",
    "Out for delivery",
    "Delivered",
  ];

  return (
    <div className="flex justify-between mt-2">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`relative flex-1 ${
            index === steps.length - 1 && currentStep === index
              ? "flex justify-end"
              : ""
          }`}
        >
          {index < steps.length - 1 && (
            <div
              className={`w-full h-2 ${
                index < currentStep ? "bg-primary-400" : "bg-gray-300"
              }`}
            ></div>
          )}
          <div
            className={`w-fit px-2 rounded-md text-center absolute top-[-6px] ${
              index <= currentStep
                ? "border-primary-600 bg-primary-400"
                : "border-gray-300 bg-gray-300"
            }`}
            style={{
              right: index === steps.length - 1 && currentStep === index ? 0 : "",
            }}
          >
            <p
              className={`text-[13px] ${
                index <= currentStep
                  ? "text-white-primary-400"
                  : "text-black-primary-400"
              }`}
            >
              {step}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusProgress;



// import React from "react";

// interface OrderProgressBarProps {
//   currentStep: number;
// }

// const StatusProgress: React.FC<OrderProgressBarProps> = ({ currentStep }) => {
//   const steps = [
//     "Order placed",
//     "Pending",
//     "Confirmed",
//     "Shipped",
//     "Out for delivery",
//     "Delivered",
//   ];

//   return (
//     <div className="flex items-center justify-between mt-2">
//       {steps.map((step, index) => (
//         <div
//           key={index}
//           className={`relative flex-1 ${
//             index === steps.length - 1 ? "flex items-end" : ""
//           }`}
//         >
//           {index < steps.length - 1 && (
//             <div
//               className={`w-full h-2 ${
//                 index <= currentStep ? "bg-primary-400" : "bg-gray-300"
//               }`}
//             ></div>
//           )}
//           {index === steps.length - 1 && currentStep >= index && (
//             <div className="w-full h-2 bg-primary-400"></div>
//           )}
//           <div
//             className={`absolute ${
//               index === steps.length - 1 ? "right-0" : "top-[-6px]"
//             } px-2 rounded-md text-center ${
//               index <= currentStep
//                 ? "border-primary-600 bg-primary-400"
//                 : "border-gray-300 bg-gray-300"
//             }`}
//           >
//             <p
//               className={`text-[13px] ${
//                 index <= currentStep
//                   ? "text-white-primary-400"
//                   : "text-black-primary-400"
//               }`}
//             >
//               {step}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StatusProgress;

