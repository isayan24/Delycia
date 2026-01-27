export interface LoginCallbacks {
  onWhatsAppSubmit?: (
    fullPhoneNumber: string,
    countryCode: string,
    mobileNumber: string
  ) => Promise<string | any>;
  onSMSSubmit?: (
    fullPhoneNumber: string,
    countryCode: string,
    mobileNumber: string
  ) => Promise<string | any>;
  onOtpVerify?: (
    otpCode: string,
    phoneNumber: string,
    method: string
  ) => Promise<string | any>;
  onFinalSubmit?: (userData: UserData) => Promise<void>;
}

export interface UserData {
  phoneNumber: string;
  countryCode: string;
  mobileNumber: string;
  otp: string;
  fullName?: string; // Made optional since existing users won't need to provide this
  loginMethod: string;
  isExistingUser?: boolean; // New field to track user status
}

export interface CountryCode {
  code: string;
  country: string;
  name: string;
}

export type LoginMethod = "whatsapp" | "sms";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  accentHover: string;
  ring: string;
  border: string;
  bg: string;
}

export type OnWhatsAppSubmit = (
  fullPhoneNumber: string,
  countryCode: string,
  mobileNumber: string
) => Promise<string | any>;

export type OnSMSSubmit = (
  fullPhoneNumber: string,
  countryCode: string,
  mobileNumber: string
) => Promise<string | any>;

export type OnOtpVerify = (
  otpCode: string,
  phoneNumber: string
) => Promise<string | any>;

export type OnFinalSubmit = (userData: UserData) => Promise<void>;
