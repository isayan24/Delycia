
import React, { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { WifiOff, RotateCcw } from "lucide-react";

export const NetworkOfflineNotification: React.FC = () => {
  const isOnline = useNetworkStatus();
  const [show, setShow] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Show notification when offline
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
    } else {
      // If we were offline and now we are online, reload the page to fetch fresh data
      if (wasOffline) {
        window.location.reload();
      }

      // Hide with a small delay for animation if needed, or immediately
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ease-in-out ${
        show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-white border border-red-200 rounded-full shadow-lg px-6 py-3 flex items-center space-x-4 animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-center space-x-2 text-red-600">
          <WifiOff className="w-5 h-5" />
          <span className="font-medium text-sm">No Internet Connection</span>
        </div>

        <div className="h-4 w-px bg-gray-200 mx-2" />

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <RotateCcw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default NetworkOfflineNotification;
