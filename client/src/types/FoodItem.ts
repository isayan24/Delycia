export interface FoodItem {
  id: number | string;
  category_id: number;
  name: string;
  description: string;
  img: string;
  is_veg: number;
  cost_price: number;
  discount: number;
  sku: string;
  quantity: number;
  status: string;
  preparation_time: number;
  created_at: string;
  updated_at: string;
} 