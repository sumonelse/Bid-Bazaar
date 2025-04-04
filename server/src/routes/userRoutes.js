import express from "express"
import userController from "../controllers/userController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router()

// All user routes require authentication
router.use(verifyToken)

router.get("/profile", userController.getUserProfile)
router.put("/profile", userController.updateProfile)
router.put("/password", userController.updatePassword)
router.get("/watchlist", userController.getWatchlist)
router.get("/won-auctions", userController.getWonAuctions)
router.get("/listings", userController.getUserListings)

export default router
