import { Order, GroupedOrder } from "@/types/Order";
import { getISTDateKey, getISTTimeComponents, formatISTDateTime } from "./dateUtils";

// mark Group orders by date, time, and customer - keeping each distinct order time separate
export const groupOrdersByDateAndCustomer = (orders: Order[]): GroupedOrder[] => {
  // If no orders, return empty array
  if (!orders || orders.length === 0) {
    return [];
  } 
   
  // Create a map to group orders by unique combination of timestamp and customer
  const orderGroups = new Map<string, Order[]>();
  
  // Group by unique combination of timestamp and customer ID
  orders.forEach(order => {
    if (!order.ordered_on) {
      return;  
    }
    
    // Get the timestamp in milliseconds to create very precise grouping
    const orderDate = new Date(order.ordered_on);
    const orderTimestamp = orderDate.getTime();
    
    // Create a unique key using exact timestamp (to the millisecond) and customer ID
    // This ensures even orders placed seconds apart are grouped separately
    const groupKey = `${orderTimestamp}_${order.customer_id}`;
    
    
    if (!orderGroups.has(groupKey)) {
      orderGroups.set(groupKey, []);
    }
    
    orderGroups.get(groupKey)?.push(order);
  });
  
  
  // Convert the map to the GroupedOrder[] structure
  const groupedArray: GroupedOrder[] = Array.from(orderGroups.entries()).map(([key, groupOrders]) => {
    // Calculate totals for this group
    const totalAmount = groupOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    // Use the improved IST formatter for the displayed time
    const latestOrderTime = formatISTDateTime(groupOrders[0].ordered_on);
    
    const group = {
      date: getISTDateKey(groupOrders[0].ordered_on),
      customer_id: String(groupOrders[0].customer_id),
      orders: groupOrders,
      totalAmount: totalAmount,
      orderCount: groupOrders.length,
      latestOrderTime: latestOrderTime,
      customer: groupOrders[0].customer,
      // Add timestamp as a new property for more precise sorting/identification
      timestamp: new Date(groupOrders[0].ordered_on).getTime()
    }; 
    
    return group;
  });
  
  // Sort by newest first
  groupedArray.sort((a, b) => {
    // Use timestamp if available, otherwise use ordered_on time
    const aTime = a.timestamp ?? new Date(a.orders[0].ordered_on).getTime();
    const bTime = b.timestamp ?? new Date(b.orders[0].ordered_on).getTime();
    return bTime - aTime;
  });
  
  return groupedArray;
}; 