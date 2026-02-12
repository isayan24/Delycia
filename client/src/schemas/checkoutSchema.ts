import { z } from 'zod'
// fix from checkout schema, no need of email
export const checkoutSchema = z.object({
  special_instruction: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
})
