import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    img : z.string().optional(),
})