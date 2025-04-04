import Notification from "../models/Notification.js"
import { getIO } from "../sockets/bidSocket.js"

class NotificationService {
    // Create a notification
    async createNotification(notificationData) {
        try {
            const notification = await Notification.create(notificationData)

            // Emit real-time notification to the user
            try {
                const io = getIO()

                // Format notification for client
                const formattedNotification = {
                    _id: notification._id,
                    type: notification.type,
                    message: notification.message,
                    productId: notification.productId,
                    readStatus: notification.readStatus,
                    timestamp: notification.timestamp,
                }

                // Send to user's personal room
                io.to(`user:${notification.userId}`).emit(
                    "new-notification",
                    formattedNotification
                )

                // Also send unread count
                const unreadCount = await Notification.countDocuments({
                    userId: notification.userId,
                    readStatus: false,
                })

                io.to(`user:${notification.userId}`).emit(
                    "notification-count",
                    { count: unreadCount }
                )
            } catch (socketError) {
                console.error("Socket notification error:", socketError)
                // Continue even if socket emission fails
            }

            return notification
        } catch (error) {
            throw error
        }
    }

    // Get user notifications with pagination
    async getUserNotifications(
        userId,
        page = 1,
        limit = 10,
        unreadOnly = false
    ) {
        try {
            const query = { userId }

            // Only get unread notifications if specified
            if (unreadOnly) {
                query.readStatus = false
            }

            const skip = (page - 1) * limit

            const notifications = await Notification.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)

            const total = await Notification.countDocuments(query)
            const unreadCount = await Notification.countDocuments({
                userId,
                readStatus: false,
            })

            return {
                notifications,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
                unreadCount,
            }
        } catch (error) {
            throw error
        }
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findById(notificationId)

            if (!notification) {
                throw new Error("Notification not found")
            }

            // Check if the notification belongs to the user
            if (notification.userId.toString() !== userId) {
                throw new Error("Not authorized to access this notification")
            }

            // Mark as read
            notification.readStatus = true
            await notification.save()

            // Emit updated unread count
            try {
                const io = getIO()

                // Get updated unread count
                const unreadCount = await Notification.countDocuments({
                    userId,
                    readStatus: false,
                })

                // Send to user's personal room
                io.to(`user:${userId}`).emit("notification-count", {
                    count: unreadCount,
                })
            } catch (socketError) {
                console.error("Socket notification count error:", socketError)
            }

            return notification
        } catch (error) {
            throw error
        }
    }

    // Mark all notifications as read
    async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { userId, readStatus: false },
                { $set: { readStatus: true } }
            )

            // Emit updated unread count (which will be 0)
            try {
                const io = getIO()
                io.to(`user:${userId}`).emit("notification-count", { count: 0 })

                // Also emit a notification-update event to refresh the list
                io.to(`user:${userId}`).emit("notifications-updated")
            } catch (socketError) {
                console.error("Socket notification update error:", socketError)
            }

            return {
                modifiedCount: result.modifiedCount,
                message: "All notifications marked as read",
            }
        } catch (error) {
            throw error
        }
    }

    // Delete notification
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await Notification.findById(notificationId)

            if (!notification) {
                throw new Error("Notification not found")
            }

            // Check if the notification belongs to the user
            if (notification.userId.toString() !== userId) {
                throw new Error("Not authorized to delete this notification")
            }

            await Notification.findByIdAndDelete(notificationId)

            return { message: "Notification deleted" }
        } catch (error) {
            throw error
        }
    }

    // Create ending soon notifications
    async createEndingSoonNotifications(
        productId,
        productTitle,
        watchlistUserIds
    ) {
        try {
            const notifications = []

            for (const userId of watchlistUserIds) {
                const notification = await this.createNotification({
                    userId,
                    type: "endingSoon",
                    message: `Auction for ${productTitle} is ending soon! Don't miss your chance to bid.`,
                    productId,
                    read: false,
                })

                notifications.push(notification)
            }

            return notifications
        } catch (error) {
            throw error
        }
    }
}

export default new NotificationService()
