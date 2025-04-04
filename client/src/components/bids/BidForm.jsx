import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import { useBidding } from "../../context/BidContext"
import { useGamification } from "../../context/GamificationContext"
import {
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    BoltIcon,
    CurrencyRupeeIcon,
    ArrowPathIcon,
    FireIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid"

const BidForm = ({ product, onBidPlaced }) => {
    const [bidAmount, setBidAmount] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [suggestedBids, setSuggestedBids] = useState([])
    const [bidPlaced, setBidPlaced] = useState(null)
    const [quickBidMode, setQuickBidMode] = useState(false)
    const [showBidOptions, setShowBidOptions] = useState(false)
    const [bidIncrement, setBidIncrement] = useState(1)
    const [bidAnimation, setBidAnimation] = useState(false)
    const inputRef = useRef(null)

    const { isAuthenticated, currentUser } = useAuth()
    const { placeBid, activeBids } = useBidding()
    const { profile } = useGamification()

    // Get real-time bid data
    const realtimeBidData = product && activeBids[product._id]

    // Current bid amount (from real-time data or product data)
    const currentBid =
        realtimeBidData?.currentBid ||
        product.currentBid ||
        product.startingPrice ||
        0

    // Calculate minimum bid amount (current bid + minimum increment)
    const minBidAmount = currentBid + (product.bidIncrement || bidIncrement)

    // Generate suggested bid amounts
    useEffect(() => {
        const generateSuggestedBids = () => {
            const increment = product.bidIncrement || bidIncrement
            const suggestions = [
                minBidAmount,
                minBidAmount + increment,
                minBidAmount + increment * 2,
                minBidAmount + increment * 5,
            ]
            setSuggestedBids(suggestions)
        }

        generateSuggestedBids()
    }, [
        currentBid,
        product.startingPrice,
        product.bidIncrement,
        minBidAmount,
        bidIncrement,
    ])

    // Handle bid submission
    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setError("")
        setSuccess(false)

        // Validate bid amount
        const amount = parseFloat(bidAmount || minBidAmount)
        if (isNaN(amount) || amount < minBidAmount) {
            setError(`Bid must be at least ₹${minBidAmount.toFixed(2)}`)
            return
        }

        try {
            setIsSubmitting(true)
            setBidAnimation(true)
            await placeBid(product._id, amount)
            setBidAmount("")
            setBidPlaced(amount)
            setSuccess(true)

            // Hide success message after 5 seconds
            setTimeout(() => {
                setSuccess(false)
            }, 5000)

            // Reset bid animation
            setTimeout(() => {
                setBidAnimation(false)
            }, 1000)

            if (onBidPlaced) onBidPlaced(amount)
        } catch (err) {
            setError(err.message || "Failed to place bid. Please try again.")
            setBidAnimation(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle suggested bid click
    const handleSuggestedBid = (amount) => {
        setBidAmount(amount.toString())
        setError("")

        // If in quick bid mode, immediately place the bid
        if (quickBidMode) {
            handleSubmit()
        } else {
            // Focus the input field
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }
    }

    // Handle quick bid
    const handleQuickBid = () => {
        handleSubmit()
    }

    // Toggle quick bid mode
    const toggleQuickBidMode = () => {
        setQuickBidMode(!quickBidMode)
    }

    // Handle bid increment change
    const handleIncrementChange = (increment) => {
        setBidIncrement(increment)
    }

    if (!isAuthenticated) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-yellow-700 text-sm">
                    Please{" "}
                    <a
                        href="/login"
                        className="font-medium text-primary-600 hover:text-primary-500"
                    >
                        sign in
                    </a>{" "}
                    to place a bid.
                </p>
            </div>
        )
    }

    if (new Date(product.endTime) < new Date()) {
        return (
            <div className="bg-gray-100 border border-gray-200 rounded-md p-4 mb-4">
                <p className="text-gray-700 text-sm font-medium">
                    This auction has ended.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
            {/* Bid animation overlay */}
            <AnimatePresence>
                {bidAnimation && (
                    <motion.div
                        className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-full p-4 shadow-lg"
                        >
                            <CurrencyRupeeIcon className="h-12 w-12 text-primary-600 animate-pulse" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                    Place Your Bid
                </h3>

                {/* Quick bid toggle */}
                <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">
                        Quick Bid
                    </span>
                    <button
                        onClick={toggleQuickBidMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            quickBidMode ? "bg-primary-600" : "bg-gray-200"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                quickBidMode ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Current bid info */}
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Current bid:</p>
                        <p className="text-xl font-bold text-primary-600">
                            ₹{currentBid.toFixed(2)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Minimum bid:</p>
                        <p className="text-lg font-semibold text-gray-800">
                            ₹{minBidAmount.toFixed(2)}
                        </p>
                    </div>
                </div>

                {realtimeBidData?.lastBidder && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Last bid by:{" "}
                            <span className="font-medium text-gray-700">
                                {realtimeBidData.lastBidder.name}
                            </span>
                            {realtimeBidData.lastBidder._id ===
                                currentUser?._id && (
                                <span className="ml-1 text-xs font-medium text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded-full">
                                    You
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* Success message */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start"
                    >
                        <CheckCircleSolidIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                Bid placed successfully!
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                                Your bid of ₹{bidPlaced?.toFixed(2)} has been
                                placed.{" "}
                                {profile && profile.level && (
                                    <span>You earned 5 XP for bidding!</span>
                                )}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bid options toggle */}
            <div className="mb-3">
                <button
                    type="button"
                    onClick={() => setShowBidOptions(!showBidOptions)}
                    className="text-sm text-gray-600 flex items-center hover:text-primary-600 transition-colors"
                >
                    <span>Bid options</span>
                    {showBidOptions ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                    ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                    )}
                </button>
            </div>

            {/* Bid options */}
            <AnimatePresence>
                {showBidOptions && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">
                                Bid increment:
                            </p>
                            <div className="flex space-x-2">
                                {[1, 5, 10, 50, 100].map((increment) => (
                                    <button
                                        key={increment}
                                        type="button"
                                        onClick={() =>
                                            handleIncrementChange(increment)
                                        }
                                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                            bidIncrement === increment
                                                ? "bg-primary-100 text-primary-700 border border-primary-300"
                                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        ₹{increment}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Suggested bids */}
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Suggested bids:</p>
                <div className="grid grid-cols-2 gap-2">
                    {suggestedBids.map((amount, index) => (
                        <motion.button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestedBid(amount)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`px-3 py-2 text-sm rounded-md transition-colors flex justify-between items-center ${
                                index === 0
                                    ? "bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100"
                                    : "bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                            <span className="font-medium">
                                ₹{amount.toFixed(2)}
                            </span>
                            {index === 0 && (
                                <span className="text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded-full">
                                    Min
                                </span>
                            )}
                            {index === 3 && (
                                <FireIcon className="h-4 w-4 text-orange-500" />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Bid form */}
            {!quickBidMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="bidAmount"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Your bid amount
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">
                                    ₹
                                </span>
                            </div>
                            <input
                                ref={inputRef}
                                type="number"
                                id="bidAmount"
                                name="bidAmount"
                                step="0.01"
                                min={minBidAmount}
                                value={bidAmount}
                                onChange={(e) => {
                                    setBidAmount(e.target.value)
                                    setError("")
                                }}
                                className={`form-input pl-7 block w-full sm:text-sm rounded-md ${
                                    error
                                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                }`}
                                placeholder={`${minBidAmount.toFixed(
                                    2
                                )} or more`}
                            />
                        </div>
                        {error && (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full btn-primary flex justify-center items-center py-3"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                                Place Bid
                            </span>
                        )}
                    </motion.button>
                </form>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Quick bid mode is active. Click a suggested bid amount
                        above or use the quick bid button below.
                    </p>

                    <motion.button
                        type="button"
                        onClick={handleQuickBid}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 px-4 rounded-md font-medium flex justify-center items-center shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <BoltIcon className="h-5 w-5 mr-2" />
                                Quick Bid ₹{minBidAmount.toFixed(2)}
                            </span>
                        )}
                    </motion.button>
                </div>
            )}
        </div>
    )
}

export default BidForm
