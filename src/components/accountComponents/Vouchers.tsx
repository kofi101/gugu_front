/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import API, { userVouchers } from "../../endpoint";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { formatDate } from "../../helpers/functions/helperFunctions";
import { Voucher } from "../../helpers/interface/interfaces";

const Vouchers = () => {
  const user = useSelector((store: any) => store?.user?.currentUser);

  const [userVouchersData, setUserVouchersData] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserVouchers = () => {
    setIsLoading(true);
    API.get(`${userVouchers}/${user?.uid}`)
      .then((response) => {
        console.log(response.data);
        setUserVouchersData(response.data);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUserVouchers();
  }, []);

  useEffect(() => {
    if (userVouchersData.length > 0) {
      setIsLoading(false);
    }
  }, [userVouchersData]);

  return (
    <div>
      <div className="p-3 font-bold bg-gray-primary-400">Vouchers</div>
      <div className="border bg-base-gray-200">
        {isLoading ? (
          <div className="flex justify-center my-8">
            <CircularProgress className="circularProgress !text-gray-primary-400" />
          </div>
        ) : (
          <table className="w-full border">
            <thead className=" text-gray-secondary-500">
              <tr className="border-b">
                <th className="py-3 pl-3 text-left">Name</th>
                <th>Code</th>
                <th>Expiry date</th>
                <th>Discount</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {userVouchersData.map((voucher, index) => (
                <tr key={index} className="text-sm border-b">
                  <td className="py-3 pl-3 font-medium">
                    {voucher.couponType}
                  </td>
                  <td className="text-center">{voucher.couponCode}</td>
                  <td className="text-center">
                    {formatDate(voucher.expiryDate)}
                  </td>
                  <td className="text-center">{voucher.couponPercentage}%</td>
                  <td className="text-center">{voucher.applicationType}</td>
                  <td>
                      <p
                        className={`text-center p-1 mr-1 rounded-md ${
                          voucher.status.toLowerCase() === "active"
                            ? "bg-blue-primary-400 text-white"
                            : voucher.status.toLowerCase() === "expired"
                            ? "bg-shade-orange text-white"
                            : ""
                        }`}
                      >
                        {voucher.status}
                      </p>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Vouchers;
