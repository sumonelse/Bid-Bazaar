import api from "./axios"

// Get all notifications for the current user
export const getNotifications = async () => {
    try {
        const response = await api.get("/notifications")
        return response.data
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to fetch notifications" }
        )
    }
}

// Mark a notification as read
export const markAsRead = async (notificationId) => {
    try {
        const response = await api.put(`/notifications/${notificationId}/read`)
        return response.data
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to mark notification as read",
            }
        )
    }
}

// Mark all notifications as read
export const markAllAsRead = async () => {
    try {
        const response = await api.put("/notifications/read-all")
        return response.data
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to mark all notifications as read",
            }
        )
    }
}

// Delete a notification
export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/notifications/${notificationId}`)
        return response.data
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to delete notification" }
        )
    }
}
