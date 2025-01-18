import { RxCaretRight } from "react-icons/rx";
import { productReviewProps } from "../helpers/interface/interfaces";
import { useNavigate } from "react-router-dom";
import { routerPath } from "../routes/Router";
import { formatDate } from "../helpers/functions/helperFunctions";
import { setDetailsToAddReview } from "../store/features/userSliceFeature";
import { useDispatch } from "react-redux";
const PendingReviewsCard: React.FC<productReviewProps> = ({
  deliveryDate,
  productImage,
  productName,
  productId,
  orderNumber,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAddReview = (productId: number, orderNumber: string) => {
    dispatch(setDetailsToAddReview({ productId, orderNumber }));
    navigate(routerPath.PRODUCTREVIEW);
  };
  return (
    <div className="flex gap-4 border-b bg-base-gray-200">
      <div className="w-[150px] h-[150px]">
        <img
          src={productImage}
          alt={productName}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex justify-between w-[80%] gap-2 pt-2">
        <div className="relative">
          <p className="font-bold">{productName}</p>
          <p className="">
            Order No. <span className="">{orderNumber}</span>
          </p>
          <div className="absolute bottom-2">
            <p className="font-bold">Delivered on</p>
            <p className="">{formatDate(deliveryDate)}</p>
          </div>
        </div>
        <div
          className="flex items-center font-bold text-primary-500 h-[20px] cursor-pointer"
          onClick={() => handleAddReview(productId, orderNumber)}
        >
          <p>Add review</p>
          <RxCaretRight className="mt-1 font-bold text-primary-500" />
        </div>
      </div>
    </div>
  );
};

export default PendingReviewsCard;
