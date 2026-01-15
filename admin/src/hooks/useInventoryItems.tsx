import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import { useRestaurantSelector } from "./useRestaurantSelector";

export const useInventoryItems = (categoryId?: string | null) => {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedRestaurant } = useRestaurantSelector();

  const rid = selectedRestaurant?.id;

  // Filter items based on categoryId
  const items = useMemo(() => {
    if (!categoryId || !allItems.length) {
      return allItems;
    }

    return allItems.filter((item) => item.category_id === categoryId);
  }, [allItems, categoryId]);

  const fetchAllItems = async () => {
    if (!rid) {
      setAllItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/inventory?rid=${rid}`);
      if (response.data && response.data.inventory) {
        setAllItems(response.data.inventory);
      } else {
        setAllItems([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching all items:", err);
      setError("Failed to load inventory items");
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all items when rid changes
  useEffect(() => {
    fetchAllItems();
  }, [rid]);

  const refetch = () => {
    return fetchAllItems();
  };

  return {
    items,
    loading,
    error,
    refetch,
    allItems,
    fetchAllItems,
  };
};
