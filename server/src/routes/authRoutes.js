import express from "express"
import authController from "../controllers/authController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Register new user
router.post("/register", authController.register)

// Login user
router.post("/login", authController.login)

// Get current user (protected route)
router.get("/me", verifyToken, authController.getCurrentUser)

export default router
