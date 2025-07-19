// pages/AdminNotifications.jsx
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

const AdminNotifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`p-4 rounded shadow ${!n.isRead ? "bg-yellow-100" : "bg-white"}`}
            onClick={() => markAsRead(n.id)}
          >
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNotifications;
