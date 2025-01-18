/* eslint-disable @typescript-eslint/no-explicit-any */
import SubmittedReviewsCard from "../../shared/SubmittedReviewsCard";
import API, { getCustomerSubmittedReviews } from "../../endpoint";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { productReviewProps } from "../../helpers/interface/interfaces";
const ReviewSubmitted = () => {
  const user = useSelector((store: any) => store?.user);
  const [loading, setLoading] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState<
    productReviewProps[]
  >([]);

  const handleSubmittedReviews = () => {
    setLoading(true);
    API.get(`${getCustomerSubmittedReviews}/${user?.currentUser?.uid}`)
      .then((response) => {
        if (response.status === 200) {
          setSubmittedReviews(response.data);
          setLoading(false);
        }
      })
      .catch();
  };

  useEffect(() => {
    handleSubmittedReviews();
  }, []);
  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center my-8 h-[343px]">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div>
          {submittedReviews.length > 0 ? (
            submittedReviews.map((review) => {
              return <SubmittedReviewsCard key={review.reviewId} {...review} />;
            })
          ) : (
            <div className="flex justify-center items-center my-8 h-[343px]">
              <p className="font-bold">No pending reviews</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSubmitted;
