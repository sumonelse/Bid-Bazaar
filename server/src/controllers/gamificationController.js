import gamificationService from "../services/gamificationService.js"
import ApiResponse from "../utils/ApiResponse.js"
import Achievement from "../models/Achievement.js"
import Badge from "../models/Badge.js"

class GamificationController {
    // Get user's gamification profile
    async getUserGamificationProfile(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const profile =
                await gamificationService.getUserGamificationProfile(
                    req.user._id
                )
            return apiResponse.success(
                profile,
                "Gamification profile retrieved successfully"
            )
        } catch (error) {
            console.error("Get gamification profile error:", error)
            return apiResponse.error(
                "Failed to retrieve gamification profile",
                500
            )
        }
    }

    // Get user's achievements
    async getUserAchievements(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const achievements = await gamificationService.getUserAchievements(
                req.user._id
            )
            return apiResponse.success(
                achievements,
                "User achievements retrieved successfully"
            )
        } catch (error) {
            console.error("Get user achievements error:", error)
            return apiResponse.error(
                "Failed to retrieve user achievements",
                500
            )
        }
    }

    // Get user's badges
    async getUserBadges(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const badges = await gamificationService.getUserBadges(req.user._id)
            return apiResponse.success(
                badges,
                "User badges retrieved successfully"
            )
        } catch (error) {
            console.error("Get user badges error:", error)
            return apiResponse.error("Failed to retrieve user badges", 500)
        }
    }

    // Equip a badge
    async equipBadge(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { badgeId } = req.params

            if (!badgeId) {
                return apiResponse.error("Badge ID is required", 400)
            }

            const result = await gamificationService.equipBadge(
                req.user._id,
                badgeId
            )
            return apiResponse.success(result, "Badge equipped successfully")
        } catch (error) {
            console.error("Equip badge error:", error)

            if (error.message === "Badge not found or not unlocked") {
                return apiResponse.error(error.message, 404)
            }

            return apiResponse.error("Failed to equip badge", 500)
        }
    }

    // Update display title
    async updateDisplayTitle(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { title } = req.body

            if (!title) {
                return apiResponse.error("Display title is required", 400)
            }

            const result = await gamificationService.updateDisplayTitle(
                req.user._id,
                title
            )
            return apiResponse.success(
                { title: result },
                "Display title updated successfully"
            )
        } catch (error) {
            console.error("Update display title error:", error)
            return apiResponse.error("Failed to update display title", 500)
        }
    }

    // Get leaderboard
    async getLeaderboard(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { category = "level", limit = 10 } = req.query
            const leaderboard = await gamificationService.getLeaderboard(
                category,
                parseInt(limit)
            )
            return apiResponse.success(
                leaderboard,
                "Leaderboard retrieved successfully"
            )
        } catch (error) {
            console.error("Get leaderboard error:", error)
            return apiResponse.error("Failed to retrieve leaderboard", 500)
        }
    }

    // Update user's login streak
    async updateLoginStreak(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const streak = await gamificationService.updateLoginStreak(
                req.user._id
            )
            return apiResponse.success(
                streak,
                "Login streak updated successfully"
            )
        } catch (error) {
            console.error("Update login streak error:", error)
            return apiResponse.error("Failed to update login streak", 500)
        }
    }

    // Get all achievements (for admin)
    async getAllAchievements(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            // Check if user is admin
            if (req.user.role !== "admin") {
                return apiResponse.error("Unauthorized", 403)
            }

            const achievements = await Achievement.find().sort({
                category: 1,
                tier: 1,
            })
            return apiResponse.success(
                achievements,
                "All achievements retrieved successfully"
            )
        } catch (error) {
            console.error("Get all achievements error:", error)
            return apiResponse.error("Failed to retrieve achievements", 500)
        }
    }

    // Get all badges (for admin)
    async getAllBadges(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            // Check if user is admin
            if (req.user.role !== "admin") {
                return apiResponse.error("Unauthorized", 403)
            }

            const badges = await Badge.find().sort({ category: 1, rarity: 1 })
            return apiResponse.success(
                badges,
                "All badges retrieved successfully"
            )
        } catch (error) {
            console.error("Get all badges error:", error)
            return apiResponse.error("Failed to retrieve badges", 500)
        }
    }

    // Initialize default achievements and badges (for admin)
    async initializeDefaults(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            // Check if user is admin
            if (req.user.role !== "admin") {
                return apiResponse.error("Unauthorized", 403)
            }

            await gamificationService.initializeDefaultAchievements()
            await gamificationService.initializeDefaultBadges()

            return apiResponse.success(
                null,
                "Default achievements and badges initialized successfully"
            )
        } catch (error) {
            console.error("Initialize defaults error:", error)
            return apiResponse.error("Failed to initialize defaults", 500)
        }
    }
}

export default new GamificationController()
