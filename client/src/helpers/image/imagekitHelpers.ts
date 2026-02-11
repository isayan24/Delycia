
export function extractFileIdFromUrl(url: string): string | null {
  if (!url) return null

  try {
    // Check if URL has hash fragment
    if (!url.includes('#')) {
      console.warn('[imagekitHelpers] URL does not contain fileId hash:', url)
      return null
    }

    // Extract fileId from hash: url#fileId -> fileId
    const parts = url.split('#')
    if (parts.length < 2) return null

    const fileId = parts[1]

    // Remove query parameters if any (though hash should be after them)
    const cleanFileId = fileId.split('?')[0]

    return cleanFileId || null
  } catch (error) {
    console.error('[imagekitHelpers] Error extracting fileId from URL:', error)
    return null
  }
}


export async function deleteImagesOneByOne(
  imageUrls: string[],
  imagekitInstance: any
): Promise<Array<{ url: string; status: string; error?: string }>> {
  const results = []
  for (const url of imageUrls) {
    try {
      const fileId = extractFileIdFromUrl(url)
      
      if (!fileId) {
        results.push({
          url,
          status: 'error',
          error: 'No fileId found in URL',
        })
        continue
      }

      await imagekitInstance.deleteFile(fileId)
      results.push({ url, status: 'success' })
    } catch (error: any) {
      // Treat "not found" as success (image already deleted)
      if (error.message?.includes('NOT_FOUND') || error.statusCode === 404) {
        results.push({ url, status: 'success' })
      } else {
        console.error(`[imagekitHelpers] Failed to delete image ${url}:`, error)
        results.push({
          url,
          status: 'error',
          error: error.message || 'Unknown error',
        })
      }
    }
  }

  return results
}
