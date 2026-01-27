import axios from "axios";
import qs from "qs"; // npm install qs

const axiosInstance = axios.create({
  // baseURL: "https://api.delycia.com/api/v1",
  baseURL: "http://localhost:8020/api/v1",
  withCredentials: true, // ensures cookies are sent automatically
});

axiosInstance.interceptors.request.use(
  (config) => {
    // For POST requests, transform JSON data to x-www-form-urlencoded format
    if (config.method === "post" && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      if (config.data) {
        config.data = qs.stringify(config.data);
      }
    }

    // Set Accept header for all requests
    config.headers["Accept"] = "application/json";
    return config;
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error("API Request Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      // eslint-disable-next-line no-console
      console.error(
        "API Response Error:",
        error?.response?.data || error.message
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error handling response:", err);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
