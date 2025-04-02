import Notification from "../models/Notification.js"

class NotificationService {
    // Create a notification
    async createNotification(notificationData) {
        try {
            const notification = await Notification.create(notificationData)
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
                read: false,
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
