"use client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";

export const useRestaurantId = (): string | null => {
  const [rid, setRid] = useState<string | null>(null);

  useEffect(() => {
    // Priority: sessionStorage (for /$username route) > cookie (for /res/$username route)
    const sessionRid = sessionStorage.getItem('currentRestaurantId');
    if (sessionRid) {
      setRid(sessionRid);
    } else {
      const cookieRid = getCookie("rid");
      setRid(cookieRid as string | null);
    }
  }, []);

  return rid;
};
