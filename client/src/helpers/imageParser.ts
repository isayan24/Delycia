/**
 * Parses a string representation of an array from the DB.
 * Handles formats like: "['url1', 'url2']" (single quotes) or '["url1", "url2"]' (double quotes).
 */
export const parseImageString = (
  imageInput: string | null | undefined,
): string[] => {
  if (!imageInput) return []

  // If it's already an array (unlikely from raw JSON string, but safe to check)
  if (Array.isArray(imageInput)) return imageInput

  try {
    // 1. Try standard JSON parse
    return JSON.parse(imageInput)
  } catch (e) {
    // 2. If JSON fails, it might be single quoted: ['url1', 'url2']
    try {
      // Remove the surrounding brackets []
      const content = imageInput.trim().replace(/^\[|\]$/g, '')

      if (!content) return []

      return content
        .split(',')
        .map((item) => {
          // Remove surrounding quotes (single or double) and whitespace
          return item.trim().replace(/^['"]|['"]$/g, '')
        })
        .filter(Boolean)
    } catch (err) {
      console.error('Error parsing image string:', err)
      return []
    }
  }
}
