// Helper function to parse cookies (shared across server routes)
export function parseCookies(
  cookieHeader: string | null,
): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const [name, value] = cookie.trim().split('=')
      cookies[name] = value
      return cookies
    },
    {} as Record<string, string>,
  )
}

// Helper to get access token from httpOnly cookie
export function getAccessTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  const cookies = parseCookies(cookieHeader)
  return cookies['access_token'] || null
}
