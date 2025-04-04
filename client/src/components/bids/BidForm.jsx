import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useBidding } from "../../context/BidContext"
import { useGamification } from "../../context/GamificationContext"
import {
    ArrowTrendingUpIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid"

const BidForm = ({ product, onBidPlaced }) => {
    const [bidAmount, setBidAmount] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [suggestedBids, setSuggestedBids] = useState([])
    const [bidPlaced, setBidPlaced] = useState(null)
    const { isAuthenticated } = useAuth()
    const { placeBid } = useBidding()
    const { profile } = useGamification()

    // Calculate minimum bid amount (current bid + minimum increment)
    const minBidAmount = product.currentBid
        ? product.currentBid + (product.bidIncrement || 1)
        : product.startingPrice

    // Generate suggested bid amounts
    useEffect(() => {
        const generateSuggestedBids = () => {
            const increment = product.bidIncrement || 1
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
        product.currentBid,
        product.startingPrice,
        product.bidIncrement,
        minBidAmount,
    ])

    // Handle bid submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        // Validate bid amount
        const amount = parseFloat(bidAmount)
        if (isNaN(amount) || amount < minBidAmount) {
            setError(`Bid must be at least ₹${minBidAmount.toFixed(2)}`)
            return
        }

        try {
            setIsSubmitting(true)
            await placeBid(product._id, amount)
            setBidAmount("")
            setBidPlaced(amount)
            setSuccess(true)

            // Hide success message after 5 seconds
            setTimeout(() => {
                setSuccess(false)
            }, 5000)

            if (onBidPlaced) onBidPlaced(amount)
        } catch (err) {
            setError(err.message || "Failed to place bid. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle suggested bid click
    const handleSuggestedBid = (amount) => {
        setBidAmount(amount.toString())
        setError("")
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Place Your Bid
            </h3>

            {/* Current bid info */}
            <div className="mb-4">
                <p className="text-sm text-gray-500">
                    Current bid:{" "}
                    <span className="font-semibold text-gray-800">
                        ₹
                        {(product.currentBid || product.startingPrice).toFixed(
                            2
                        )}
                    </span>
                </p>
                <p className="text-sm text-gray-500">
                    Minimum bid:{" "}
                    <span className="font-semibold text-gray-800">
                        ₹{minBidAmount.toFixed(2)}
                    </span>
                </p>
            </div>

            {/* Suggested bids */}
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Suggested bids:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedBids.map((amount, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestedBid(amount)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors"
                        >
                            ₹{amount.toFixed(2)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Success message */}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
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
                </div>
            )}

            {/* Bid form */}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="bidAmount" className="sr-only">
                        Bid Amount
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
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
                                    : "border-gray-300"
                            }`}
                            placeholder={`${minBidAmount.toFixed(2)} or more`}
                            required
                        />
                    </div>
                    {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex justify-center items-center"
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
                            <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                            Place Bid
                        </span>
                    )}
                </button>
            </form>
        </div>
    )
}

export default BidForm
