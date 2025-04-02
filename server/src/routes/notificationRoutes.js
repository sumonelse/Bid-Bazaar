import express from "express"
import notificationController from "../controllers/notificationController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router()

// All notification routes require authentication
router.use(verifyToken)

router.get("/", notificationController.getUserNotifications)
router.put("/:id/read", notificationController.markAsRead)
router.put("/read-all", notificationController.markAllAsRead)
router.delete("/:id", notificationController.deleteNotification)

export default router
