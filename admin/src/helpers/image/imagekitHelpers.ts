/**
 * This function extracts the fileId from the hash
 */
export function extractFileIdFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    console.log("URL to extract fileId from:", url);
    // Check if URL has hash fragment
    if (!url.includes("#")) {
      console.warn("URL does not contain fileId hash:", url);
      return null;
    }

    // Extract fileId from hash: url#fileId -> fileId
    const parts = url.split("#");
    if (parts.length < 2) return null;

    const fileId = parts[1];

    // Remove query parameters if any (though hash should be after them)
    const cleanFileId = fileId.split("?")[0];

    return cleanFileId || null;
  } catch (error) {
    console.error("Error extracting fileId from URL:", error);
    return null;
  }
}
