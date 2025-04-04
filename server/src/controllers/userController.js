import userService from "../services/userService.js"
import ApiResponse from "../utils/ApiResponse.js"

class UserController {
    // Get user profile
    async getUserProfile(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const user = await userService.getUserProfile(req.user._id)
            return apiResponse.success(
                { user },
                "User profile retrieved successfully"
            )
        } catch (error) {
            console.error("Get user profile error:", error)

            if (error.message === "User not found") {
                return apiResponse.error(error.message, 404)
            }

            return apiResponse.error("Server error", 500)
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const user = await userService.updateProfile(req.user._id, req.body)
            return apiResponse.success({ user }, "Profile updated successfully")
        } catch (error) {
            console.error("Update profile error:", error)

            if (error.message === "User not found") {
                return apiResponse.error(error.message, 404)
            }

            return apiResponse.error("Server error", 500)
        }
    }

    // Update password
    async updatePassword(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { currentPassword, newPassword } = req.body

            if (!currentPassword || !newPassword) {
                return apiResponse.error(
                    "Please provide current and new password",
                    400
                )
            }

            const result = await userService.updatePassword(
                req.user._id,
                currentPassword,
                newPassword
            )
            return apiResponse.success(result, "Password updated successfully")
        } catch (error) {
            console.error("Update password error:", error)

            if (error.message === "User not found") {
                return apiResponse.error(error.message, 404)
            }

            if (error.message === "Current password is incorrect") {
                return apiResponse.error(error.message, 400)
            }

            return apiResponse.error("Server error", 500)
        }
    }

    // Get user's watchlist
    async getWatchlist(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10 } = req.query

            const result = await userService.getWatchlist(
                req.user._id,
                parseInt(page),
                parseInt(limit)
            )

            return apiResponse.success(
                result,
                "Watchlist retrieved successfully"
            )
        } catch (error) {
            console.error("Get watchlist error:", error)

            if (error.message === "User not found") {
                return apiResponse.error(error.message, 404)
            }

            return apiResponse.error("Server error", 500)
        }
    }

    // Get user's won auctions
    async getWonAuctions(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10 } = req.query

            const result = await userService.getWonAuctions(
                req.user._id,
                parseInt(page),
                parseInt(limit)
            )

            return apiResponse.success(
                result,
                "Won auctions retrieved successfully"
            )
        } catch (error) {
            console.error("Get won auctions error:", error)

            if (error.message === "User not found") {
                return apiResponse.error(error.message, 404)
            }

            return apiResponse.error("Server error", 500)
        }
    }

    // Get user's listings
    async getUserListings(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10, status } = req.query

            const result = await userService.getUserListings(
                req.user._id,
                parseInt(page),
                parseInt(limit),
                status
            )

            return apiResponse.success(
                result,
                "User listings retrieved successfully"
            )
        } catch (error) {
            console.error("Get user listings error:", error)

            if (error.message === "User not found") {
                return apiResponse.error(error.message, 404)
            }

            return apiResponse.error("Server error", 500)
        }
    }
}

export default new UserController()
