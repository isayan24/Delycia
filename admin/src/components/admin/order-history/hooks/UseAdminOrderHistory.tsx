import { useState, useEffect, useMemo, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import {
  ApiOrder,
  TransformedOrder,
  transformOrderData,
  transformUserToCustomer,
} from "../utils/orderHistoryUtils";
import { getUserById } from "@/helpers/user/getUserById";

interface UseAdminOrdersProps {
  rid: string;
  accessToken: string | null;
  limit?: number;
}

export const UseAdminOrderHistory = ({
  rid,
  accessToken,
  limit = 50,
}: UseAdminOrdersProps) => {
  const [rawOrders, setRawOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform raw orders data with memoization to avoid re-processing
  const transformedOrders = useMemo(() => {
    try {
      return transformOrderData(rawOrders);
    } catch (transformError) {
      console.error("Error transforming order data:", transformError);
      setError("Failed to process order data");
      return [];
    }
  }, [rawOrders]);

  //Fetch customer data for orders
  const fetchCustomerData = useCallback(
    async (orders: TransformedOrder[]) => {
      if (!orders.length || !accessToken) return orders;

      const ordersWithCustomers = await Promise.all(
        orders.map(async (order) => {
          try {
            const response = await getUserById(
              order.customerId.toString(),
              accessToken
            );
            if (response && response?.message?.users) {
              const customer = transformUserToCustomer(
                response?.message?.users[0]
              );
              return {
                ...order,
                customer,
                customerName: customer.name,
              };
            } else {
              console.log(
                `❌ No user data in response for ID ${order.customerId}`
              );
            }
          } catch (error) {
            console.error(
              `❌ Failed to fetch customer ${order.customerId}:`,
              error
            );
          }
          return order;
        })
      );

      return ordersWithCustomers;
    },
    [accessToken]
  );

  // Enhanced orders with customer data
  const [ordersWithCustomers, setOrdersWithCustomers] = useState<
    TransformedOrder[]
  >([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Fetch customer data when transformed orders change
  useEffect(() => {
    if (transformedOrders.length > 0) {
      setCustomerLoading(true);
      fetchCustomerData(transformedOrders)
        .then(setOrdersWithCustomers)
        .finally(() => setCustomerLoading(false));
    } else {
      setOrdersWithCustomers([]);
    }
  }, [transformedOrders, fetchCustomerData]);

  // Use useCallback to memoize the fetch function and prevent infinite re-renders
  const fetchOrdersHistory = useCallback(async () => {
    if (!rid || !accessToken) {
      setRawOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/admin/orders`, {
        params: {
          rid,
          limit,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.orders) {
        setRawOrders(response.data.orders);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where response.data is directly an array
        setRawOrders(response.data);
      } else {
        setRawOrders([]);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching admin orders:", err);

      // More specific error handling
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Insufficient permissions.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === "NETWORK_ERROR") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load order history");
      }

      setRawOrders([]);
    } finally {
      setLoading(false);
    }
  }, [rid, accessToken, limit]); // Only depend on the actual parameters

  // Memoize the refresh function to prevent unnecessary re-renders
  const refreshHistory = useCallback(async () => {
    await fetchOrdersHistory();
  }, [fetchOrdersHistory]);

  useEffect(() => {
    fetchOrdersHistory();
  }, [fetchOrdersHistory]); // Now this won't cause infinite re-renders

  return {
    orderHistory:
      ordersWithCustomers.length > 0 ? ordersWithCustomers : transformedOrders,
    rawOrders,
    loading: loading || customerLoading,
    error,
    refreshHistory,
  };
};
