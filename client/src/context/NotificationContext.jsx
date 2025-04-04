import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react"
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../api/notificationService"
import { useAuth } from "./AuthContext"
import socketService from "../services/socketService"

// Create the context
const NotificationContext = createContext()

// Custom hook to use the notification context
export const useNotifications = () => {
    return useContext(NotificationContext)
}

// Provider component
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    const { isAuthenticated, user } = useAuth()

    // Initialize socket connection when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize the socket service with the user's token
            const socket = socketService.initialize(
                localStorage.getItem("token")
            )

            // Authenticate the user with the socket server
            socket.emit("authenticate", { userId: user._id })
            console.log("Socket authenticated with user ID:", user._id)

            setIsConnected(true)

            // Set up event listeners for connection status
            socketService.on("connect", () => {
                setIsConnected(true)
                // Re-authenticate on reconnect
                socket.emit("authenticate", { userId: user._id })
                console.log(
                    "Socket reconnected and authenticated with user ID:",
                    user._id
                )
            })

            socketService.on("disconnect", () => setIsConnected(false))

            // Clean up on unmount
            return () => {
                socketService.off("connect")
                socketService.off("disconnect")
            }
        }
    }, [isAuthenticated, user])

    // Listen for new notifications
    useEffect(() => {
        if (isConnected) {
            // Handle new notifications
            const handleNewNotification = (notification) => {
                setNotifications((prev) => [notification, ...prev])
                setUnreadCount((prev) => prev + 1)
            }

            // Handle notification count updates
            const handleNotificationCount = (data) => {
                setUnreadCount(data.count)
            }

            // Handle notifications updated event (e.g., after marking all as read)
            const handleNotificationsUpdated = () => {
                // Refresh notifications
                fetchNotifications()
            }

            // Register event listeners
            socketService.on("new-notification", handleNewNotification)
            socketService.on("notification-count", handleNotificationCount)
            socketService.on(
                "notifications-updated",
                handleNotificationsUpdated
            )

            // Clean up listeners when component unmounts or connection changes
            return () => {
                socketService.off("new-notification", handleNewNotification)
                socketService.off("notification-count", handleNotificationCount)
                socketService.off(
                    "notifications-updated",
                    handleNotificationsUpdated
                )
            }
        }
    }, [isConnected])

    // Function to fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (isAuthenticated) {
            try {
                setLoading(true)
                const data = await getNotifications()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            } catch (error) {
                console.error("Failed to fetch notifications:", error)
            } finally {
                setLoading(false)
            }
        }
    }, [isAuthenticated])

    // Fetch notifications when user is authenticated
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Mark a notification as read
    const markNotificationAsRead = useCallback(async (id) => {
        try {
            await markAsRead(id)
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification._id === id
                        ? { ...notification, readStatus: true }
                        : notification
                )
            )
            // No need to update unreadCount manually as we'll get a socket event
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }, [])

    // Mark all notifications as read
    const markAllNotificationsAsRead = useCallback(async () => {
        try {
            await markAllAsRead()
            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    readStatus: true,
                }))
            )
            // No need to update unreadCount manually as we'll get a socket event
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error)
        }
    }, [])

    // Delete a notification
    const removeNotification = useCallback(
        async (id) => {
            try {
                await deleteNotification(id)

                // Update notifications list
                setNotifications((prev) =>
                    prev.filter((notification) => notification._id !== id)
                )

                // If the deleted notification was unread, update the count
                const wasUnread = notifications.find(
                    (n) => n._id === id && !n.readStatus
                )
                if (wasUnread) {
                    setUnreadCount((prev) => Math.max(0, prev - 1))
                }

                // Refresh notifications to ensure consistency
                fetchNotifications()
            } catch (error) {
                console.error("Failed to delete notification:", error)
            }
        },
        [notifications, fetchNotifications]
    )

    // Context value
    const value = {
        notifications,
        unreadCount,
        loading,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification,
        refreshNotifications: fetchNotifications,
        isConnected,
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}
