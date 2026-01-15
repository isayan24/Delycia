import React from 'react';
import { ThemeColors } from '@/types/loginTypes';

interface OtpInputProps {
  otp: string[];
  setOtp: (otp: string[]) => void;
  theme: ThemeColors;
}

export const OtpInput: React.FC<OtpInputProps> = ({ otp, setOtp, theme }) => {
  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="flex justify-center gap-2 mb-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="tel"
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          className={`w-12 h-12 max-[400px]:w-10 max-[400px]:h-10 text-center border-2 border-gray-300 rounded-lg ${theme.ring} focus:border-transparent outline-none text-lg font-semibold transition-all`}
          maxLength={1}
        />
      ))}
    </div>
  );
};