import authService from "../services/authService.js"
import emailService from "../services/emailService.js"
import ApiResponse from "../utils/ApiResponse.js"

class AuthController {
    // Register a new user
    async register(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await authService.register(req.body)

            // Send welcome email
            try {
                await emailService.sendWelcomeEmail(result.user)
            } catch (emailError) {
                console.error("Welcome email error:", emailError)
                // Continue even if email fails
            }

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

    // Forgot password - request password reset
    async forgotPassword(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { email } = req.body

            if (!email) {
                return apiResponse.error("Email is required", 400)
            }

            // Generate reset token and save to user
            const { user, resetToken } =
                await authService.generatePasswordResetToken(email)

            // Send password reset email
            await emailService.sendPasswordResetEmail(user, resetToken)

            apiResponse.success(
                { email: user.email },
                "Password reset instructions sent to your email"
            )
        } catch (error) {
            console.error("Forgot password error:", error)

            // Don't reveal if email exists or not for security
            apiResponse.success(
                {
                    message:
                        "If your email is registered, you will receive password reset instructions",
                },
                "Request processed"
            )
        }
    }

    // Reset password with token
    async resetPassword(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { token, newPassword } = req.body

            if (!token || !newPassword) {
                return apiResponse.error(
                    "Token and new password are required",
                    400
                )
            }

            // Validate token and update password
            const result = await authService.resetPassword(token, newPassword)

            apiResponse.success(
                { email: result.email },
                "Password has been reset successfully"
            )
        } catch (error) {
            console.error("Reset password error:", error)

            if (
                error.message.includes("expired") ||
                error.message.includes("invalid")
            ) {
                return apiResponse.error(error.message, 400)
            }

            return apiResponse.error("Failed to reset password", 500)
        }
    }
}

export default new AuthController()
