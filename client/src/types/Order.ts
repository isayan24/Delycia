import { User } from './User';
import { FoodItem } from './FoodItem';

export interface OrderItem {
  id?: string;
  item_id: string | number;
  name: string;
  price: number;
  quantity: number;
  estimateTime?: string;
  image?: string;
  foodDetails?: FoodItem;
}

export interface Order {
  id: number | string;
  customer_id: number | string;
  item_id: number | string;
  quantity: number;
  order_status: string;
  payment_status: string;
  ordered_on: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  tableNumber?: string;
  items?: OrderItem[];
  rid?: number | string;
  // Formatted time fields
  ordered_on_ist?: string;
  created_at_ist?: string;
  updated_at_ist?: string;
  // Customer info
  customer?: User;
  // Food details
  foodDetails?: FoodItem;
}

export interface GroupedOrder {
  date: string;
  customer_id: string | number;
  orders: Order[];
  totalAmount: number;
  orderCount: number;
  latestOrderTime: string;
  customer?: User;
  // Timestamp for more precise sorting/identification
  timestamp?: number;
} 