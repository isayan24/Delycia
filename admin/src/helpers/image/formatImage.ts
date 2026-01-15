import { extractFileIdFromUrl } from "./imagekitHelpers";

// Helper function to format images
export const formatImageToArrayString = (images: string[]): string => {
  if (!Array.isArray(images) || images.length === 0) return "[]";
  return `['${images.join("','")}']`;
};

export const processImagesOneByOne = async (
  images: string[],
  callback: (imageUrl: string, index: number) => Promise<any>
): Promise<any[]> => {
  const results: any[] = [];

  for (let i = 0; i < images.length; i++) {
    const result = await callback(images[i], i);
    results.push(result);
  }

  console.log("results from processImagesOneByOne", results);
  return results;
};

export const deleteImagesOneByOne = async (
  imageUrls: string[],
  imagekit: any // ImageKit instance
): Promise<any> => {
  console.log("*** imageUrls ***", imageUrls);
  const results = await processImagesOneByOne(
    imageUrls,
    async (imageUrl, index) => {
      try {
        console.log(
          `Deleting image ${index + 1}/${imageUrls.length}: ${imageUrl}`
        );

        // Extract fileId from the URL
        const fileId = extractFileIdFromUrl(imageUrl);
        console.log("fileId", fileId);

        if (!fileId) {
          console.warn(`Could not extract fileId from URL: ${imageUrl}`);
          return { success: false, url: imageUrl, error: "No fileId found" };
        }
        // fix no id found
        console.log("fileId", fileId);
        // Delete using ImageKit SDK directly
        await imagekit.deleteFile(fileId);
        console.log(`✅ Successfully deleted image from ImageKit: ${imageUrl}`);

        return { success: true, url: imageUrl, fileId };
      } catch (error) {
        console.error(`❌ Error deleting image ${imageUrl}:`, error);
        return {
          success: false,
          url: imageUrl,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );

  console.log("Deletion results:", results);
  return results;
};
