import api from "./axios"
import { jwtDecode } from "jwt-decode"

// Register a new user
export const register = async (userData) => {
    try {
        const response = await api.post("/auth/register", userData)

        // Store token temporarily if needed (optional)
        // We don't store it permanently because we want the user to login explicitly
        const { token, user } = response.data.data

        return { token, user }
    } catch (error) {
        // Extract the error message from the response
        const errorMessage =
            error.response?.data?.message ||
            "An error occurred during registration"
        throw new Error(errorMessage)
    }
}

// Login user
export const login = async (credentials) => {
    try {
        // Transform credentials to match the server's expected format
        const loginData = {}

        // Check if the input is an email or username
        if (credentials.emailOrUsername) {
            const isEmail = credentials.emailOrUsername.includes("@")
            if (isEmail) {
                loginData.email = credentials.emailOrUsername
            } else {
                loginData.username = credentials.emailOrUsername
            }
        }

        // Add password
        loginData.password = credentials.password

        const response = await api.post("/auth/login", loginData)
        const { token, user } = response.data.data

        // Store token and user data in localStorage
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))

        return { token, user }
    } catch (error) {
        // Log detailed error information for debugging
        console.error("Login error details:", error.response?.data)

        // Extract the error message from the response
        const errorMessage =
            error.response?.data?.message || "Invalid credentials"
        throw new Error(errorMessage)
    }
}

// Logout user
export const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
}

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem("token")
    if (!token) return false

    try {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000

        // Check if token is expired
        return decoded.exp > currentTime
    } catch (error) {
        return false
    }
}

// Get current user
export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null

    try {
        return JSON.parse(userStr)
    } catch (error) {
        return null
    }
}

// Update user profile
export const updateProfile = async (userData) => {
    try {
        const response = await api.put("/user/profile", userData)

        // Update stored user data
        const updatedUser = response.data.data.user
        localStorage.setItem("user", JSON.stringify(updatedUser))

        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to update profile" }
    }
}

// Request password reset
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post("/auth/forgot-password", { email })
        return response.data.data
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to request password reset",
            }
        )
    }
}

// Reset password with token
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post("/auth/reset-password", {
            token,
            newPassword,
        })
        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to reset password" }
    }
}
