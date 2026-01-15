import { z } from "zod";

export const inventorySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1 , { message: "Description is required" }),
    category_id: z.string().min(1 , { message: "Category id is required" }),
    img: z.string().min(1, { message: "Food image is required" }),
    is_veg: z.any(),
    cost_price: z.number().min(0, { message: "Cost price is required" }),
    discount: z.number(),
    quantity: z.number(),
    status: z.string().min(1, { message: "Availability status is required" }),
    preparation_time: z.number(),
    // sku: z.string()
})