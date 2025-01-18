import { useState } from "react";
import AppButton from "../../shared/AppButton";
import { useNavigate } from "react-router-dom";
import { routerPath } from "../../routes/Router";
import AppInput from "../../shared/AppInput";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { emailPattern } from "../../helpers/functions/constants";
import { toast } from "react-toastify";

const AuthForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotInput, setForgotInput] = useState({
    email: "",
    newPassword: "",
  });
  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setForgotInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateEmail = (email: string): [string, boolean] => {
    if (!email) return ["Email is required", false];
    if (!emailPattern.test(email)) return ["Invalid email", false];
    return [email, true];
  };
  const handleFirebaseResetPassword = () => {
    if (!forgotInput.email) {
      toast.error("Email is required", {
        autoClose: 2000,
        position: "top-right",
      });
      return;
    } else {
      const [email, emailValid] = validateEmail(forgotInput.email);
      if (!emailValid) {
        toast.error("Email is invalid", {
          autoClose: 2000,
          position: "top-right",
        });
        return;
      } else {
        sendPasswordResetEmail(auth, email)
          .then(() => {
            toast.success("Reset password link sent. Check your email.", {
              autoClose: 2000,
              position: "top-right",
            });
            setTimeout(() => {
              navigate(routerPath.LOGIN);
            }, 2000);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
    // sendPasswordResetEmail(auth, forgotInput.email)
    //   .then(() => {
    //     console.log("Email sent");
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  };
  return (
    <div className="flex flex-col md:mt-8 md:w-3/5 ">
      <div className="mb-5 text-center">
        <p className="mb-5 text-3xl font-bold">Forgot Password</p>
        <p>Reset your account password</p>
      </div>

      <div className="flex flex-col gap-4">
        <AppInput
          id="email"
          placeholder="Email"
          type="text"
          value={forgotInput.email}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
        <AppInput
          id="newPassword"
          placeholder="New Password"
          type="email"
          value={forgotInput.newPassword}
          onChange={handleChange}
          className="w-full px-6 py-3 rounded-md outline-none bg-base-gray-200"
        />
      </div>

      <AppButton
        title="Confirm"
        clickHandler={handleFirebaseResetPassword}
        className="w-full py-3 mt-4 rounded-md bg-primary-500 text-white-primary-400"
      />
    </div>
  );
};

export default AuthForgotPassword;
