import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
})

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Add a response interceptor to handle token expiration and format errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors (expired token)
        if (error.response && error.response.status === 401) {
            // Only redirect if it's a token issue, not for invalid credentials
            if (
                error.response.data &&
                error.response.data.message !== "Invalid credentials"
            ) {
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                window.location.href = "/login"
            }
        }

        // Format the error for easier handling in catch blocks
        if (error.response && error.response.data) {
            error.message = error.response.data.message || error.message
        }

        return Promise.reject(error)
    }
)

export default api
