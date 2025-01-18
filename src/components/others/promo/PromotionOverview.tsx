import { useNavigate } from "react-router";
import { routerPath } from "../../../routes/Router";
import { RxCaretRight } from "react-icons/rx";
const PromotionOverview = () => {
  const navigate = useNavigate();
  return (
    <div className="w-3/5 mx-auto">
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
      <div>
        Here to stay
      </div>
    </div>
  );
};

export default PromotionOverview;
