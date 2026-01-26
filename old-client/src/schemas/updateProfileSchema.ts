import { z } from "zod";
import { usernameValidation } from "./signUpSchema";
 

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
