import { useState, useEffect } from "react";
import AppSelect from "../../shared/AppSelect";
import AppInput from "../../shared/AppInput";
import AppButton from "../../shared/AppButton";
import "../../styles/AppCustomCss.css";
import { routerPath } from "../../routes/Router";
import { useNavigate } from "react-router";
import GuguLogo from "../../assets/gugu2.png";
import API, { getCategories, getCompanyDetails } from "../../endpoint";
import { companyDetailsProps } from "../../helpers/interface/interfaces";
import { sellOnGuguLink } from "../../helpers/functions/constants";
import { IoCallOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";

const MainFooter = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [searchInput, setSearchInput] = useState({
    search: "",
  });

  const [companyDetails, setCompanyDetails] = useState<companyDetailsProps>();

  const fetchCategories = () => {
    API.get(`${getCategories}`).then((response) => {
      const responsedata = response.data;
      setCategory(responsedata);
    });
  };
  const handleSearch = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setSearchInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const handleCategoryClick = (item: number) => {
    console.log("category clicked", item);

    navigate(routerPath.CATEGORIES);
  };

  const handleGetCompanyInformation = () => {
    API.get(`${getCompanyDetails}`)
      .then((response) => {
        if (response.status === 200) {
          setCompanyDetails(response.data);
        }
      })
      .catch();
  };

  const goToSearch = () => {
    navigate(`${routerPath.SEARCHPRODUCTS}${searchInput.search}`);
  };
  const sellOnGugu = () => {
    window.location.href = sellOnGuguLink;
  };
  const handleCall = () => {
    if (companyDetails?.callUseNowNumber) {
      window.location.href = `tel:${companyDetails.callUseNowNumber}`;
    }
  };

  const handleEmail = () => {
    if (companyDetails?.siteDisplayEmail) {
      window.location.href = `mailto:${companyDetails.siteDisplayEmail}`;
    }
  };

  useEffect(() => {
    fetchCategories();
    handleGetCompanyInformation();
  }, []);
  return (
    <div className="text-center mainFooter">
      <div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center justify-center py-4 md:py-10">
            <AppSelect
              onChange={(value: string) => handleCategoryClick(Number(value))}
              defaultValue=""
              name=""
              options={category}
              className="px-2 py-2 outline-none md:h-[50px] mr-1 rounded-l-full md:w-[130px] md:block w-[40px]"
            />

            <AppInput
              className="p-2 outline-none md:w-72 md:h-[50px]"
              onChange={handleSearch}
              type="text"
              value={searchInput.search}
              id="search"
              placeholder="Search"
            />
            <AppButton
              title="Search"
              clickHandler={() => goToSearch()}
              className="px-4 py-2 md:h-[50px] rounded-r-full bg-primary-500 text-white-primary-400"
            />
          </div>
          <div className="hidden gap-4 text-left text-white-primary-400 md:flex">
            <p
              onClick={handleCall}
              className="flex items-center p-1 rounded-md cursor-pointer bg-primary-400"
            >
              <IoCallOutline className="text-2xl text-white-primary-400" />
            </p>

            <p
              onClick={handleEmail}
              className="flex items-center p-1 rounded-md cursor-pointer bg-primary-400"
            >
              <MdOutlineEmail className="text-2xl text-white-primary-400" />
            </p>
          </div>
        </div>
        <div className="py-2 bg-black md:py-6">
          {/* <p className="mb-3 font-bold md:text-4xl text-white-primary-400">
            GUGU!
          </p> */}
          <div className="flex items-center justify-center mb-3">
            <img src={GuguLogo} alt="" className="w-[130px]" />
          </div>
          <div>
            <ul className="flex items-center justify-center gap-4 uppercase items text-white-primary-400">
              <li
                className="text-xs cursor-pointer md:text-[16px]"
                onClick={() => navigate(routerPath.HOMEPAGE)}
              >
                Home
              </li>
              <li
                className="text-xs cursor-pointer md:text-[16px]"
                onClick={() => navigate(routerPath.PROMOTIONS)}
              >
                Promotions
              </li>
              <li
                className="text-xs cursor-pointer md:text-[16px]"
                onClick={() => navigate(routerPath.ABOUT)}
              >
                About
              </li>
              <li
                className="text-xs cursor-pointer md:text-[16px]"
                onClick={() => navigate(routerPath.CONTACT)}
              >
                Contact
              </li>
              <li className="cursor-pointer" onClick={() => sellOnGugu()}>
                Sell on Gugu
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainFooter;
