import { useEffect, useState } from "react";
import { AiFillExclamationCircle } from "react-icons/ai";
import Modal from "../../components/universal/Modal";
import CustomAxios from "../../lib/actions/CustomAxios";

interface Notification {
  _id: string;
  NotifID: number;
  MedboxID: string;
  time: string;
  status: boolean;
  notificationType: string;
  drugType: string;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await CustomAxios("get", "/notifications");
      const sortedNotifs = response.data.sort((a: Notification, b: Notification) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setNotifications(sortedNotifs);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleIconClick = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsModalOpen(true);
  };

  const handleResolveIssue = async () => {
    if (!selectedNotif) return;

    try{
      await CustomAxios("put", `/notifications/${selectedNotif._id}`, { status: true });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === selectedNotif._id ? { ...n, status: true } : n
        )
      );
      setIsModalOpen(false);
      setSelectedNotif(null);
    } catch (error) {
      console.error("Failed to update notification status:", error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + ", " + date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-blue-900">Notifications</h1>
      <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div
              key={notif._id}
              className={`flex items-center justify-between border-gray-200 p-6 ${
                index !== notifications.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="mb-1 text-xs text-gray-400">
                  {formatDateTime(notif.time)}
                </span>
                
                <h2 className="mb-1 text-lg font-bold text-blue-900">
                  {notif.notificationType === "Daily Check In" 
                    ? "Daily Check-In Status" 
                    : "Medicine Consumption Status"}
                </h2>
                
                <p className="text-sm text-gray-600">
                  {notif.notificationType === "Daily Check In"
                    ? `Mobile App Check-In - ${formatDateOnly(notif.time)}`
                    : `Confirmation on Medicine Consumption – ${notif.drugType}`}
                </p>
              </div>
              <button 
                onClick={() => handleIconClick(notif)}
                className="ml-4 transition-transform hover:scale-110"
              >
                <AiFillExclamationCircle
                  className={`text-3xl ${
                    notif.status ? "text-blue-500" : "text-red-500"
                  }`}
                />
              </button>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">No notifications found.</div>
        )}
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="hidden" 
      >
        <div className="text-center p-4">
          {selectedNotif?.status ? (
            <div className="flex flex-col items-center">
               <h3 className="mb-4 text-xl font-bold text-blue-900">Status</h3>
               <p className="text-gray-700">No issues to be resolved</p>
               <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
               >
                  Close
               </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h3 className="mb-6 text-xl font-bold text-blue-900">Issue Resolved?</h3>
              <div className="flex gap-4">
                <button
                  onClick={handleResolveIssue}
                  className="rounded-md bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md bg-gray-300 px-6 py-2 text-gray-800 transition hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NotificationPage;

