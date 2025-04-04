import { createContext, useContext, useState, useEffect } from "react"
import {
    login as loginService,
    logout as logoutService,
    register as registerService,
    getCurrentUser,
    isAuthenticated as checkAuth,
    updateProfile as updateProfileService,
} from "../api/authService"

// Create the context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext)
}

// Provider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Initialize auth state on component mount
    useEffect(() => {
        const initAuth = () => {
            const authenticated = checkAuth()
            setIsAuthenticated(authenticated)

            if (authenticated) {
                const user = getCurrentUser()
                setCurrentUser(user)
            }

            setLoading(false)
        }

        initAuth()
    }, [])

    // Register function
    const register = async (userData) => {
        setError(null)
        try {
            const response = await registerService(userData)
            return response
        } catch (err) {
            const errorMessage = err.message || "Registration failed"
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    // Login function
    const login = async (credentials) => {
        setError(null)
        try {
            const { user } = await loginService(credentials)

            // Make sure we have a valid user object
            if (!user || typeof user !== "object") {
                throw new Error("Invalid user data received from server")
            }

            setCurrentUser(user)
            setIsAuthenticated(true)
            return user
        } catch (err) {
            console.error("Login error in AuthContext:", err)
            const errorMessage = err.message || "Login failed"
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    // Logout function
    const logout = () => {
        logoutService()
        setCurrentUser(null)
        setIsAuthenticated(false)
    }

    // Update user data in context
    const updateUser = (userData) => {
        setCurrentUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
    }

    // Update user profile
    const updateUserProfile = async (userData) => {
        setError(null)
        try {
            const { user } = await updateProfileService(userData)
            setCurrentUser(user)
            updateUser(user)
            return user
        } catch (err) {
            const errorMessage = err.message || "Failed to update profile"
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    // Context value
    const value = {
        currentUser,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        register,
        updateUser,
        updateUserProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
