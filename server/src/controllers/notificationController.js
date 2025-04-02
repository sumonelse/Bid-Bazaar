import notificationService from "../services/notificationService.js"
import ApiResponse from "../utils/ApiResponse.js"

class NotificationController {
    // Get user notifications
    async getUserNotifications(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10, unreadOnly = false } = req.query
            const result = await notificationService.getUserNotifications(
                req.user._id,
                parseInt(page),
                parseInt(limit),
                unreadOnly === "true"
            )
            return apiResponse.success(result)
        } catch (error) {
            console.error("Get notifications error:", error)
            return apiResponse.error("Server error", 500)
        }
    }

    // Mark notification as read
    async markAsRead(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const notification = await notificationService.markAsRead(
                req.params.id,
                req.user._id
            )
            return apiResponse.success(notification)
        } catch (error) {
            console.error("Mark as read error:", error)
            const statusCode =
                error.message === "Notification not found"
                    ? 404
                    : error.message ===
                      "Not authorized to access this notification"
                    ? 403
                    : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Mark all notifications as read
    async markAllAsRead(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await notificationService.markAllAsRead(req.user._id)
            return apiResponse.success(result)
        } catch (error) {
            console.error("Mark all as read error:", error)
            return apiResponse.error("Server error", 500)
        }
    }

    // Delete notification
    async deleteNotification(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await notificationService.deleteNotification(
                req.params.id,
                req.user._id
            )
            return apiResponse.success(result)
        } catch (error) {
            console.error("Delete notification error:", error)
            const statusCode =
                error.message === "Notification not found"
                    ? 404
                    : error.message ===
                      "Not authorized to delete this notification"
                    ? 403
                    : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Get a specific notification
    async getNotification(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const notification = await notificationService.getNotification(
                req.params.id,
                req.user._id
            )
            return apiResponse.success(notification)
        } catch (error) {
            console.error("Get notification error:", error)
            const statusCode =
                error.message === "Notification not found" ? 404 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }
}

export default new NotificationController()
