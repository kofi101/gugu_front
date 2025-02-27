import { FaCaretRight } from "react-icons/fa";
import {formatMoney, subStringLongText} from "../helpers/functions/helperFunctions";
import { linkCardProp } from "../helpers/type/types";

const AppLinkCard:React.FC<linkCardProp> = ({ className, imageUrl, productName, productTitle, price, substringNumber }) => {
  return (
    <div className="relative w-full h-[230px]">
      <div className="">
      <div className="absolute inset-0 bg-black opacity-50"></div>
        <img className="object-cover w-full h-[230px]" src={imageUrl} alt="" />
        <div className={`${className} text-white-primary-400 flex flex-col items-center`}>
          <p className="text-xs uppercase md:text-sm ">{productTitle}</p>
          <p className="mb-2 text-xs uppercase md:text-lg">{subStringLongText(productName, substringNumber)}</p>
          <p className="flex items-center mb-4">
            <FaCaretRight /> <p className="text-xs">See More</p>
          </p>
          <button className="px-2 py-1 font-bold rounded-2xl bg-white-primary-400 text-blue-primary-400">
            {formatMoney(price)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppLinkCard;
