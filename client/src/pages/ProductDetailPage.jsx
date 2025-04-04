import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getProductById } from "../api/productService"
import { getProductBids } from "../api/bidService"
import { useBidding } from "../context/BidContext"
import BidForm from "../components/bids/BidForm"
import useCountdown from "../hooks/useCountdown"
import socketService from "../services/socketService"
import {
    ClockIcon,
    UserIcon,
    TagIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline"

const ProductDetailPage = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [bids, setBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeImage, setActiveImage] = useState(0)
    const { joinBidRoom, leaveBidRoom, activeBids } = useBidding()

    // Get countdown timer - always call the hook to maintain hook order
    const countdown = useCountdown(product?.endTime || new Date())

    // If product doesn't exist yet, override with default values
    const countdownValues = product
        ? countdown
        : { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: false }

    // Format countdown display
    const formatCountdown = () => {
        if (countdownValues.isComplete) return "Auction ended"

        if (countdownValues.days > 0) {
            return `${countdownValues.days}d ${countdownValues.hours}h ${countdownValues.minutes}m ${countdownValues.seconds}s`
        }

        return `${countdownValues.hours}h ${countdownValues.minutes}m ${countdownValues.seconds}s`
    }

    // Get real-time bid data
    const realtimeBidData = product && activeBids[product._id]

    // Current bid amount (from real-time data or product data)
    const currentBid =
        realtimeBidData?.currentBid ||
        product?.currentBid ||
        product?.startingPrice ||
        0 // Fallback to 0 if all values are undefined

    // Bid count (from real-time data or product data)
    const bidCount = realtimeBidData?.bidCount || bids.length

    // Fetch product and bids data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch product details
                const productData = await getProductById(id)
                if (productData && productData.product) {
                    setProduct(productData.product)
                    console.log("Product data loaded:", productData.product)
                } else {
                    throw new Error("Product data not found")
                }

                // Fetch bids for this product
                const bidsData = await getProductBids(id)
                setBids(bidsData.bids || [])
                console.log("Bids data loaded:", bidsData.bids || [])
            } catch (err) {
                setError(
                    "Failed to load product details. Please try again later."
                )
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    // Join bid room for real-time updates when product is loaded
    useEffect(() => {
        if (product) {
            joinBidRoom(product._id)
        }

        // Leave bid room when component unmounts
        return () => {
            if (product) {
                leaveBidRoom(product._id)
            }
        }
    }, [product, joinBidRoom, leaveBidRoom])

    // Listen for new bids and update the bids list
    useEffect(() => {
        if (!product) return

        // Create a listener for new bids
        const handleNewBid = async () => {
            try {
                // Refresh bids data
                const bidsData = await getProductBids(id)
                setBids(bidsData.bids || [])
            } catch (err) {
                console.error("Failed to refresh bids after new bid:", err)
            }
        }

        // Add event listener
        socketService.on("new-bid", handleNewBid)

        // Clean up
        return () => {
            socketService.off("new-bid", handleNewBid)
        }
    }, [product, id])

    // Handle image navigation
    const nextImage = () => {
        if (product?.images?.length > 0) {
            setActiveImage((prev) => (prev + 1) % product.images?.length)
        }
    }

    const prevImage = () => {
        if (product?.images?.length > 0) {
            setActiveImage(
                (prev) =>
                    (prev - 1 + product.images?.length) % product.images?.length
            )
        }
    }

    // Handle new bid placed
    const handleBidPlaced = async () => {
        try {
            // Refresh bids data
            const bidsData = await getProductBids(id)
            setBids(bidsData.bids || [])
        } catch (err) {
            console.error("Failed to refresh bids:", err)
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-200 rounded-lg h-96"></div>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-32 bg-gray-200 rounded w-full"></div>
                            <div className="h-12 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                >
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">
                        {" "}
                        {error || "Product not found"}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link
                                to="/"
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Home
                            </Link>
                        </li>
                        <li className="flex items-center">
                            <span className="text-gray-400 mx-1">/</span>
                            <Link
                                to="/auctions"
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Auctions
                            </Link>
                        </li>
                        <li className="flex items-center">
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-gray-900">
                                {product?.title}
                            </span>
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden h-96">
                            <img
                                src={
                                    product.images?.[activeImage] ||
                                    "https://via.placeholder.com/600x400?text=No+Image"
                                }
                                alt={product.title}
                                className="w-full h-full object-contain"
                            />

                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 focus:outline-none"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5 text-gray-800" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 focus:outline-none"
                                    >
                                        <ChevronRightIcon className="h-5 w-5 text-gray-800" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail images */}
                        {product.images?.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto">
                                {product.images?.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                                            activeImage === index
                                                ? "border-primary-500"
                                                : "border-transparent"
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {product?.title}
                        </h1>

                        {/* Auction info */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center text-gray-600">
                                <ClockIcon className="h-5 w-5 mr-1" />
                                <span>{formatCountdown()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <UserIcon className="h-5 w-5 mr-1" />
                                <span>
                                    {bidCount} {bidCount === 1 ? "bid" : "bids"}
                                </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <TagIcon className="h-5 w-5 mr-1" />
                                <Link
                                    to={`/categories/${product.category?._id}`}
                                    className="text-primary-600 hover:underline"
                                >
                                    {product.category?.name || "Uncategorized"}
                                </Link>
                            </div>
                        </div>

                        {/* Current bid */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="text-sm text-gray-500 mb-1">
                                Current bid:
                            </div>
                            <div className="text-3xl font-bold text-primary-600">
                                ₹{currentBid?.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Started at ₹
                                {product.startingPrice?.toFixed(2) || "0.00"}
                            </div>
                        </div>

                        {/* Bid form */}
                        <BidForm
                            product={product}
                            onBidPlaced={handleBidPlaced}
                        />

                        {/* Seller info */}
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">
                                Seller Information
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    {product.sellerId?.avatar ? (
                                        <img
                                            src={product.sellerId.avatar}
                                            alt={product.sellerId.name}
                                            className="h-12 w-12 rounded-full mr-3 border-2 border-white shadow"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-3 shadow">
                                            <UserIcon className="h-6 w-6 text-primary-600" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900">
                                            {product.sellerId?.name ||
                                                "Unknown seller"}
                                        </h4>
                                        {product.sellerId?.email && (
                                            <p className="text-sm text-gray-600">
                                                {product.sellerId.email}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Member since{" "}
                                            {product.sellerId?.createdAt
                                                ? new Date(
                                                      product.sellerId.createdAt
                                                  ).toLocaleDateString()
                                                : "Unknown"}
                                        </p>
                                    </div>
                                </div>
                                {product.sellerId?.bio && (
                                    <p className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-3">
                                        {product.sellerId.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product description and details */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">
                            Description
                        </h2>
                        <div className="prose max-w-none">
                            <p className="whitespace-pre-line">
                                {product?.description}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Details</h2>
                        <dl className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">
                                    Condition
                                </dt>
                                <dd className="text-sm text-gray-900 col-span-2">
                                    {product?.condition || "Not specified"}
                                </dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">
                                    Location
                                </dt>
                                <dd className="text-sm text-gray-900 col-span-2">
                                    {product?.location || "Not specified"}
                                </dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">
                                    Listed on
                                </dt>
                                <dd className="text-sm text-gray-900 col-span-2">
                                    {product?.createdAt
                                        ? new Date(
                                              product.createdAt
                                          ).toLocaleDateString()
                                        : "Not available"}
                                </dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500">
                                    Ends on
                                </dt>
                                <dd className="text-sm text-gray-900 col-span-2">
                                    {new Date(
                                        product.endTime
                                    ).toLocaleDateString()}{" "}
                                    at{" "}
                                    {new Date(
                                        product.endTime
                                    ).toLocaleTimeString()}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Bid history */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold mb-4">Bid History</h2>
                    {bids.length === 0 ? (
                        <p className="text-gray-500">
                            No bids yet. Be the first to bid!
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Bidder
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Amount
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bids.map((bid) => (
                                        <tr key={bid._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {bid.userId?.avatar ? (
                                                        <img
                                                            src={
                                                                bid.userId
                                                                    .avatar
                                                            }
                                                            alt={
                                                                bid.userId.name
                                                            }
                                                            className="h-8 w-8 rounded-full mr-2"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                                            <UserIcon className="h-4 w-4 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-gray-900">
                                                        {bid.userId?.name ||
                                                            "Anonymous"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    ${bid.amount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(
                                                    bid.createdAt
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Refresh bids button */}
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={async () => {
                                try {
                                    const bidsData = await getProductBids(id)
                                    setBids(bidsData.bids || [])
                                } catch (err) {
                                    console.error(
                                        "Failed to refresh bids:",
                                        err
                                    )
                                }
                            }}
                            className="flex items-center text-primary-600 hover:text-primary-800"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Refresh bid history
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage
