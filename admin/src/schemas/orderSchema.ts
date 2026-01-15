import { z } from "zod";

export const orderSchema = z.object({
    id: z.number(),
    customerName: z.string(),
    phone_number: z.string(),
    table_number: z.number(),
    total_price: z.number(),
    payment_status: z.string(),
    payment_method: z.string(),
    order_time: z.string(),

    status: z.string(),
    target: z.string(),
    limit: z.string(),
    reviewer: z.string(),
  });