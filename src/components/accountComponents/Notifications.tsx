import { useState } from "react";
import { Notification } from "../../helpers/interface/interfaces";
import MailOpen from "../../assets/svg/mailOpen";
import MailSvg from "../../assets/svg/mailSvg";
import DeleteSvg from "../../assets/svg/deleteSvg";

const notificationsData: Notification[] = [
  {
    id: 1,
    title: "Order Confirmed - Order 367928532",
    content: "25W Hot Melt Glue Gun has been confirmed.",
    isChecked: false,
    isOpen: true,
    isRead: true,
  },
  {
    id: 2,
    title: "Order Confirmed - Order 367928532",
    content: "25W Hot Melt Glue Gun has been confirmed.",
    isChecked: false,
    isOpen: false,
    isRead: true,
  },
  {
    id: 3,
    title: "Order Confirmed - Order 367928532",
    content: "25W Hot Melt Glue Gun has been confirmed.",
    isChecked: false,
    isOpen: false,
    isRead: false,
  },
  {
    id: 4,
    title: "Order Confirmed - Order 367928532",
    content: "25W Hot Melt Glue Gun has been confirmed.",
    isChecked: false,
    isOpen: false,
    isRead: false,
  },
  {
    id: 5,
    title: "Order Confirmed - Order 367928532",
    content: "25W Hot Melt Glue Gun has been confirmed.",
    isChecked: false,
    isOpen: false,
    isRead: false,
  },
];
const Notifications = () => {
  const [notifications, setNotifications] = useState(notificationsData);

  const toggleNotification = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isOpen: !notification.isOpen }
          : notification
      )
    );
  };

  const toggleCheckbox = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isChecked: !notification.isChecked }
          : notification
      )
    );
  };
  return (
    <div className="w-full bg-base-gray-200 h-[500px] overflow-y-scroll custom-scrollbar">
      <div>
        <div className="flex justify-between p-3 font-bold bg-gray-primary-400">
          <p>Notifications</p>
          {notifications.some((notification) => notification.isChecked) && (
            <div className="flex justify-end space-x-4">
              <MailSvg />
              <MailOpen />
              <DeleteSvg />
            </div>
          )}
        </div>
      </div>

      {notifications.map((notification) => (
        <div key={notification.id} className="border border-gray-300 ">
          <div className="flex items-center justify-between p-4">
            <input
              type="checkbox"
              checked={notification.isChecked}
              onChange={() => toggleCheckbox(notification.id)}
              className="mr-4 cursor-pointer"
            />
            <span
              onClick={() => toggleNotification(notification.id)}
              className={`flex-1 cursor-pointer ${
                notification.isRead ? `` : `font-bold`
              }`}
            >
              {notification.title}
            </span>
          </div>
          {notification.isOpen && (
            <div className="p-4">{notification.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
