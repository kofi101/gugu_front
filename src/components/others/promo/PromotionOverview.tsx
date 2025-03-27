/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router";
import { routerPath } from "../../../routes/Router";
import { RxCaretRight } from "react-icons/rx";
import { useEffect, useState } from "react";
import API, { promosProduct } from "../../../endpoint";

import AppCategoryCard from "../../../shared/AppCategoryCard";
import { CircularProgress } from "@mui/material";
const PromotionOverview = () => {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`${promosProduct}`).then((response) => {
      const responseData = response.data;
      setPromos(responseData);
      setLoading(false);
    });
  }, []);

  const PromotionSection = ({ promotion }: { promotion: any }) => (
    <div>
      <div className="p-4 bg-primary-500">
        <div className="flex justify-between text-white-primary-400 item-center">
          <p className="text-white-primary-400">{promotion.promotionName!}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-2 py-8">
        {promotion?.promotionalProducts?.map((product: any) => {
          return <AppCategoryCard category={product} key={product.productId} />;
        })}
      </div>
    </div>
  );
  return (
    <div className="w-[60%] mx-auto mb-5">
      <div className="flex items-center py-3 text-primary-500">
        <p
          className="cursor-pointer"
          onClick={() => navigate(routerPath.HOMEPAGE)}
        >
          Home
        </p>
        <RxCaretRight />
        <p>Promotion</p>
      </div>
      {loading ? (
        <div className="flex justify-center my-8 h-[250px] items-center">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div className="">
          {promos.map((promo) => (
            <PromotionSection promotion={promo} key={promo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionOverview;
