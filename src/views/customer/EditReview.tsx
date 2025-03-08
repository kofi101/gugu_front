/* eslint-disable @typescript-eslint/no-explicit-any */

import "../../styles/AppCustomCss.css";
import { Rating } from "@mui/material";
import { useEffect, useState } from "react";
import AppInput from "../../shared/AppInput";
import AppButton from "../../shared/AppButton";
import AppTextArea from "../../shared/AppTextArea";
import { RxCaretLeft } from "react-icons/rx";
import { routerPath } from "../../routes/Router";
import { useNavigate } from "react-router";
import API, { editProductReview, getEditReviewDetails } from "../../endpoint";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import { formatMoney } from "../../helpers/functions/helperFunctions";

const EditReview = () => {
  const navigate = useNavigate();

  const [ratingValue, setRatingValue] = useState<number | null>(0);
  const [descriptionValue, setDescriptionValue] = useState("");
  const [error, setError] = useState("");
  const [descriptionTitle, setDescriptionTitle] = useState({
    title: "",
  });
  const [loading, setLoading] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);
  const [productReview, setProductReview] = useState<any>();
  const user = useSelector((store: any) => store?.user);

  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setDescriptionTitle((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescriptionValue(e.target.value);
    if (e.target.value.length > 300) {
      setError("Text exceeds 300 characters");
    } else {
      setError("");
    }
  };

  const onBackClick = () => {
    navigate(routerPath.MYACCOUNT);
  };

  const handleEditReviews = () => {
    setClickLoading(true);
    const payload = {
      reviewId: user?.reviewId,
      shortReview: descriptionTitle.title,
      reviewDetails: descriptionValue,
      numberOfStars: ratingValue,
    };

    API.put(`${editProductReview}`, payload)
      .then((response) => {
        if (response.status === 200) {
          toast.success("Review updated successfully", {
            autoClose: 2000,
            position: "top-right",
          });
          setClickLoading(false);
          setTimeout(() => {
            onBackClick();
          }, 2000);
        } else {
          setClickLoading(false);
          toast.error("Could not update review", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        setClickLoading(false);
        console.log("error", error);
        toast.error("Could not update review", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  const handleFetchEditProductReview = () => {
    setLoading(true);
    API.get(
      `${getEditReviewDetails}/${user?.currentUser?.uid}/${user.reviewId}`
    )
      .then((response) => {
        if (response.status === 200) {
          console.log("response", response.data);
          setLoading(false);
          setProductReview(response.data);
          setRatingValue(response.data.numberOfStars); // Set rating value
          setDescriptionTitle({ title: response.data.shortReview }); // Set short review
          setDescriptionValue(response.data.reviewDetails); // Set detailed review
          //   {
          //     "reviewId": 16,
          //     "productId": 77,
          //     "orderNumber": "GUGU7914804O",
          //     "productName": "Hand Bag - xxxl",
          //     "productDescription": "Rose gold type",
          //     "salesPrice": 0.8,
          //     "submittedDate": "2025-01-15T01:04:50.50978",
          //     "numberOfStars": 1,
          //     "shortReview": "Testing from the frontend",
          //     "reviewDetails": "I am adding a review from the frontend for the first time to test the implementation on the frontend",
          //     "productImage": "https://linqworthstorage.blob.core.windows.net/linqworthstorage/Untitled.jpg"
          // }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  useEffect(() => {
    handleFetchEditProductReview();
  }, []);
  return (
    <div className="mx-auto mt-10 mb-2">
      <div className="flex items-center p-3 px-6 font-bold bg-gray-primary-400">
        <RxCaretLeft
          className="text-xl font-bold cursor-pointer"
          onClick={onBackClick}
        />
        <p>Product Review</p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center my-8 h-[500px]">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div className="bg-base-gray-200">
          <div className="pt-2 md:flex">
            <div className="md:w-[35%] flex flex-col gap-2">
              <div className=" border-gray-primary-400 h-[300px] overflow-hidden md:ml-2 xs: mx-2 bg-white-primary-400">
                <img
                  src={productReview?.productImage}
                  alt="product image"
                  className="h-[300px] w-full object-cover"
                />
              </div>
              
            </div>
            <div className="md:w-[65%]">
              <div className="flex items-center justify-between px-6 pt-6">
                <div>
                  <p className="text-2xl font-bold">
                    {productReview?.productName}
                  </p>
                  <p className="mt-4 text-lg font-bold">
                    {formatMoney(productReview?.salesPrice)}
                  </p>
                </div>
                <div>
                  <p className="font-bold">Delivered on</p>
                  <p className="">26/02-2024</p>
                </div>
              </div>
              <div className="p-3 px-6 mt-4 font-bold bg-gray-primary-400">
                Description
              </div>
              <div className="h-[264px] overflow-y-scroll custom-scrollbar">
                <p className="p-6">{productReview?.productDescription}</p>
              </div>
            </div>
          </div>
          <div className="p-3 px-6 font-bold bg-gray-primary-400">
            Add Review
          </div>
          <div className="pt-2 pb-6 pl-2 pr-2 md:pl-6 xs: bg-base-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium">Product rating</p>
              <Rating
                className="!text-[30px] !text-primary-500"
                name="simple-controlled"
                value={ratingValue}
                onChange={(event, newValue) => {
                  console.log(event);
                  setRatingValue(newValue);
                }}
              />
            </div>
            <AppInput
              id="title"
              onChange={handleChange}
              type="text"
              value={descriptionTitle.title}
              className="h-[40px] px-4 w-full outline-none"
              placeholder="add short review 'Great Product'"
            />
            <AppTextArea
              onChange={handleDescriptionChange}
              value={descriptionValue}
              error={error}
              rows={5}
              placeholder="add detailed review here..."
              className="w-full p-2 px-4 mt-4 outline-none resize-vertical"
            />
            <div className="flex justify-end">
              <AppButton
                loading={clickLoading}
                clickHandler={() => handleEditReviews()}
                title="Submit"
                className="px-8 py-2 mt-5 w-[170px] uppercase bg-primary-500 text-white-primary-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditReview;
