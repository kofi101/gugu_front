import AuthLogin from "../../components/auth/AuthLogin";
import AppStore from "../../assets/images/appstore.png";
import GooglePlay from "../../assets/images/googleplay.png";
import AppHeroImage from "../../shared/AppHeroImage";


const Login = () => {

  return (
    <div className="flex items-center w-full h-screen">
      <div className="items-center justify-center hidden w-1/2 h-full mx-auto md:flex bg-primary-400">
        <AppHeroImage />
      </div>
      <div className="flex flex-col items-center justify-center md:w-1/2">
        <AuthLogin />
        <div className="flex items-center gap-4 pl-2 md:mt-20">
          <div className="flex gap-2">
            <div>
              <img src={GooglePlay} alt="" />
            </div>
            <div>
              <img src={AppStore} alt="" />
            </div>
          </div>
          <div>
            <p className="font-bold">Download GUGU!</p>
            <p className="text-xs">
              And experience shopping and selling on the GO!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
