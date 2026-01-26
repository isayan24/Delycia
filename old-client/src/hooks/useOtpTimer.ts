import { useState, useEffect } from 'react';

export const useOtpTimer = (currentStep: number, initialTime: number = 30) => {
  const [otpTimer, setOtpTimer] = useState(initialTime);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 1 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimer]);

  const resetTimer = () => {
    setOtpTimer(initialTime);
    setCanResend(false);
  };

  return { otpTimer, canResend, resetTimer };
};