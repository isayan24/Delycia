import { z } from "zod";

export const mobileNumberSchema = z.object({
  mobileNumber: z
    .string()
    .length(10, "Invalid mobile number")
    .regex(/^\d{10}$/, "Mobile number must contain only digits"),
});

export const mobileOtpSchema = z.object({
  mobileOtp: z
    .string()
    .length(6, "Invalid OTP")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const fullNameSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name must contain only letters and spaces"),
});
