import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CountryCode, ThemeColors } from '@/types/loginTypes';
import { COUNTRY_CODES } from '../../../constants/countryCodes';

interface CountrySelectorProps {
  countryCode: string;
  setCountryCode: (code: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  theme: ThemeColors;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  countryCode,
  setCountryCode,
  showDropdown,
  setShowDropdown,
  theme
}) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 ${theme.ring} focus:border-transparent outline-none transition-all min-w-[80px]`}
      >
        <span className="font-medium">{countryCode}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {COUNTRY_CODES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                setCountryCode(country.code);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
            >
              <span className="font-medium">{country.name}</span>
              <span className="text-gray-500">{country.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};