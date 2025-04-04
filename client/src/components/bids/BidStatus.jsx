import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ClockIcon, UserIcon, FireIcon } from "@heroicons/react/24/outline"
import useCountdown from "../../hooks/useCountdown"

const BidStatus = ({ product, currentBid, bidCount, isEndingSoon }) => {
    const [timeFlash, setTimeFlash] = useState(false)

    // Get countdown timer
    const countdown = useCountdown(product?.endTime || new Date())

    // Format countdown display
    const formatCountdown = () => {
        if (countdown.isComplete) return "Auction ended"

        if (countdown.days > 0) {
            return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
        }

        return `${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
    }

    // Flash the timer when it's under 5 minutes
    useEffect(() => {
        if (
            countdown.days === 0 &&
            countdown.hours === 0 &&
            countdown.minutes < 5
        ) {
            setTimeFlash(true)
        } else {
            setTimeFlash(false)
        }
    }, [countdown])

    // Determine urgency level
    const getUrgencyLevel = () => {
        if (countdown.isComplete) return "ended"
        if (
            countdown.days === 0 &&
            countdown.hours === 0 &&
            countdown.minutes < 5
        )
            return "critical"
        if (countdown.days === 0 && countdown.hours < 1) return "urgent"
        if (countdown.days === 0 && countdown.hours < 12) return "soon"
        return "normal"
    }

    const urgencyLevel = getUrgencyLevel()

    // Get color classes based on urgency
    const getUrgencyClasses = () => {
        switch (urgencyLevel) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200"
            case "urgent":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "soon":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "ended":
                return "bg-gray-100 text-gray-800 border-gray-200"
            default:
                return "bg-blue-100 text-blue-800 border-blue-200"
        }
    }

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Time remaining */}
                <motion.div
                    className={`rounded-lg p-4 border flex items-center ${getUrgencyClasses()}`}
                    animate={{
                        scale: timeFlash ? [1, 1.02, 1] : 1,
                        opacity: timeFlash ? [1, 0.9, 1] : 1,
                    }}
                    transition={{
                        duration: 1,
                        repeat: timeFlash ? Infinity : 0,
                        repeatType: "loop",
                    }}
                >
                    <div className="mr-3 bg-white bg-opacity-50 rounded-full p-2">
                        <ClockIcon
                            className={`h-6 w-6 ${
                                urgencyLevel === "critical"
                                    ? "text-red-600"
                                    : urgencyLevel === "urgent"
                                    ? "text-orange-600"
                                    : "text-blue-600"
                            }`}
                        />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase">
                            Time Remaining
                        </p>
                        <p className="text-lg font-bold">
                            {formatCountdown()}
                            {urgencyLevel === "critical" && (
                                <span className="ml-2 inline-flex">
                                    <FireIcon className="h-5 w-5 text-red-600 animate-pulse" />
                                </span>
                            )}
                        </p>
                    </div>
                </motion.div>

                {/* Current bid */}
                <div className="rounded-lg p-4 border bg-primary-100 text-primary-800 border-primary-200 flex items-center">
                    <div className="mr-3 bg-white bg-opacity-50 rounded-full p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-primary-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase">
                            Current Bid
                        </p>
                        <p className="text-lg font-bold">
                            ₹{currentBid.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Bid count */}
                <div className="rounded-lg p-4 border bg-purple-100 text-purple-800 border-purple-200 flex items-center">
                    <div className="mr-3 bg-white bg-opacity-50 rounded-full p-2">
                        <UserIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase">
                            Total Bids
                        </p>
                        <p className="text-lg font-bold">
                            {bidCount} {bidCount === 1 ? "bid" : "bids"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ending soon banner */}
            {isEndingSoon && urgencyLevel !== "ended" && (
                <motion.div
                    className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg text-center font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        This auction is ending soon! Place your bid now!
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}

export default BidStatus
