import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { CurrencyRupeeIcon, UserCircleIcon } from "@heroicons/react/24/outline"

const BidHistory = ({ bids, currentUserId, maxHeight = "300px" }) => {
    const [sortedBids, setSortedBids] = useState([])
    const { currentUser } = useAuth()

    // Sort bids by timestamp (newest first)
    useEffect(() => {
        if (bids && bids.length > 0) {
            const sorted = [...bids].sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            )
            setSortedBids(sorted)
        } else {
            setSortedBids([])
        }
    }, [bids])

    if (!bids || bids.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                    <CurrencyRupeeIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500">No bids have been placed yet.</p>
                <p className="text-gray-500 text-sm mt-1">
                    Be the first to bid!
                </p>
            </div>
        )
    }

    return (
        <div
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            style={{ maxHeight }}
        >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">
                    Bid History
                </h3>
            </div>

            <div
                className="overflow-y-auto"
                style={{ maxHeight: `calc(${maxHeight} - 43px)` }}
            >
                <AnimatePresence>
                    <ul className="divide-y divide-gray-100">
                        {sortedBids.map((bid, index) => {
                            const isCurrentUserBid =
                                bid.userId?._id === currentUserId ||
                                bid.user?._id === currentUserId

                            return (
                                <motion.li
                                    key={bid._id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.05,
                                    }}
                                    className={`px-4 py-3 ${
                                        isCurrentUserBid ? "bg-primary-50" : ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {bid.userId?.avatar ||
                                            bid.user?.avatar ? (
                                                <img
                                                    src={
                                                        bid.userId?.avatar ||
                                                        bid.user?.avatar
                                                    }
                                                    alt={
                                                        bid.userId?.name ||
                                                        bid.user?.name
                                                    }
                                                    className="h-8 w-8 rounded-full mr-3"
                                                />
                                            ) : (
                                                <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
                                            )}

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {bid.userId?.name ||
                                                        bid.user?.name ||
                                                        "Anonymous"}
                                                    {isCurrentUserBid && (
                                                        <span className="ml-2 text-xs font-medium text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {bid.timestamp
                                                        ? formatDistanceToNow(
                                                              new Date(
                                                                  bid.timestamp
                                                              ),
                                                              {
                                                                  addSuffix: true,
                                                              }
                                                          )
                                                        : "Just now"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">
                                                ₹{bid.amount.toFixed(2)}
                                            </p>
                                            {index === 0 && (
                                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                    Highest
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.li>
                            )
                        })}
                    </ul>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default BidHistory
