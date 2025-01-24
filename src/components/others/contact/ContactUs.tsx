import { RxCaretRight } from "react-icons/rx";
import { routerPath } from "../../../routes/Router";
import { useNavigate } from "react-router";
import AppInput from "../../../shared/AppInput";
import AppTextArea from "../../../shared/AppTextArea";
import AppButton from "../../../shared/AppButton";
import { useState } from "react";
import API, { contactUs } from "../../../endpoint";
import { toast } from "react-toastify";
import TradeFair from "../../../assets/images/TradeFair.jpg"
const ContactUs = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [contactInput, setContactInput] = useState({
    name: "",
    email: "",
    message: "",
  });
  const handleChangeMessage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setContactInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const handleChange = (event: { id: string; value: string }) => {
    const { id, value } = event;
    setContactInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleContactUs = () => {
    const payload = {
      fullName: contactInput.name,
      emailAddress: contactInput.email,
      message: contactInput.message,
    };
    setIsLoading(true);

    if (!payload.fullName || !payload.emailAddress || !payload.message) {
      toast.error("Please fill in all fields", {
        autoClose: 2000,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    } else {
      API.post(`${contactUs}`, payload).then((response) => {
        if (response.status === 200) {
          toast.success("Message sent successfully", {
            autoClose: 2000,
            position: "top-right",
          });
          setContactInput({
            name: "",
            email: "",
            message: "",
          });
          setIsLoading(false);
          setTimeout(() => {
            navigate(routerPath.HOMEPAGE);
          }, 2000);
        } else {
          toast.error("Failed to send message", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      });
    }
  };
  return (
    <div className="w-3/5 mx-auto">
      <div className="flex items-center py-3 text-primary-500">
        <p
          className="cursor-pointer"
          onClick={() => navigate(routerPath.HOMEPAGE)}
        >
          Home
        </p>
        <RxCaretRight />
        <p>Contact us</p>
      </div>
      <div className="flex gap-5 mt-4 mb-10 ">
        <div className="w-1/2">
          <img src={TradeFair} className="object-cover h-full" alt="" />
        </div>
        <div className="w-1/2 ">
          <div className="p-4 text-xl font-bold text-center">
            <p>Contact Us</p>
          </div>
          <div className="flex flex-col gap-5">
            <AppInput
              onChange={handleChange}
              type="text"
              value={contactInput.name}
              className="w-full px-6 py-3 rounded-sm outline-none bg-base-gray-200"
              id="name"
              placeholder="Enter name*"
            />
            <AppInput
              onChange={handleChange}
              type="email"
              value={contactInput.email}
              className="w-full px-6 py-3 rounded-sm outline-none bg-base-gray-200"
              id="email"
              placeholder="Email address*"
            />
            <AppTextArea
              onChange={handleChangeMessage}
              value={contactInput.message}
              error={""}
              rows={5}
              placeholder="Your message..."
              className="w-full p-2 px-4 mt-4 outline-none resize-vertical bg-base-gray-200"
              id="message"
            />
            <div>
              <AppButton
                className="p-2 rounded-md bg-primary-500 text-white-primary-400 w-[140px]"
                clickHandler={handleContactUs}
                loading={isLoading}
                title="Submit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
