import React from 'react';
import { Phone, MessageCircle, RotateCcw, Edit, Check } from 'lucide-react';
 
import { LoginMethod, ThemeColors } from '../../types/loginTypes';
import { OtpInput } from '../smallComponents/OtpInput';
import { LoadingSpinner } from '../smallComponents/LoadingSpinner';

interface OtpVerificationStepProps {
  loginMethod: LoginMethod;
  countryCode: string;
  mobileNumber: string;
  otp: string[];
  setOtp: (otp: string[]) => void;
  otpTimer: number;
  canResend: boolean;
  isLoading: boolean;
  theme: ThemeColors;
  onVerify: () => void;
  onResend: () => void;
  onEditPhone: () => void;
}

export const OtpVerificationStep: React.FC<OtpVerificationStepProps> = ({
  loginMethod,
  countryCode,
  mobileNumber,
  otp,
  setOtp,
  otpTimer,
  canResend,
  isLoading,
  theme,
  onVerify,
  onResend,
  onEditPhone
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          {loginMethod === 'whatsapp' ? (
            <MessageCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Phone className="w-5 h-5 text-orange-600" />
          )}
          <span className={`text-sm font-medium ${theme.accent}`}>
            {loginMethod === 'whatsapp' ? 'WhatsApp Verification' : 'SMS Verification'}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Enter the 6-digit code sent to <span className={`font-semibold ${theme.accent}`}>{countryCode} {mobileNumber}</span>
          {loginMethod === 'whatsapp' ? ' via WhatsApp' : ' via SMS'}
        </p>
        
        <OtpInput otp={otp} setOtp={setOtp} theme={theme} />

        <div className="text-center mb-4">
          {canResend ? (
            <button
              onClick={onResend}
              className={`${theme.accent} ${theme.accentHover} font-medium flex items-center justify-center gap-1 mx-auto`}
            >
              <RotateCcw className="w-4 h-4" />
              Resend Code
            </button>
          ) : (
            <p className="text-gray-500">Resend code in {otpTimer}s</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEditPhone}
          className={`flex-1 border ${theme.border} ${theme.accent} py-3 rounded-lg font-semibold ${theme.bg} transition-all flex items-center justify-center gap-2`}
        >
          <Edit className="w-4 h-4" />
          Edit Number
        </button>
        <button
          onClick={onVerify}
          disabled={otp.join('').length < 6 || isLoading}
          className={`flex-1 bg-gradient-to-r ${theme.primary} ${theme.primaryHover} disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Check className="w-4 h-4" />
              Verify
            </>
          )}
        </button>
      </div>
    </div>
  );
};