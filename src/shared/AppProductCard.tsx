import { Product, productCardProp } from "../helpers/interface/interfaces";
import {
  formatMoney,
  subStringLongText,
} from "../helpers/functions/helperFunctions";
import { routerPath } from "../routes/Router";
import { useNavigate } from "react-router-dom";

const AppProductCard: React.FC<productCardProp> = ({ product }) => {
  const navigate = useNavigate();
  
  const saveToRecentlyViewed = (product: Product) => {
    const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const updateRecentlyViewed = [product, ...recentlyViewed.filter((item: Product) => item.productId !== product.productId)];
    localStorage.setItem("recentlyViewed", JSON.stringify(updateRecentlyViewed.slice(0, 6)));
  }
  const onProductClick = (product: Product) => {
    saveToRecentlyViewed(product);
    navigate(`${routerPath.PRODUCTDETAILS}${product.productId}`);
  };

  return (
    <div className="text-center bg-white border cursor-pointer border-gray-primary-400">
      <div className="relative">
        {(product.productImages?.length ?? 0) > 0 && (
          <img
            className="h-[150px] w-full object-cover"
            src={product.productImages?.[0]}
            alt={product.productName}
            onClick={() => onProductClick(product)}
          />
        )}
        {/* <AiFillHeart className="absolute top-2 right-2 h-[20px] w-[20px] text-primary-400" /> */}
      </div>

      <div
        className="py-2 font-semibold"
        onClick={() => onProductClick(product)}
      >
        {product.productName && (
          <p className="">{subStringLongText(product.productName, 14)}</p>
        )}
        {product.salesPrice !== undefined && (
          <p className="text-primary-500">{formatMoney(product.discountPrice ? product.discountPrice :  product.salesPrice)}</p>
        )}
        <p className="text-xs">{product.quantity} items left</p>
      </div>
    </div>
  );
};

export default AppProductCard;
