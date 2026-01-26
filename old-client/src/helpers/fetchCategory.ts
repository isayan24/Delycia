"use client";
import axiosInstance from "@/lib/axios";

export const fetchCategory = async (rid?: string | null) => {
  try {
    const url = rid ? `/categories?rid=${rid}` : "/categories";
    const response = await axiosInstance.get(url);

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch categories");
  }
};
