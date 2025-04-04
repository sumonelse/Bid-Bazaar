import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useNotifications } from "../../context/NotificationContext"
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false)
    const {
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshNotifications,
    } = useNotifications()
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Refresh notifications when dropdown is opened
    useEffect(() => {
        if (isOpen) {
            refreshNotifications()
        }
    }, [isOpen, refreshNotifications])

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleNotificationClick = (id) => {
        markNotificationAsRead(id)
        setIsOpen(false)
    }

    const handleMarkAllAsRead = (e) => {
        e.stopPropagation()
        markAllNotificationsAsRead()
    }

    // Get the most recent 5 notifications
    const recentNotifications = notifications.slice(0, 5)

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell */}
            <button
                onClick={toggleDropdown}
                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <BellIcon
                    className="h-6 w-6 group-hover:text-primary-500 transition-colors duration-200"
                    aria-hidden="true"
                />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center transform -translate-y-1/2 translate-x-1/2 animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
                <span className="absolute -bottom-1 -right-1 transform translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap">
                    Notifications
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
                                    >
                                        <CheckIcon className="h-3 w-3 mr-1" />
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>

                        {recentNotifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                <div className="flex justify-center mb-4">
                                    <BellIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto">
                                {recentNotifications.map((notification) => {
                                    // Determine icon color based on notification type
                                    let bgColor = "bg-primary-100"
                                    let textColor = "text-primary-800"

                                    if (notification.type === "outbid") {
                                        bgColor = "bg-red-100"
                                        textColor = "text-red-800"
                                    } else if (
                                        notification.type === "win" ||
                                        notification.type === "auctionWon"
                                    ) {
                                        bgColor = "bg-green-100"
                                        textColor = "text-green-800"
                                    } else if (notification.type === "newBid") {
                                        bgColor = "bg-accent-100"
                                        textColor = "text-accent-800"
                                    }

                                    return (
                                        <div
                                            key={notification._id}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification._id
                                                )
                                            }
                                            className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                                                !notification.readStatus
                                                    ? "bg-blue-50"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-start">
                                                <div
                                                    className={`flex-shrink-0 rounded-full p-1 ${bgColor} mr-3`}
                                                >
                                                    <BellIcon
                                                        className={`h-4 w-4 ${textColor}`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm font-medium ${
                                                            !notification.readStatus
                                                                ? "text-blue-800"
                                                                : "text-gray-900"
                                                        }`}
                                                    >
                                                        {notification.title ||
                                                            "Notification"}
                                                    </p>
                                                    <p
                                                        className={`text-xs mt-0.5 truncate ${
                                                            !notification.readStatus
                                                                ? "text-blue-700"
                                                                : "text-gray-600"
                                                        }`}
                                                    >
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                notification.createdAt ||
                                                                    Date.now()
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="border-t border-gray-200 px-4 py-2">
                            <Link
                                to="/notifications"
                                className="block text-center text-sm text-primary-600 hover:text-primary-800 font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown
