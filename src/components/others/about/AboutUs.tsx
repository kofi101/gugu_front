/* eslint-disable @typescript-eslint/no-explicit-any */
import BackgroundImage from "../../../assets/images/LoginBack.jpg";
import Concentrated from "../../../assets/images/concentrated.png";
import Target from "../../../assets/images/target.png";
import { routerPath } from "../../../routes/Router";
import { useNavigate } from "react-router";
import { RxCaretRight } from "react-icons/rx";
import { useSelector } from "react-redux";

const AboutUs = () => {
  const navigate = useNavigate();
  const user = useSelector((store: any) => store?.user?.companyInfo);
  return (
    <div className="w-3/5 mx-auto mb-5">
      <div className="flex items-center py-3 text-primary-500">
        <p
          className="cursor-pointer"
          onClick={() => navigate(routerPath.HOMEPAGE)}
        >
          Home
        </p>
        <RxCaretRight />
        <p>About</p>
      </div>
      <div className="flex flex-col gap-5">
        <div className="relative h-[540px]">
          <img src={BackgroundImage} alt="" className="h-[540px] object-cover w-full" />
          <div className="absolute bottom-0 bg-black-primary-400 h-[50%] w-full opacity-80 text-white-primary-400 py-10">
            <div className="flex flex-col items-center justify-center">
              <p className="text-xl font-bold">Welcome to</p>
              <p className="text-xl font-bold">GUGU GHANA LIMITED</p>
              <p className="w-4/5 mt-8">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                nec purus ac turpis fermentum. Integer sit amet metus nec
                libero.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-5 ">
          <div className="relative w-1/2 border">
            <img src={Concentrated} alt="" className="object-cover w-full" />
            <div className="absolute bottom-0 w-full h-full pt-8 bg-black-primary-400 opacity-80 text-white-primary-400">
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg font-bold">Our Vision</p>
                <p className="w-4/5">
                  {user?.ourVision}
                </p>
              </div>
            </div>
          </div>
          <div className="relative w-1/2 border">
            <img src={Target} alt="" className="object-cover w-full" />
            <div className="absolute bottom-0 w-full h-full pt-8 bg-black-primary-400 opacity-80 text-white-primary-400">
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg font-bold">Our Mision</p>
                <p className="w-4/5">
                  {user?.ourMission}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
