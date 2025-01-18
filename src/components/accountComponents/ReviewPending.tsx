/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import PendingReviewsCard from "../../shared/PendingReviewsCard";
import { useEffect, useState } from "react";
import { productReviewProps } from "../../helpers/interface/interfaces";
import API, { getCustomerPendingReviews } from "../../endpoint";
import { CircularProgress } from "@mui/material";
const ReviewPending = () => {
  const user = useSelector((store: any) => store?.user);
  const [loading, setLoading] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<productReviewProps[]>(
    []
  );

  const handlePendingReviews = () => {
    setLoading(true);
    API.get(`${getCustomerPendingReviews}/${user?.currentUser?.uid}`)
      .then((response) => {
        if (response.status === 200) {
          setPendingReviews(response.data);
          setLoading(false);
        }
      })
      .catch();
  };

  useEffect(() => {
    handlePendingReviews();
  }, []);
  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center my-8 h-[343px]">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div>
          {pendingReviews.length > 0 ? (
            pendingReviews.map((review) => {
              return <PendingReviewsCard key={review.reviewId} {...review} />;
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

export default ReviewPending;
