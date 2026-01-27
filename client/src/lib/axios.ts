import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers['Accept'] = 'application/json'
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  (error) => {
    console.error('API Request Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      console.error(
        'API Response Error:',
        error?.response?.data || error.message,
      )
    } catch (err) {
      console.error('Error handling response:', err)
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
