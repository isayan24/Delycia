import axios from 'axios'

export const getUserById = async (id: string) => {
  try {
    // Use axios directly (not axiosInstance) to call local TanStack Start server route
    // This will automatically send httpOnly cookies
    const response = await axios.get(`/api/users`, {
      params: { id },
      withCredentials: true,
    })

    return response.data
  } catch (error) {
    // Silently handle error and return null instead of throwing
    return null
  }
}
