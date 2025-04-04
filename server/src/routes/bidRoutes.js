import express from "express"
import bidController from "../controllers/bidController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Get bids for a product (public)
router.get("/product/:productId", bidController.getProductBids)

// Protected routes
router.post("/", verifyToken, bidController.placeBid)
router.get("/user", verifyToken, bidController.getUserBids)
router.get("/user/winning", verifyToken, bidController.getUserWinningBids)
router.get("/history", verifyToken, bidController.getUserBids) // Keep for backward compatibility

export default router
