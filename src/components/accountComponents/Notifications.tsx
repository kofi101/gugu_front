/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { NotificationProps } from "../../helpers/interface/interfaces";
import MailOpen from "../../assets/svg/mailOpen";
import MailSvg from "../../assets/svg/mailSvg";
import DeleteSvg from "../../assets/svg/deleteSvg";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import API, {
  deleteNotification,
  getNotifications,
  updateNoficationsAsRead,
  updateNoficationsAsUnRead,
} from "../../endpoint";

const Notifications = () => {
  const user = useSelector((store: any) => store?.user);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationProps[]>();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<
    number[]
  >([]);

  const handleFetchNotifications = () => {
    setLoading(true);
    API.get(`${getNotifications}/${user?.currentUser?.uid}`).then(
      (response) => {
        if (response.status === 200) {
          setNotifications(response.data);

          const unread = response.data.filter(
            (notification: NotificationProps) => notification.status === 0
          ).length;
          setUnreadNotifications(unread);

          setLoading(false);
        } else {
          setLoading(false);
          toast.error("Unable to fetch notifications.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      }
    );
  };

  const toggleNotification = (id: number) => {
    const toggledNotification = notifications?.find(
      (notification) => notification.notificationId === id
    );

    if (!toggledNotification) return;

    if (toggledNotification.status === 0) {
      API.put(`${updateNoficationsAsRead}`, { notificationId: [id] })
        .then((response) => {
          if (response.status === 200) {
            setNotifications(
              notifications?.map((notification) =>
                notification.notificationId === id
                  ? { ...notification, status: 1, isOpen: !notification.isOpen }
                  : notification
              )
            );

            setUnreadNotifications(unreadNotifications - 1);
          } else {
            toast.error("Failed to update notification status.", {
              autoClose: 2000,
              position: "top-right",
            });
          }
        })
        .catch((error) => {
          console.log("error", error);
          toast.error("An error occurred while updating the status.", {
            autoClose: 2000,
            position: "top-right",
          });
        });
    } else {
      setNotifications(
        notifications?.map((notification) =>
          notification.notificationId === id
            ? { ...notification, isOpen: !notification.isOpen }
            : notification
        )
      );
    }
  };

  const toggleCheckbox = (id: number) => {
    setSelectedNotificationIds((prev) =>
      prev.includes(id)
        ? prev.filter((notificationId) => notificationId !== id)
        : [...prev, id]
    );

    setNotifications(
      notifications?.map((notification) =>
        notification.notificationId === id
          ? { ...notification, isChecked: !notification.isChecked }
          : notification
      )
    );
  };

  const handleBulkMarkAsRead = () => {
    if (selectedNotificationIds.length === 0) return;
    API.put(`${updateNoficationsAsRead}`, { notificationId: selectedNotificationIds })
      .then((response) => {
        if (response.status === 200) {
          const updatedNotifications = notifications?.map((notification) =>
            selectedNotificationIds.includes(notification.notificationId)
              ? { ...notification, status: 1 }
              : notification
          );

          setNotifications(updatedNotifications);

          const unread = updatedNotifications?.filter(
            (notification) => notification.status === 0
          ).length;
          setUnreadNotifications(unread!);

          setSelectedNotificationIds([]);

          toast.success("Marked selected notifications as read.", {
            autoClose: 2000,
            position: "top-right",
          });
        } else {
          toast.error("Failed to update notification status.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("An error occurred while updating the status.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };
  const handleBulkMarkAsUnRead = () => {
    if (selectedNotificationIds.length === 0) return;
    API.put(`${updateNoficationsAsUnRead}`, { notificationId: selectedNotificationIds })
      .then((response) => {
        if (response.status === 200) {
          const updatedNotifications = notifications?.map((notification) =>
            selectedNotificationIds.includes(notification.notificationId)
              ? { ...notification, status: 0 }
              : notification
          );

          setNotifications(updatedNotifications);

          const unread = updatedNotifications?.filter(
            (notification) => notification.status === 0
          ).length;
          setUnreadNotifications(unread!);

          setSelectedNotificationIds([]);

          toast.success("Marked selected notifications as unread.", {
            autoClose: 2000,
            position: "top-right",
          });
        } else {
          toast.error("Failed to update notification status.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("An error occurred while updating the status.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  const handleDeleteNotification = () => {
    if (selectedNotificationIds.length === 0) return;
    API.delete(`${deleteNotification}`, {
      data: { data: selectedNotificationIds },
    })
      .then((response) => {
        if (response.status === 200) {
          const updatedNotifications = notifications?.filter(
            (notification) =>
              !selectedNotificationIds.includes(notification.notificationId)
          );

          setNotifications(updatedNotifications);

          const unread = updatedNotifications?.filter(
            (notification) => notification.status === 0
          ).length;
          setUnreadNotifications(unread!);

          setSelectedNotificationIds([]);

          toast.success("Notification deleted successfully.", {
            autoClose: 2000,
            position: "top-right",
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("An error occurred while deleting the notification.", {
          autoClose: 2000,
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    handleFetchNotifications();
  }, []);
  return (
    <div className="w-full bg-base-gray-200 h-[500px] overflow-y-scroll custom-scrollbar">
      <div>
        <div className="flex justify-between p-3 font-bold bg-gray-primary-400">
          <p>
            Notifications{" "}
            {unreadNotifications > 0 && (
              <span className="text-sm text-primary-400">
                ({unreadNotifications} unread)
              </span>
            )}
          </p>
          {notifications?.some((notification) => notification.isChecked) && (
            <div className="flex items-center justify-end space-x-4">
              <div className="cursor-pointer" onClick={handleBulkMarkAsUnRead}>
                <MailSvg />
              </div>
              <div className="cursor-pointer" onClick={handleBulkMarkAsRead}>
                <MailOpen />
              </div>
              <div
                className="cursor-pointer"
                onClick={handleDeleteNotification}
              >
                <DeleteSvg />
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center my-8 h-[400px]">
          <CircularProgress className="circularProgress !text-gray-primary-400" />
        </div>
      ) : (
        <div>
          {notifications?.map((notification) => (
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
                  onClick={() =>
                    toggleNotification(notification.notificationId)
                  }
                  className={`flex-1 cursor-pointer ${
                    notification.status === 1 ? `` : `font-bold`
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
      )}
    </div>
  );
};

export default Notifications;
