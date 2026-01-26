import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";

export interface Restaurant {
  address: string | null;
  banner: string | null;
  city: string;
  description: string;
  email: string | null;
  id: number;
  is_active: number | null;
  is_veg_only: number | null;
  latitude: number | null;
  logo: string | null;
  longitude: number | null;
  name: string | null;
  phone_number: string | null;
  pincode: number | null;
  state: string | null;
  username: string;
}

interface UseRestaurantsProps {
  rid?: number | string | null;
}

export const useRestaurants = ({ rid }: UseRestaurantsProps = {}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (rid) {
          // Fetch single restaurant by ID
          const response = await axiosInstance.get(`/restaurant/?rid=${rid}`);
          setRestaurant(response.data?.restaurant_info || response.data);
          setRestaurants([]); // Clear restaurants array when fetching single
        } else {
          // Fetch all restaurants
          const response = await axiosInstance.get("/restaurant");
          setRestaurants(response.data?.restaurants || []);
          setRestaurant(null); // Clear single restaurant when fetching all
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch restaurant data");
        console.error("Error fetching restaurant data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rid]);

  return {
    restaurants,
    restaurant,
    loading,
    error,
  };
};
