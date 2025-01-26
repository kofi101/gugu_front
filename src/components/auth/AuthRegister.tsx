import { useState, useEffect } from "react";
import AppButton from "../../shared/AppButton";
import AppInput from "../../shared/AppInput";
import { useNavigate } from "react-router-dom";
import { routerPath } from "../../routes/Router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { addUserDetails, userType } from "../../endpoint/index";
import API from "../../endpoint/index";
import {
  specialCharPattern,
  uppercasePattern,
  lowercasePattern,
  digitPattern,
  addressString,
  emailPattern,
} from "../../helpers/functions/constants";
import { toast } from "react-toastify";

const AuthRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isUserType, setIsUserType] = useState("");
  const [authCustomerInput, setAuthCustomerInput] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    address: "",
    shippingBillingAddress: "",
  });
  const [visiblePassword, setVisiblePassword] = useState(false);

  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setAuthCustomerInput((prev) => ({
      ...prev,
      [id]: value,
    }));
    switch (id) {
      case "email":
        setEmailError("");
        break;
      case "phoneNumber":
        setPhoneNumberError("");
        break;
      case "password":
        setPasswordError("");
        break;
      case "confirmPassword":
        setConfirmPasswordError("");
        break;
      case "address":
        setAddressError("");
        break;
      default:
        break;
    }
  };
  const validateEmail = (email: string): [string, boolean] => {
    if (!email) return ["Email is required", false];
    if (!emailPattern.test(email)) return ["Invalid email", false];
    return [email, true];
  };

  const validatePhoneNumber = (phoneNumber: string): [string, boolean] => {
    const correctNumber = phoneNumber.replace(/\D/g, "");
    if (!correctNumber) return ["Phone number is required", false];
    if (correctNumber.length < 10) return ["Invalid phone number", false];
    return [correctNumber, true];
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
  const validString = (address: string): [string, boolean] => {
    if (!address) return ["Address is required", false];

    if (!addressString.test(address)) return ["Invalid address", false];
    return [address, true];
  };

  const showPassword = () => {
    setVisiblePassword(visiblePassword ? false : true);
  };

  const validateRegistrationDetails = () => {
    let isValidDetails = true;

    const emailError = validateEmail(authCustomerInput.email);
    const phoneNumberError = validatePhoneNumber(authCustomerInput.phoneNumber);
    const passwordError = validatePassword(authCustomerInput.password);
    const addressError = validString(authCustomerInput.address);

    if (!emailError[1]) {
      setEmailError(emailError[0] as string);
      isValidDetails = false;
    } else {
      setEmailError("");
    }

    if (!phoneNumberError[1]) {
      setPhoneNumberError(phoneNumberError[0] as string);
      isValidDetails = false;
    } else {
      setPhoneNumberError("");
    }

    if (!passwordError[1]) {
      setPasswordError(passwordError[0] as string);
      isValidDetails = false;
    } else {
      setPasswordError("");
    }

    if (authCustomerInput.password !== authCustomerInput.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValidDetails = false;
    } else {
      setConfirmPasswordError("");
    }

    if (!addressError[1]) {
      setAddressError(addressError[0] as string);
      isValidDetails = false;
    } else {
      setAddressError("");
    }

    return isValidDetails;
  };

  useEffect(() => {
    API.get(userType)
      .then((response) => {
        const retrieveCustomer = response.data.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data: any) => data.name === "Customer"
        );
        setIsUserType(retrieveCustomer[0]?.name);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const goToLogin = () => {
    navigate(routerPath.LOGIN);
  };

  const handleSaveToDb = (email: string, UID: string) => {
    const registerData = {
      userType: isUserType,
      id: UID,
      fullName: authCustomerInput.fullName,
      email: email,
      phoneNumber: authCustomerInput.phoneNumber,
      address: authCustomerInput.address,
      shipping_BillingAddress: authCustomerInput.shippingBillingAddress,
      createdBy: UID,
      firebaseId: UID,
    };
    API.post(addUserDetails, registerData)
      .then((response) => {
        if (response.data.status === "success") {
          setIsLoading(false);
          toast.success("Registration successful", {
            autoClose: 2000,
            position: "top-right",
          });
          setTimeout(() => {
            navigate(routerPath.LOGIN);
          }, 2000);
        } else {
          setIsLoading(false);
          toast.error("Registration failed", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleRegistration = () => {
    const isVaildDetails = validateRegistrationDetails();
    if (!isVaildDetails) return;
    if (isVaildDetails) {
      setIsLoading(true);
      createUserWithEmailAndPassword(
        auth,
        authCustomerInput.email,
        authCustomerInput.password
      )
        .then((userCredential) => {
          const user = userCredential.user;
          handleSaveToDb(user?.email as string, user?.uid as string);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
          toast.error("Registration failed", {
            position: "top-right",
            autoClose: 2000,
          });
        });
    }
  };
  return (
    <div className="flex flex-col md:mt-8 md:w-3/5 ">
      <div className="mb-5 text-center">
        <p className="mb-5 text-3xl font-bold">Register</p>
        <p>Register for an account</p>
      </div>

      <div className="flex flex-col gap-4">
        <AppInput
          id="fullName"
          placeholder="First name and Last name"
          type="text"
          value={authCustomerInput.fullName}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        <AppInput
          id="email"
          placeholder="Email"
          type="email"
          value={authCustomerInput.email}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        {emailError && (
          <p className="-mt-4 text-xs text-red-primary-400">{emailError}</p>
        )}
        <AppInput
          id="phoneNumber"
          placeholder="Phone Number"
          type="email"
          value={authCustomerInput.phoneNumber}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        {phoneNumberError && (
          <p className="-mt-4 text-xs text-red-primary-400">
            {phoneNumberError}
          </p>
        )}
        <AppInput
          id="password"
          placeholder="Password"
          value={authCustomerInput.password}
          onChange={handleChange}
          type={visiblePassword ? "text" : "password"}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        {passwordError && (
          <p className="-mt-4 text-xs text-red-primary-400">{passwordError}</p>
        )}
        <AppInput
          id="confirmPassword"
          placeholder="Confirm Password"
          value={authCustomerInput.confirmPassword}
          onChange={handleChange}
          type={visiblePassword ? "text" : "password"}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        {confirmPasswordError && (
          <p className="-mt-4 text-xs text-red-primary-400">
            {confirmPasswordError}
          </p>
        )}
        <div className="flex items-center gap-1 ">
          <input
            type="checkbox"
            name="show password"
            id="showpwd"
            onClick={showPassword}
            className="!bg-red-400 cursor-pointer"
          />
          <label
            htmlFor="showpwd"
            className="text-xs cursor-pointer shwPwd text-gray-tertiary-600"
          >
            show password
          </label>
        </div>
        <AppInput
          id="address"
          placeholder="Address"
          type="text"
          value={authCustomerInput.address}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        {addressError && (
          <p className="-mt-4 text-xs text-red-primary-400">{addressError}</p>
        )}
        <AppInput
          id="shippingBillingAddress"
          placeholder="Billing / Shipping Address (optional)"
          type="text"
          value={authCustomerInput.shippingBillingAddress}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
      </div>

      <AppButton
        title="Register"
        clickHandler={handleRegistration}
        className="w-full py-3 mt-4 rounded-md bg-primary-500 text-white-primary-400"
        loading={isLoading}
      />

      <div className="mt-2 font-bold text-center md:mt-12">
        <p>
          Already have an account?{" "}
          <span className="cursor-pointer text-primary-500" onClick={goToLogin}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthRegister;
