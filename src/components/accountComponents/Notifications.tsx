import { useState } from "react";
import { Notification } from "../../helpers/interface/interfaces";
import MailOpen from "../../assets/svg/mailOpen";
import MailSvg from "../../assets/svg/mailSvg";
import DeleteSvg from "../../assets/svg/deleteSvg";

const notificationsData: Notification[] = [
  {
    notificationId: 1,
    messageSubject: "Order Confirmed - Order 367928532",
    messageBody: "25W Hot Melt Glue Gun has been confirmed.",
    status: 0,
    isChecked: false,
    isOpen: true,
    isRead: true,
  },
  {
    notificationId: 2,
    messageSubject: "Order Confirmed - Order 367928532",
    messageBody: "25W Hot Melt Glue Gun has been confirmed.",
    status: 0,
    isChecked: false,
    isOpen: false,
    isRead: true,
  },
  {
    notificationId: 3,
    messageSubject: "Order Confirmed - Order 367928532",
    messageBody: "25W Hot Melt Glue Gun has been confirmed.",
    status: 0,
    isChecked: false,
    isOpen: false,
    isRead: false,
  },
  {
    notificationId: 4,
    messageSubject: "Order Confirmed - Order 367928532",
    messageBody: "25W Hot Melt Glue Gun has been confirmed.",
    status: 0,
    isChecked: false,
    isOpen: false,
    isRead: false,
  },
  {
    notificationId: 5,
    messageSubject: "Order Confirmed - Order 367928532",
    messageBody: "25W Hot Melt Glue Gun has been confirmed.",
    status: 0,
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
        notification.notificationId === id
          ? { ...notification, isOpen: !notification.isOpen }
          : notification
      )
    );
  };

  const toggleCheckbox = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.notificationId === id
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
              <div className="cursor-pointer">
                <MailSvg />
              </div>
              <div className="cursor-pointer">
                <MailOpen />
              </div>
              <div className="cursor-pointer">
                <DeleteSvg />
              </div>
            </div>
          )}
        </div>
      </div>

      {notifications.map((notification) => (
        <div
          key={notification.notificationId}
          className="border border-gray-300 "
        >
          <div className="flex items-center justify-between p-4">
            <input
              type="checkbox"
              checked={notification.isChecked}
              onChange={() => toggleCheckbox(notification.notificationId)}
              className="mr-4 cursor-pointer"
            />
            <span
              onClick={() => toggleNotification(notification.notificationId)}
              className={`flex-1 cursor-pointer ${
                notification.isRead ? `` : `font-bold`
              }`}
            >
              {notification.messageSubject}
            </span>
          </div>
          {notification.isOpen && (
            <div className="p-4">{notification.messageBody}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
