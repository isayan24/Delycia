import axiosInstance from "@/lib/axios";

export const getUserById = async (id: string, accessToken: string) => {
  try {
    const response = await axiosInstance.get(`/admin/users?id=${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    // Silently handle error and return null instead of throwing
    return null;
  }
};
