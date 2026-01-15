import { useCallback } from "react";
import axios from "axios";

interface ItemImage {
  id: string;
  image: string | null;
  previewImage: string | null;
  base64Data: string | null;
}

/**
 * Custom hook for handling image uploads and deletions
 * Uses /api/imagekit for both operations (POST for upload, DELETE for removal)
 */
export const useImageUpload = () => {
  const uploadImages = useCallback(
    async (images: ItemImage[]): Promise<string[]> => {
      const uploadPromises = images.map(async (image) => {
        const response = await axios.post("/api/imagekit", {
          base64Image: image.base64Data,
          fileName: `inventory_${Date.now()}.jpg`,
          folder: "/inventory",
        });

        if (response.status === 200) {
          return response.data?.url;
        }
        throw new Error(`Failed to upload image ${image.id}`);
      });

      const uploadedLinks = await Promise.all(uploadPromises);
      return uploadedLinks.filter(Boolean);
    },
    []
  );

  /**
   * Upload images for a single bulk item
   */
  const uploadBulkItemImages = useCallback(
    async (images: ItemImage[]): Promise<string[]> => {
      const uploadPromises = images.map(async (image) => {
        const response = await axios.post("/api/imagekit", {
          base64Image: image.base64Data,
          fileName: `inventory_${Date.now()}.jpg`,
          folder: "/inventory",
        });

        if (response.status === 200) {
          return response.data?.url;
        }
        throw new Error(`Failed to upload image ${image.id}`);
      });

      const uploadedLinks = await Promise.all(uploadPromises);
      return uploadedLinks.filter(Boolean);
    },
    []
  );

  /**
   * Upload images for update mode with old image deletion
   * Now accepts explicit list of URLs to delete (tracked when user clicks remove)
   */
  const uploadImagesWithCleanup = useCallback(
    async (
      currentImages: ItemImage[],
      imageUrlsToDelete: string[] = []
    ): Promise<string[]> => {
      try {
        // Delete removed images from ImageKit via DELETE /api/imagekit
        if (imageUrlsToDelete.length > 0) {
          const deleteResponse = await axios.delete("/api/imagekit", {
            data: { imageUrls: imageUrlsToDelete },
          });
        }

        // Upload new images (those with base64Data) and keep existing ones
        const uploadPromises = currentImages.map(async (image) => {
          if (image.base64Data) {
            // New image - upload it
            const response = await axios.post("/api/imagekit", {
              base64Image: image.base64Data,
              fileName: `inventory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
              folder: "/inventory",
            });

            if (response.status === 200) {
              return response.data?.url;
            }
            throw new Error(`Failed to upload image ${image.id}`);
          } else if (image.image) {
            // Existing image - keep it
            return image.image;
          }
          return null;
        });

        const uploadedLinks = await Promise.all(uploadPromises);
        return uploadedLinks.filter((url): url is string => url !== null);
      } catch (error) {
        console.error("Error in uploadImagesWithCleanup:", error);
        throw error;
      }
    },
    []
  );

  return {
    uploadImages,
    uploadBulkItemImages,
    uploadImagesWithCleanup,
  };
};
