import axiosInstance from '@/lib/axios'

export async function refreshAccessToken(token: any) {
  try {
    // Post with no payload; headers as third argument.
    const response = await axiosInstance.post('/users/auth/refresh', null, {
      headers: {
        Authorization: `Bearer ${token.refreshToken}`,
      },
    })
    console.log('***Refreshing token***')

    // Assuming your backend returns new tokens in response.data.
    return {
      ...token,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token ?? token.refreshToken,
    }
  } catch (error: any) {
    console.error('Failed to refresh token', error.message)
    return {
      ...token,
      error: 'Failed to refresh token',
    }
  }
}
