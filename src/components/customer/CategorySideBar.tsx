import { CircularProgress } from "@mui/material";
import { CategorySideBarProps } from "../../helpers/type/types";
import { CategoryItem } from "../../helpers/type/types";
const CategorySideBar: React.FC<CategorySideBarProps> = ({
  categories,
  onCategoryClick,
  isLoading
}) => {
  const handleClick = (item: CategoryItem) => {
    onCategoryClick(item);
  };
  return (
    <div className="">
      <p className="px-2 py-2 font-bold bg-gray-primary-400">Category</p>
      {isLoading ? (
        <div className="flex items-center justify-center my-10">
          <CircularProgress className=" !text-gray-primary-400" />
        </div>
      ) : (
        <ul>
          {categories?.map((category) => (
            <li
              className="px-2 py-2 border-b-2 cursor-pointer hover:bg-gray-primary-400 hover:text-primary-500"
              key={category?.productCategoryId}
              onClick={() => handleClick(category)}
            >
              {category?.productCategory}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategorySideBar;
