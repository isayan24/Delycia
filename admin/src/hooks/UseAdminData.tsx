import axiosInstance from "@/lib/axios";
import React, { useEffect, useState } from "react";

export default function UseAdminData(accessToken: any) {
  const [userData, setUserData] = useState<any>([]);

  useEffect(() => {
    if (accessToken) {
      getUserData();
    }
  }, [accessToken]);

  const getUserData = async () => {
    try {
      const response = await axiosInstance.get("/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUserData(response?.data?.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return {
    userData,
    getUserData,
  };
}
