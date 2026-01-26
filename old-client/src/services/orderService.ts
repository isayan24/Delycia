import axiosInstance from "@/lib/axios";
import { User } from "@/types/User";
import { FoodItem } from "@/types/FoodItem";
import { Order } from "@/types/Order"; 
import { parallelRequests, retryWithBackoff } from "@/utils/apiUtils";

// mark Cache for customer data to avoid duplicate fetches
const customerCache: Record<string, User> = {};

// mark Cache for food item data to avoid duplicate fetches
const foodItemCache: Record<string, FoodItem> = {};

// Function to fetch customer details
export const fetchCustomerDetails = async (customerId: string | number, token: string): Promise<User | null> => {
  // Check if customer data is already in cache
  if (customerCache[customerId]) {
    return customerCache[customerId];
  }

  try {
    // Make API request to get customer details with retry logic
    const response = await retryWithBackoff(() => 
      axiosInstance.get(`/admin/users?id=${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        // timeout: 5000
      })
    );

    if (response.data.status && response.data.users && response.data.users.length > 0) {
      const customerData = response.data.users[0];
      // Store in cache for future use
      customerCache[customerId] = customerData;
      return customerData;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching customer ${customerId} details:`, error);
    return null;
  }
};

// Function to fetch food item details
export const fetchFoodItemDetails = async (itemId: string | number, token: string, rid?: string | null): Promise<FoodItem | null> => {
  // Check if food item data is already in cache
  const cacheKey = String(itemId);
  if (foodItemCache[cacheKey]) {
    return foodItemCache[cacheKey];
  }

  try {
    // Make API request to get food item details with retry logic
    const url = rid ? `/inventory?id=${itemId}&rid=${rid}` : `/inventory?id=${itemId}`;
    const response = await retryWithBackoff(() =>
      axiosInstance.get(url , {
        // timeout: 8000
      })
    );

    if (response.data.status && response.data.inventory && response.data.inventory.length > 0) {
      const foodItemData = response.data.inventory[0];
      // Store in cache for future use
      foodItemCache[cacheKey] = foodItemData;
      return foodItemData;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching food item ${itemId} details:`, error);
    return null;
  }
};

// mark Function to enhance orders with customer details
export const enhanceOrdersWithCustomerDetails = async (orders: Order[], token: string): Promise<Order[]> => {
  if (!orders.length) return orders;

  // Get unique customer IDs
  const uniqueCustomerIds = [...new Set(orders.map(order => order.customer_id))];
  
  // Create a map for customer data
  const customerMap: Record<string, User> = {};
  
  try {
    // Process customer IDs in smaller batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < uniqueCustomerIds.length; i += batchSize) {
      const batch = uniqueCustomerIds.slice(i, i + batchSize);
      
      // Process each batch concurrently
      const customerResults = await parallelRequests(
        batch,
        async (customerId) => fetchCustomerDetails(customerId, token)
      );
      
      // Map customer data to the customer IDs
      batch.forEach((id, index) => {
        if (customerResults[index]) {
          customerMap[id] = customerResults[index];
        }
      });
    }
  } catch (error) {
    console.error("Error processing customer details:", error);
  }

  // Enhance orders with customer data
  return orders.map(order => ({
    ...order,
    customer: customerMap[order.customer_id] || undefined
  }));
};

// mark Function to enhance orders with food item details
export const enhanceOrdersWithFoodDetails = async (orders: Order[], token: string, rid?: string | null): Promise<Order[]> => {
  if (!orders.length) return orders;

  // Get unique item IDs
  const uniqueItemIds = [...new Set(orders.map(order => order.item_id))];
  
  // Create a map for food item data
  const foodItemMap: Record<string, FoodItem> = {};
  
  try {
    // Process food items in smaller batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < uniqueItemIds.length; i += batchSize) {
      const batch = uniqueItemIds.slice(i, i + batchSize);
      
      // Process each batch concurrently
      const foodItemResults = await parallelRequests(
        batch,
        async (itemId) => fetchFoodItemDetails(itemId, token, rid)
      );
      
      // Map food item data to the item IDs
      batch.forEach((id, index) => {
        if (foodItemResults[index]) {
          foodItemMap[String(id)] = foodItemResults[index];
        }
      });
    }
  } catch (error) {
    console.error("Error processing food item details:", error);
  }

  // Enhance orders with food item data
  return orders.map(order => ({
    ...order,
    foodDetails: foodItemMap[String(order.item_id)] || undefined
  }));
}; 