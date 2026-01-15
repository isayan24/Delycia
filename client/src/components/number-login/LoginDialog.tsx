"use client";
import React from "react";
import { FastForward, X } from "lucide-react";
import { ProgressBar } from "../smallComponents/ProgressBar";
import { OtpVerificationStep } from "../steps/OtpVerificationStep";
import { NameInputStep } from "../steps/NameInputStep";
import { PhoneInputStep } from "../steps/PhoneInputStep";
import { LoginMethod, ThemeColors } from "@/types/loginTypes";
import { useNotificationStore } from "@/store/notificationStore";
import { useLoginDialogStore } from "@/store/useLoginDialogStore";

interface LoginDialogProps {
  isOpen: boolean;
  currentStep: number;
  loginMethod: LoginMethod;
  countryCode: string;
  setCountryCode: (code: string) => void;
  mobileNumber: string;
  setMobileNumber: (number: string) => void;
  otp: string[];
  setOtp: (otp: string[]) => void;
  fullName: string;
  setFullName: (name: string) => void;
  showCountryDropdown: boolean;
  setShowCountryDropdown: (show: boolean) => void;
  isLoading: boolean;
  otpTimer: number;
  canResend: boolean;
  theme: ThemeColors;
  onPhoneSubmit: () => void;
  onOtpVerify: () => void;
  onOtpResend: () => void;
  onEditPhone: () => void;
  onFinalSubmit: () => void;
  onSwitchToSMS: () => void;
  onCancel: () => void;
  getStepTitle: () => string;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  currentStep,
  loginMethod,
  countryCode,
  setCountryCode,
  mobileNumber,
  setMobileNumber,
  otp,
  setOtp,
  fullName,
  setFullName,
  showCountryDropdown,
  setShowCountryDropdown,
  isLoading,
  otpTimer,
  canResend,
  theme,
  onPhoneSubmit,
  onOtpVerify,
  onOtpResend,
  onEditPhone,
  onFinalSubmit,
  onCancel,
  getStepTitle,
  onSwitchToSMS,
}) => {
  const { message, type, clearNotification } = useNotificationStore();
  const { closeLoginDialog } = useLoginDialogStore();

  if (!isOpen) return null;

  const handleSkip = () => {
    onCancel();
    clearNotification();
    closeLoginDialog();
  };  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] p-2">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${theme.primary} p-6 text-white relative `}
        >
          {currentStep != 2 && (
            <button
              onClick={handleSkip}
              className="absolute top-2 right-4 flex items-center gap-1 hover:bg-white hover:bg-opacity-20 rounded-full p-2 py-1 transition-all"
            >
              {/* <X className="w-5 h-5" /> */}
              Skip for now <FastForward className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-xl font-bold mb-2 max-[500px]:mt-6">
            {getStepTitle()}
          </h2>
          <ProgressBar currentStep={currentStep} totalSteps={3} />
        </div>

        {/* mark Firebase Status Display */}

        {message && (
          <div
            className={`mb-1 p-3 ${type === "success" ? "bg-green-50" : "bg-red-50"} border border-green-200 rounded-lg`}
          >
            <p
              className={`text-green-600 text-sm text-center font-medium ${type === "success" ? "text-green-800" : "text-red-800"}`}
            >
              {message}
            </p>
          </div>
        )}

        {/* Content Container */}
        <div className="relative h-80 overflow-hidden">
          {/* Step 0: Phone Number Input */}
          <div
            className={`absolute inset-0 p-6 transition-transform duration-500 ease-in-out ${
              currentStep === 0 ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <PhoneInputStep
              loginMethod={loginMethod}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              mobileNumber={mobileNumber}
              setMobileNumber={setMobileNumber}
              showCountryDropdown={showCountryDropdown}
              setShowCountryDropdown={setShowCountryDropdown}
              isLoading={isLoading}
              theme={theme}
              onSubmit={onPhoneSubmit}
              onSwitchToSMS={onSwitchToSMS}
            />
          </div>

          {/* Step 1: OTP Verification */}
          <div
            className={`absolute inset-0 p-6 transition-transform duration-500 ease-in-out ${
              currentStep === 1
                ? "translate-x-0"
                : currentStep === 0
                  ? "translate-x-full"
                  : "-translate-x-full"
            }`}
          >
            <OtpVerificationStep
              loginMethod={loginMethod}
              countryCode={countryCode}
              mobileNumber={mobileNumber}
              otp={otp}
              setOtp={setOtp}
              otpTimer={otpTimer}
              canResend={canResend}
              isLoading={isLoading}
              theme={theme}
              onVerify={onOtpVerify}
              onResend={onOtpResend}
              onEditPhone={onEditPhone}
            />
          </div>

          {/* Step 2: Full Name */}
          <div
            className={`absolute inset-0 p-6 transition-transform duration-500 ease-in-out ${
              currentStep === 2 ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <NameInputStep
              fullName={fullName}
              setFullName={setFullName}
              isLoading={isLoading}
              theme={theme}
              onSubmit={onFinalSubmit}
              onEditPhone={onEditPhone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
