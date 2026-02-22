// Helper function to parse cookies (shared across server routes)
export function parseCookies(
  cookieHeader: string | null,
): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const parts = cookie.trim().split('=')
      const name = parts[0]
      const value = parts.slice(1).join('=')
      if (name) cookies[name] = value
      return cookies
    },
    {} as Record<string, string>,
  )
} // Helper to get access token from httpOnly cookie
export async function getAccessTokenFromCookie(): Promise<string | null> {
  try {
    const { getCookie } = await import('@tanstack/react-start/server')
    const token = getCookie('superadmin_access_token')
    console.log(
      '[server-cookies] getAccessTokenFromCookie:',
      token ? '<token present>' : 'null',
    )
    return token || null
  } catch (error) {
    console.error('[server-cookies] Error getting cookie:', error)
    return null
  }
}
