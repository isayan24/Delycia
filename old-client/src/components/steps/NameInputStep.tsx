import React from "react";
import { User, Edit, LogIn } from "lucide-react";
import { ThemeColors } from "../../types/loginTypes";
import { LoadingSpinner } from "../smallComponents/LoadingSpinner";
import { useAuthContext } from "@/context/AuthProvider";

interface NameInputStepProps {
  fullName: string;
  setFullName: (name: string) => void;
  isLoading: boolean;
  theme: ThemeColors;
  onSubmit: () => void;
  onEditPhone: () => void;
}

export const NameInputStep: React.FC<NameInputStepProps> = ({
  fullName,
  setFullName,
  isLoading,
  theme,
  onSubmit,
  onEditPhone, 
}) => {
  const { user } = useAuthContext();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name{" "}
          <span className="text-green-500 text-xs">
            for number {user?.phone_number ?? ""}
          </span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg ${theme.ring} focus:border-transparent outline-none transition-all`}
            placeholder="Enter your full name"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          This will be used for your profile
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEditPhone}
          className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Number
        </button> 
        <button
          onClick={onSubmit}
          disabled={!fullName.trim() || isLoading}
          className={`flex-1 bg-gradient-to-r ${theme.primary} ${theme.primaryHover} disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Login
            </>
          )}
        </button>
      </div>
    </div>
  );
};
