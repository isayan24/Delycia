"use client";
import { toast } from "sonner"; // or your toast library
import { AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

const useToast = () => {
  const showError = (title: any, description: any) => {
    toast.error(title, {
      description,
      style: { backgroundColor: "#fef2f2", border: "1px solid #fb2c36" },
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    });
  };

  const showSuccess = (title: any, description: any) => {
    toast.success(title, {
      description, 
      style: {
        backgroundColor: "#f0fdf4",
        border: "1px solid #22c55e", 
      },
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
  };

  const showInfo = (title: any, description: any) => {
    toast.info(title, {
      description,
      style: { backgroundColor: "#eff6ff", border: "1px solid #3b82f6" },
      icon: <Info className="h-5 w-5 text-blue-500" />,
    });
  };

  const showWarning = (title: any, description: any) => {
    toast.warning(title, {
      description,
      style: { backgroundColor: "#fffbeb", border: "1px solid #f59e0b" },
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    });
  };

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
  };
};

export default useToast;
