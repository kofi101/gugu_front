/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import CategorySideBar from "../../components/customer/CategorySideBar";
// import { routerPath } from "../../routes/Router";
// import { useNavigate } from "react-router";
import "../../styles/AppCustomCss.css";
import API, { categoryProductsEndpoint, getCategories } from "../../endpoint";
import AppInput from "../../shared/AppInput";
import AppCategoryCard from "../../shared/AppCategoryCard";
import { useSelector } from "react-redux";
import { Product } from "../../helpers/interface/interfaces";
import { itemsPerPage } from "../../helpers/functions/constants";
import { RxCaretRight } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { productBrandsToStore } from "../../store/features/productFeature";
import AppPagination from "../../shared/AppPagination";
import { CategoryItem } from "../../helpers/type/types";
import AppLoader from "../../shared/AppLoader";
import EmptySearch from "../../assets/images/Product-Search-Not-Found1.webp";

const CategoriesView = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [priceChange, setPriceChange] = useState({
    firstPrice: 0,
    secondPrice: 0,
  });

  const { brands } = useSelector((store: any) => store.product);
  const [category, setCategory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [currentData, setCurrentData] = useState(categoryProducts);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [categoryName, setCategoryName] = useState<string>("");
  const [brandsId, setBrandsId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleCategoryClick = (item: CategoryItem) => {
    const prodCategoryId =
      item.productCategoryId === 1 ? 0 : item.productCategoryId;
    setCategoryId(prodCategoryId);
    setCategoryName(item.productCategory!);
  };
  useEffect(() => {
    setCategoryLoading(true);
    API.get(`${getCategories}`).then((response) => {
      const responsedata = response.data;
      setCategory(responsedata);
      setCategoryLoading(false);
    });
    dispatch(productBrandsToStore({ categoryId: categoryId.toString() }));
  }, [categoryId]);

  useEffect(() => {
    setCurrentData(categoryProducts);
  }, [categoryProducts]);

  useEffect(() => {
    const lowerPrice = priceChange.firstPrice;
    const upperPrice = priceChange.secondPrice;
    setLoading(true);
    API.get(
      `${categoryProductsEndpoint}${categoryId}/${brandsId}/${lowerPrice}/${upperPrice}`
    ).then((response) => {
      if (response.status === 200) {
        setLoading(false);
        const responsedata = response.data;

        setCategoryProducts(responsedata);
      }
    });
  }, [categoryId, brandsId, priceChange.firstPrice, priceChange.secondPrice]);

  const handlePriceChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setPriceChange((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleBrandSelection = (brandId: number) => {
    setBrandsId(brandId);
    console.log(brandsId);
  };

  return (
    <div className="px-4 mx-auto mb-2 md:w-3/5">
      <div className="flex items-center py-3">
        <p className="cursor-pointer">Home</p>
        <RxCaretRight />
        <p>Categories</p>
      </div>
      <div className="gap-4 md:flex">
        <div className="hidden md:w-[25%] md:flex flex-col gap-4 mb-10  ">
          <div className="h-[300px] overflow-y-scroll custom-scrollbar bg-base-gray-200">
            <CategorySideBar
              categories={category}
              onCategoryClick={handleCategoryClick}
              isLoading={categoryLoading}
            />
          </div>
          <div className="bg-base-gray-200">
            <div className="px-2 py-2 font-bold bg-gray-primary-400">
              Price (Ghc)
            </div>
            <div className="flex items-center justify-between px-2 py-4">
              <AppInput
                id="firstPrice"
                placeholder="0"
                value={priceChange.firstPrice}
                className="w-20 p-1 border rounded-md outline-none bg-base-gray-200 border-gray-tertiary-600"
                onChange={handlePriceChange}
                type="text"
              />
              <p>To</p>
              <AppInput
                id="secondPrice"
                placeholder="10000"
                value={priceChange.secondPrice}
                className="w-20 p-1 border rounded-md outline-none bg-base-gray-200 border-gray-secondary-500"
                onChange={handlePriceChange}
                type="text"
              />
            </div>
          </div>
          <div className="bg-base-gray-200">
            <div className="px-2 py-2 font-bold bg-gray-primary-400">Brand</div>
            <ul className="p-2 border h-[230px] overflow-y-scroll custom-scrollbar">
              {brands?.map((brand: any) => {
                return (
                  <li key={brand.brandId} className="py-2">
                    <input
                      type="radio"
                      className="mr-2"
                      name="brandSelection"
                      onChange={() => handleBrandSelection(brand.brandId!)}
                    />
                    {brand.brandName}
                  </li>
                );
              })}
            </ul>
          </div>
          {/* <div className="bg-gray-primary-400">
            <div className="px-2 py-2 font-bold bg-gray-secondary-500">
              Shipped From
            </div>
            <ul className="p-2 border h-[100px] overflow-y-scroll custom-scrollbar">
              {shippingOptions?.map((ship) => {
                return (
                  <li key={ship.id} className="py-2">
                    <input type="checkbox" className="mr-2" />
                    {ship.location}
                  </li>
                );
              })}
            </ul>
          </div> */}
        </div>
        <div className="md:w-[75%]">
          <div className="w-full bg-base-gray-200">
            <div className="px-2 py-2 font-bold bg-gray-primary-400">
              {categoryName ? categoryName : "All Categories"}
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-screen bg-black bg-opacity-25">
                <AppLoader height="40px" width="40px" />
              </div>
            ) : (
              <div>
                {currentItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 p-2 py-8">
                    {currentItems?.map((category: Product) => (
                      <AppCategoryCard category={category} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full w-[100%] mx-auto">
                    <img
                      src={EmptySearch}
                      alt="empty-cart"
                      className="object-cover my-4"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {currentItems.length > 6 ? (
            <div>
              <AppPagination
                currentData={currentData}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesView;
