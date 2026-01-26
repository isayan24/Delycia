import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { useRestaurantId } from "./useRestaurantId";


export const useInventoryItems = (categoryId?: string) => {
  const rid = useRestaurantId();
  const [items, setItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllItems = useCallback(async () => {
    try {
      const url = rid ? `/inventory?rid=${rid}` : "/inventory";
      const response = await axiosInstance.get(url);
      if (response.data && response.data.inventory) {
        setAllItems(response.data.inventory);
      } else {
        setAllItems([]);
      }
    } catch (err) {
      console.error("Error fetching all items:", err);
    }
  }, [rid]); 
  
  useEffect(() => {
    if (rid !== null) {
      fetchAllItems();
    }
  }, [rid, fetchAllItems]);

  const fetchData = useCallback(async () => {
    if (!categoryId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = rid
        ? `/inventory?category_id=${categoryId}&rid=${rid}`
        : `/inventory?category_id=${categoryId}`;
      const response = await axiosInstance.get(url);
  
      if (response.data && response.data.inventory) {
        setItems(response.data.inventory);
      } else {
        setItems([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  }, [categoryId, rid]);

  useEffect(() => {
    if (rid !== null) {
      fetchData();
    }
  }, [rid, fetchData]);

  return { items, loading, error, refetch: fetchData, allItems, fetchAllItems };
};
