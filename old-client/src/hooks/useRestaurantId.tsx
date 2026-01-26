"use client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";

export const useRestaurantId = (): string | null => {
  const [rid, setRid] = useState<string | null>(null);

  useEffect(() => {
    const restaurantId = getCookie("rid");
    setRid(restaurantId as string | null);
  }, []);

  return rid;
};
