import { Link } from "react-router-dom"
import { HeartIcon, ClockIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { useState } from "react"
import useCountdown from "../../hooks/useCountdown"

const ProductCard = ({ product }) => {
    const [isFavorite, setIsFavorite] = useState(false)

    // Handle case where product might be undefined or null
    if (!product) {
        return (
            <div className="card group hover:scale-[1.02] transition-transform duration-300">
                <div className="relative pb-[75%] overflow-hidden rounded-lg mb-4">
                    <img
                        src="https://via.placeholder.com/300x225?text=Product+Not+Available"
                        alt="Product not available"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Product not available
                    </h3>
                </div>
            </div>
        )
    }

    const { days, hours, minutes, isComplete } = useCountdown(
        product.endTime || new Date()
    )

    const toggleFavorite = (e) => {
        e.preventDefault()
        setIsFavorite(!isFavorite)
    }

    return (
        <div className="card group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border border-gray-100 rounded-xl overflow-hidden bg-white h-full">
            <Link
                to={`/product/${product._id || "not-found"}`}
                className="h-full flex flex-col"
            >
                <div className="relative pb-[85%] overflow-hidden mb-0 rounded-xl">
                    <img
                        src={
                            product.images && product.images.length > 0
                                ? product.images[0]
                                : "https://via.placeholder.com/300x225?text=No+Image"
                        }
                        alt={product.title || "Product"}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button
                        onClick={toggleFavorite}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none z-10 transform transition-transform duration-300 group-hover:scale-110"
                    >
                        {isFavorite ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                        ) : (
                            <HeartIcon className="h-5 w-5 text-gray-400 group-hover:text-red-400" />
                        )}
                    </button>

                    {/* Status badge */}
                    {isComplete ? (
                        <div className="absolute top-3 left-3 bg-danger-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            Ended
                        </div>
                    ) : (
                        <div className="absolute top-3 left-3 bg-success-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            Active
                        </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full shadow-sm">
                        {product.category && product.category.name
                            ? product.category.name
                            : "Uncategorized"}
                    </div>
                </div>

                <div className="p-2 flex-grow flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors duration-200 mb-2">
                        {product.title || "Untitled Product"}
                    </h3>
                    <div className="flex justify-between items-center mt-auto">
                        <div>
                            <p className="text-primary-600 font-bold text-xl">
                                $
                                {product.currentBid !== undefined &&
                                product.currentBid !== null
                                    ? product.currentBid.toFixed(2)
                                    : product.startingPrice !== undefined &&
                                      product.startingPrice !== null
                                    ? product.startingPrice.toFixed(2)
                                    : "0.00"}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">
                                {product.bidCount ||
                                    (product.bids && Array.isArray(product.bids)
                                        ? product.bids.length
                                        : 0)}{" "}
                                bids
                            </p>
                        </div>

                        {!isComplete ? (
                            <div
                                className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                                    days === 0 && hours < 5
                                        ? "bg-danger-100 text-danger-600"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {days > 0 ? (
                                    <span>
                                        {days}d {hours}h
                                    </span>
                                ) : (
                                    <span>
                                        {hours}h {minutes}m
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-100 text-gray-500 text-sm font-medium px-3 py-1 rounded-full">
                                Auction ended
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default ProductCard
