// types/addItemModal.ts

export interface Category {
  id: number | string;
  name: string;
}

export interface CategoryImage {
  image: string | null;
  previewImage: string | null;
  base64Data: string | null;
}
export interface ItemImage {
  id: string; // Added id property
  image: string | null;
  previewImage: string | null;
  base64Data: string | null; 
}

export interface FormData {
  name: string;
  description: string;
  foodType: "Veg" | "Non-Veg";
  category_id: number;
  is_veg: 0 | 1;
  discount: number;
  stock: number;
  price: number | any;
  cost: number | any;
}

export interface Errors {
  name?: boolean;
  description?: boolean;
  category_id?: boolean;
  image?: boolean;
  price?: boolean;
  cost?: boolean;
  stock?: boolean;
}

export interface AddItemDetailsModalProps {
  categories: Category[];
  categoryId: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => void;
}
export interface UpdateItemDetailsModalProps {
  categories: Category[];
  categoryId: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => void;
  currentFoodItem: any;
}

export interface PreviewData {
  name: string;
  description: string;
  foodType: string;
  price: number;
  image: string | null;
  cost: number;
}

// Additional utility types that might be useful
export type FoodType = "Veg" | "Non-Veg";
export type ErrorField = keyof Errors;
export type FormField = keyof FormData;
