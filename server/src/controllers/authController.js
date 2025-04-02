import authService from "../services/authService.js"
import ApiResponse from "../utils/ApiResponse.js"

class AuthController {
    // Register a new user
    async register(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await authService.register(req.body)
            apiResponse.success(result, "User  registered successfully", 201)
        } catch (error) {
            console.error("Registration error:", error)

            if (error.message === "User  already exists") {
                return apiResponse.error(error.message, 400)
            }

            apiResponse.error("Server error", 500)
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

            if (error.message === "Invalid credentials") {
                return apiResponse.error(error.message, 401)
            }

            apiResponse.error("Server error", 500)
        }
    }

    // Get current user
    async getCurrentUser(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const user = await authService.getCurrentUser(req.user._id)
            apiResponse.success(user, "User  retrieved successfully")
        } catch (error) {
            console.error("Get current user error:", error)

            if (error.message === "User  not found") {
                return apiResponse.error(error.message, 404)
            }

            apiResponse.error("Server error", 500)
        }
    }
}

export default new AuthController()
