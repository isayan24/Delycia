"use client";
import { useNotificationStore } from "@/store/notificationStore";

export default function Notification() {
  const { message, type, clearNotification } = useNotificationStore();

  if (!type || !message) return null;

  let color = "bg-gray-200 text-gray-800";
  if (type === "success") color = "bg-green-100 text-green-800";
  if (type === "error") color = "bg-red-100 text-red-800";
  if (type === "info") color = "bg-blue-100 text-blue-800";

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 ${color}`}
      onClick={clearNotification}
      style={{ cursor: "pointer" }}
    >
      {message}
    </div>
  );
}