import { z } from "zod";

export const cartItemSchema = z.object({ 
  selectedItems: z.array(z.string()).min(1, "Please select at least one item"),
});
