// getUser.ts
import axiosInstance from "@/lib/axios"; 

export const getUser = async (accessToken: string) => {
  try {
    const response = await axiosInstance.get("/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    // Silently handle error and return null instead of throwing
    return null;
  }
};
