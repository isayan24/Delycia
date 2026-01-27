"use client";

import axiosInstance from "@/lib/axios";
import { deleteCookie } from "cookies-next";

export const createTempSession = async (user: any, code: any) => {
  try {
    // Check if both cookie and user exist
    if (!code) {
      console.log("No code found in cookie");
      return null;
    }

    if (!user || !user.id) {
      console.log("User or user.id not found");
      return null;
    }  
    // Make API call to temp-session endpoint
    const response = await axiosInstance.post(
      "/app/temp-session",
      {
        user_id: user.id,
        code,
      },
      // {
      //   headers: {
      //     "Content-Type": "application/x-www-form-urlencoded",
      //   },
      // }
    );

    // Remove the cookie after successful response
    // deleteCookie("code", {
    //   path: "/", // Make sure to match the path used when setting the cookie
    // }); 

    return response.data;
  } catch (error: any) {
    return null;
  }
};
