import axiosInstance from '@/lib/axios'

export interface RefreshResult {
  accessToken: string
  refreshToken: string
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResult | null> {
  try {
    // Post with no payload; headers as third argument.
    const response = await axiosInstance.post('/users/auth/refresh', null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
    console.log('***Refreshing token success***')

    return {
      accessToken:
        response.data.data.access_token || response.data.access_token,
      refreshToken:
        response.data.data.refresh_token ||
        response.data.refresh_token ||
        refreshToken,
    }
  } catch (error: any) {
    console.error('Failed to refresh token', error.message)
    return null
  }
}
