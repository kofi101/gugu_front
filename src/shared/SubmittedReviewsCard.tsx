import { RxCaretRight } from "react-icons/rx";
import Rating from "@mui/material/Rating";
import { formatDate, formatMoney } from "../helpers/functions/helperFunctions";
import { productReviewProps } from "../helpers/interface/interfaces";
import { useNavigate } from "react-router-dom";
import { routerPath } from "../routes/Router";
import { useDispatch } from "react-redux";
import { setReviewId } from "../store/features/userSliceFeature";

const SubmittedReviewsCard: React.FC<productReviewProps> = ({
  reviewId,
  reviewStatus,
  productName,
  shortReview,
  reviewDetails,
  numberOfStars,
  submittedDate,
  salesPrice,
  productImage,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleEditReview = (reviewId: number) => {
    console.log("Add review", reviewId);
    dispatch(setReviewId(reviewId));
    navigate(routerPath.EDITPRODUCTREVIEW);
  };

  return (
    <div className="flex flex-col border-b-2 bg-base-gray-200">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <div className="w-[150px] h-[150px]">
            <img
              src={productImage}
              alt={productName}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="mt-2">
            <p className="font-bold">{productName}</p>
            <p>{formatMoney(salesPrice!)}</p>
            <p className="mt-2 font-bold">Submitted on</p>
            <p>{formatDate(submittedDate)}</p>
            <div className="flex items-center gap-4 mt-2">
              <p className="font-bold">Product rating</p>
              <Rating
                className="!text-[30px] !text-primary-500"
                name="read-only"
                value={numberOfStars}
                readOnly
              />
            </div>
          </div>
        </div>
        {reviewStatus.toLowerCase() === "submitted" ? (
          ""
        ) : (
          <div
            onClick={() => handleEditReview(reviewId!)}
            className="flex items-center font-bold cursor-pointer text-primary-500 h-[20px] mt-2 mr-2"
          >
            <p>Edit review</p>
            <RxCaretRight className="mt-1 font-bold text-primary-500" />
          </div>
        )}
      </div>
      <div className="px-4 py-5">
        <p className="font-bold">{shortReview}</p>
        <p>{reviewDetails}</p>
      </div>
    </div>
  );
};

export default SubmittedReviewsCard;
