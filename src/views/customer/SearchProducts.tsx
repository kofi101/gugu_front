import { useEffect, useState } from "react";
import { useParams } from "react-router";
import API, { searchProducts } from "../../endpoint";
import { Product } from "../../helpers/interface/interfaces";
import { itemsPerPage } from "../../helpers/functions/constants";
import { toast } from "react-toastify";
import AppCategoryCard from "../../shared/AppCategoryCard";
import AppLoader from "../../shared/AppLoader";
import EmptySearch from "../../assets/images/Product-Search-Not-Found1.webp";
import AppPagination from "../../shared/AppPagination";
const SearchProducts = () => {
  const { searchQuery } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [currentData, setCurrentData] = useState(searchResults);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getSearchedProduct = () => {
    setSearchLoading(true);
    API.get(`${searchProducts}/${searchQuery}`)
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          setSearchResults(response?.data);
          setSearchLoading(false);
        } else {
          toast.error("An error occurred. Try again", {
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("An error occurred. Try again", {
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    getSearchedProduct();
  }, [searchQuery]);

  useEffect(() => {
    setCurrentData(searchResults);
  }, [searchResults]);
  return (
    <div className="mb-2">
      <div className="w-full my-6 bg-base-gray-200">
        <div className="px-2 py-2 font-bold capitalize bg-gray-primary-400">
          {searchQuery}
        </div>
        {searchLoading ? (
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
      {searchResults.length > 6 ? (
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
  );
};

export default SearchProducts;
