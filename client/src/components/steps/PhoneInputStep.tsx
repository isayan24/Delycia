import React from 'react';
import { Phone, ArrowRight, MessageCircle } from 'lucide-react';
import { CountrySelector } from '../smallComponents/CountrySelector';
import { LoadingSpinner } from '../smallComponents/LoadingSpinner';
import { LoginMethod, ThemeColors } from '../../types/loginTypes';

interface PhoneInputStepProps {
  loginMethod: LoginMethod;
  countryCode: string;
  setCountryCode: (code: string) => void;
  mobileNumber: string;
  setMobileNumber: (number: string) => void;
  showCountryDropdown: boolean;
  setShowCountryDropdown: (show: boolean) => void;
  isLoading: boolean;
  theme: ThemeColors;
  onSubmit: () => void;
  onSwitchToSMS: () => void;
}

export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({
  loginMethod,
  countryCode,
  setCountryCode,
  mobileNumber,
  setMobileNumber,
  showCountryDropdown,
  setShowCountryDropdown,
  isLoading,
  theme,
  onSubmit,
  onSwitchToSMS
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
            {loginMethod === 'whatsapp' ? 'WhatsApp Login' : 'SMS Login'}
          </span>
        </div>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number
        </label>
        <div className="flex gap-2">
          <CountrySelector
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            showDropdown={showCountryDropdown}
            setShowDropdown={setShowCountryDropdown}
            theme={theme}
          />
          
          <div className="flex-1 relative">
            {loginMethod === 'whatsapp' ? (
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            ) : (
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            )}
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg ${theme.ring} focus:border-transparent outline-none transition-all`}
              placeholder="Enter 10-digit mobile number"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {loginMethod === 'whatsapp' 
            ? 'We will send you a verification code via WhatsApp' 
            : 'We will send you a verification code via SMS'
          }
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onSubmit}
          disabled={mobileNumber.length < 10 || isLoading}
          className={`w-full bg-gradient-to-r ${theme.primary} ${theme.primaryHover} disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              Send Code
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        
        {loginMethod === 'whatsapp' && (
          <div className="text-center">
            <button
              onClick={onSwitchToSMS}
              className="text-sm text-gray-500 hover:text-orange-600 transition-all duration-200 flex items-center justify-center gap-1 mx-auto underline"
            >
              <Phone className="w-4 h-4" />
              Login with SMS instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};