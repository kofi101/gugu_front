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
import API, { addProductReview, getAddReviewDetails } from "../../endpoint";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import { formatMoney } from "../../helpers/functions/helperFunctions";

const ProductReview = () => {
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

  const handleSaveReviews = () => {
    setClickLoading(true);
    const payload = {
      customerId: user?.currentUser?.uid,
      orderNumber: user?.detailsToAddReview?.orderNumber,
      productId: user?.detailsToAddReview?.productId,
      shortReview: descriptionTitle.title,
      reviewDetails: descriptionValue,
      numberOfStars: ratingValue,
    };

    API.post(`${addProductReview}`, payload)
      .then((response) => {
        if (response.status === 200) {
          setClickLoading(false);
          toast.success("Review added successfully", {
            autoClose: 2000,
            position: "top-right",
          });
          
          navigate(routerPath.MYACCOUNT);
        } else {
          setClickLoading(false)
          toast.error("Could not added review", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
        setClickLoading(false);
        toast.error("Could not added review", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  const handleFetchAddProductReview = () => {
    setLoading(true);
    API.get(`${getAddReviewDetails}/${user?.currentUser?.uid}/${user?.detailsToAddReview?.productId}`)
      .then((response) => {
        if (response.status === 200) {
          console.log("response", response.data);
          setLoading(false);
          setProductReview(response.data);
         
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  useEffect(() => {
    handleFetchAddProductReview();
  }, []);

  return (
    <div className="mt-10 mb-2">
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
                  <p className="text-2xl font-bold">{productReview?.productName}</p>
                  <p className="mt-4 text-lg font-bold">{formatMoney(productReview?.salesPrice)}</p>
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
                <p className="p-6">
                  {productReview?.productDescription}
                </p>
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
                clickHandler={() => handleSaveReviews()}
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

export default ProductReview;
