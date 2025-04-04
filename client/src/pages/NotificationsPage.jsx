import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useNotifications } from "../context/NotificationContext"
import { BellIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline"

const NotificationsPage = () => {
    const {
        notifications,
        loading,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification,
        refreshNotifications,
    } = useNotifications()
    const [isDeleting, setIsDeleting] = useState(false)

    // Refresh notifications when component mounts
    useEffect(() => {
        refreshNotifications()
    }, [refreshNotifications])

    // Mark notification as read when clicked
    const handleNotificationClick = (id) => {
        markNotificationAsRead(id)
    }

    // Delete notification
    const handleDeleteNotification = async (id, e) => {
        e.stopPropagation()
        try {
            setIsDeleting(true)
            await removeNotification(id)
        } catch (error) {
            console.error("Failed to delete notification:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Notifications
                    </h1>
                    {notifications.length > 0 && (
                        <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                        >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                            <BellIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mt-6 text-lg font-medium text-gray-900">
                            No notifications
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            You don't have any notifications yet. They will
                            appear here when you receive them.
                        </p>
                        <div className="mt-6">
                            <Link to="/auctions" className="btn-primary">
                                Browse Auctions
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {notifications.map((notification) => {
                                const notificationDate = new Date(
                                    notification.createdAt || Date.now()
                                )
                                const formattedDate =
                                    notificationDate.toLocaleDateString()
                                const formattedTime =
                                    notificationDate.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })

                                // Determine icon based on notification type
                                let NotificationIcon = BellIcon
                                let iconColor = "text-primary-500"
                                let bgColor = "bg-primary-100"

                                if (notification.type === "outbid") {
                                    iconColor = "text-red-500"
                                    bgColor = "bg-red-100"
                                } else if (notification.type === "win") {
                                    iconColor = "text-green-500"
                                    bgColor = "bg-green-100"
                                } else if (notification.type === "newBid") {
                                    iconColor = "text-accent-500"
                                    bgColor = "bg-accent-100"
                                }

                                return (
                                    <li
                                        key={notification._id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            !notification.readStatus
                                                ? "bg-blue-50"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification._id
                                            )
                                        }
                                    >
                                        <div className="flex items-start">
                                            <div
                                                className={`flex-shrink-0 ${bgColor} rounded-full p-2 mr-3`}
                                            >
                                                <NotificationIcon
                                                    className={`h-5 w-5 ${iconColor}`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <p
                                                        className={`text-sm font-medium ${
                                                            !notification.readStatus
                                                                ? "text-blue-800"
                                                                : "text-gray-900"
                                                        }`}
                                                    >
                                                        {notification.title ||
                                                            (notification.type ===
                                                            "outbid"
                                                                ? "You've been outbid!"
                                                                : notification.type ===
                                                                  "win"
                                                                ? "You won an auction!"
                                                                : notification.type ===
                                                                  "newBid"
                                                                ? "New bid received"
                                                                : "Notification")}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-xs text-gray-500">
                                                            <div>
                                                                {formattedDate}
                                                            </div>
                                                            <div>
                                                                {formattedTime}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) =>
                                                                handleDeleteNotification(
                                                                    notification._id,
                                                                    e
                                                                )
                                                            }
                                                            disabled={
                                                                isDeleting
                                                            }
                                                            className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p
                                                    className={`text-sm mt-1 ${
                                                        !notification.readStatus
                                                            ? "text-blue-700"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    {notification.message}
                                                </p>
                                                {notification.productId && (
                                                    <Link
                                                        to={`/product/${notification.productId}`}
                                                        className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-800 hover:underline"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        View auction
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationsPage
