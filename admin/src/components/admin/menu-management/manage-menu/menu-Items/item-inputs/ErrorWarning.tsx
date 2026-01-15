import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorWarning({ showWarning, errorFields }:any) {
  if (!showWarning) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-red-800 font-medium">
            Please fill in all required fields
          </p>
          <p className="text-red-600 text-sm mt-1">
            Missing: {errorFields.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}