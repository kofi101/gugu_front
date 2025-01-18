import { useState } from "react";
import AppInput from "../../shared/AppInput";
import AppButton from "../../shared/AppButton";
import { useNavigate } from "react-router-dom";
import { routerPath } from "../../routes/Router";
import { auth } from "../../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux";
import {
  setCartId,
  setUser,
  setUserToken,
  setWishListId,
} from "../../store/features/userSliceFeature";
import {
  digitPattern,
  emailPattern,
  lowercasePattern,
  specialCharPattern,
  uppercasePattern,
} from "../../helpers/functions/constants";
import { toast } from "react-toastify";
import API, { createCustomerCart, getBearerToken, userWishList } from "../../endpoint";

const AuthLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [authInput, setAuthInput] = useState({
    emailPhone: "",
    password: "",
  });
  const goToRegistration = () => {
    navigate(routerPath.REGISTER);
  };
  const goToForgotPassword = () => {
    navigate(routerPath.FORGOTPASSWORD);
  };

  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setAuthInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const validateEmail = (emailPhone: string): [string, boolean] => {
    if (!emailPhone) return ["Email is required", false];
    if (!emailPattern.test(emailPhone)) return ["Invalid email", false];
    return [emailPhone, true];
  };
  const validatePassword = (password: string): [string, boolean] => {
    if (!password) return ["Password is required", false];
    if (password.length < 6)
      return ["Password should be at least 6 characters", false];
    if (
      !(
        uppercasePattern.test(password) &&
        lowercasePattern.test(password) &&
        digitPattern.test(password) &&
        specialCharPattern.test(password)
      )
    ) {
      return [
        "Password should include at least one uppercase letter, one lowercase letter, one digit, and one special character",
        false,
      ];
    }
    return [password, true];
  };

  const validateLoginDetails = () => {
    let isValidDetails = true;
    const emailError = validateEmail(authInput.emailPhone);
    const passwordError = validatePassword(authInput.password);

    if (!emailError[1]) {
      setEmailError(emailError[0] as string);
      isValidDetails = false;
    } else {
      setEmailError("");
    }
    if (!passwordError[1]) {
      setPasswordError(passwordError[0] as string);
      isValidDetails = false;
    } else {
      setPasswordError("");
    }

    return isValidDetails;
  };

  const createCartOnLogin = (customerId: string) => {
    API.post(`${createCustomerCart}`, { emailAddress: customerId })
      .then((response) => {
        const cartId = response.data.cartId;

        dispatch(setCartId(cartId));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const createWishListOnLogin = (customerId: string) => {
    API.post(`${userWishList}`, {customerId: customerId}).then(response => {
      const wishListId = response.data.wishListId;
      dispatch(setWishListId(wishListId));
    }).catch(error => {
      console.log(error);
    
    });
  }

  const handleLogin = () => {
    const isValidDetails = validateLoginDetails();
    if (!isValidDetails) return;
    if (isValidDetails) {
      setIsLoading(true);
      signInWithEmailAndPassword(auth, authInput.emailPhone, authInput.password)
        .then((userCredential) => {
          const user = userCredential.user;
          API.post(`${getBearerToken}`, { email: user.email })
            .then((response) => {
              const token = response.data.token;

              dispatch(setUserToken(token));
              createCartOnLogin(user.email!);
              createWishListOnLogin(user.uid)
              dispatch(setUser(user));
              setIsLoading(false);

              toast.success("Login successful", {
                autoClose: 2000,
                position: "top-right",
              });
              setTimeout(() => {
                navigate(routerPath.HOMEPAGE);
              }, 2000);
            })
            .catch((error) => {
              if (error) {
                toast.error("Login failed, check credentials", {
                  position: "top-right",
                  autoClose: 2000,
                });
              }
            });
        })
        .catch((error) => {
          setIsLoading(false);
          if (error) {
            toast.error("Login failed, check credentials", {
              position: "top-right",
              autoClose: 2000,
            });
          }
        });
    }
  };
  return (
    <div className="flex flex-col h-full mt-20 md:w-3/5 ">
      <div className="mb-5 text-center">
        <p className="mb-5 text-3xl font-bold">Login</p>
        <p>Login to your account</p>
      </div>

      <div className="flex flex-col gap-8">
        <AppInput
          id="emailPhone"
          placeholder="Email / Phone Number"
          type="text"
          value={authInput.emailPhone}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        {emailError && (
          <p className="-mt-8 text-xs text-red-primary-400">{emailError}</p>
        )}
        <AppInput
          id="password"
          placeholder="Password"
          type="password"
          value={authInput.password}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        {passwordError && (
          <p className="-mt-8 text-xs text-red-primary-400">{passwordError}</p>
        )}
      </div>
      <p className="flex justify-end my-2 text-sm text-gray-tertiary-600 cursor-">
        <span className="cursor-pointer" onClick={goToForgotPassword}>
          Forgot Password?
        </span>
      </p>
      <AppButton
        title="Login"
        clickHandler={handleLogin}
        loading={isLoading}
        className="w-full py-3 mt-2 rounded-md bg-primary-500 text-white-primary-400"
      />
      <div className="flex items-center justify-center gap-2 my-4">
        <p className="h-[2px] w-32 bg-gray-secondary-500"></p>
        <p className="text-xs text-gray-tertiary-600">Or Continue With</p>
        <p className="h-[2px] w-28 bg-gray-secondary-500"></p>
      </div>

      <div className="flex justify-between gap-10">
        <div className="w-full">
          <AppButton
            title="G"
            clickHandler={() => console.log("clicked")}
            className="w-full py-1 text-3xl font-bold rounded-md bg-red-primary-400 text-white-primary-400"
          />
        </div>
        <div className="w-full">
          <AppButton
            title="f"
            clickHandler={() => console.log("clicked")}
            className="w-full py-1 text-3xl font-bold rounded-md bg-blue-secondary-500 text-white-primary-400"
          />
        </div>
      </div>
      <div className="mt-12 font-bold text-center">
        <p>
          Not Registered?{" "}
          <span
            className="cursor-pointer text-primary-500"
            onClick={goToRegistration}
          >
            Join Now
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthLogin;
