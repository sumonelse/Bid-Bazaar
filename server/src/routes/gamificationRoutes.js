import express from "express"
import gamificationController from "../controllers/gamificationController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router()

// All gamification routes require authentication
router.use(verifyToken)

// Get user's gamification profile
router.get("/profile", gamificationController.getUserGamificationProfile)

// Get user's achievements
router.get("/achievements", gamificationController.getUserAchievements)

// Get user's badges
router.get("/badges", gamificationController.getUserBadges)

// Equip a badge
router.put("/badges/:badgeId/equip", gamificationController.equipBadge)

// Update display title
router.put("/title", gamificationController.updateDisplayTitle)

// Get leaderboard
router.get("/leaderboard", gamificationController.getLeaderboard)

// Update login streak
router.post("/streak", gamificationController.updateLoginStreak)

// Admin routes
router.get("/admin/achievements", gamificationController.getAllAchievements)
router.get("/admin/badges", gamificationController.getAllBadges)
router.post("/admin/initialize", gamificationController.initializeDefaults)

export default router
