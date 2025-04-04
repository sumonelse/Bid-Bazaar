import authService from "../services/authService.js"
import ApiResponse from "../utils/ApiResponse.js"

class AuthController {
    // Register a new user
    async register(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await authService.register(req.body)
            apiResponse.success(result, "User registered successfully", 201)
        } catch (error) {
            console.error("Registration error:", error)

            // Check for specific error messages
            if (
                error.message.includes("already exists") ||
                error.message.includes("is required") ||
                error.message.includes("is already taken")
            ) {
                return apiResponse.error(error.message, 400)
            }

            return apiResponse.error(error.message || "Server error", 500)
        }
    }

    // Login user
    async login(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { email, username, password } = req.body

            if (!email && !username) {
                return apiResponse.error(
                    "Please provide email or username",
                    400
                )
            }
            if (!password) {
                return apiResponse.error("Please provide a password", 400)
            }

            const result = await authService.login(req.body)
            apiResponse.success(result, "Login successful")
        } catch (error) {
            console.error("Login error:", error)

            // Extract the actual error message
            const errorMessage = error.message.startsWith("Login failed: ")
                ? error.message.substring("Login failed: ".length)
                : error.message

            if (errorMessage === "Invalid credentials") {
                return apiResponse.error(errorMessage, 401)
            }

            return apiResponse.error(errorMessage || "Server error", 500)
        }
    }

    // Get current user
    async getCurrentUser(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const user = await authService.getCurrentUser(req.user._id)
            apiResponse.success(user, "User retrieved successfully")
        } catch (error) {
            console.error("Get current user error:", error)

            if (error.message.includes("not found")) {
                return apiResponse.error(error.message, 404)
            }

            return apiResponse.error(error.message || "Server error", 500)
        }
    }
}

export default new AuthController()
