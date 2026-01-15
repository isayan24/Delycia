import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must be at most 20 characters long")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username must only contain letters, numbers, and underscores"
  );

export const updatePasswordSchema = z.object({
  newPassword: z.string().min(4, "Password must be at least 4 characters"),
  confirmNewPassword: z
    .string()
    .min(4, "Password must be at least 4 characters"),
});

export const updateNameSchema = z.object({
  username: usernameValidation,
  name: z.string().min(6, "Full name must be at least 6 characters"),
  // email: z.string().email("Invalid email address"),
  phone_number: z
    .string()
    .refine((val) => !val || /^\d{10}$/.test(val), {
      message: "Phone number must be exactly 10 digits",
    })
    .optional(),
});
