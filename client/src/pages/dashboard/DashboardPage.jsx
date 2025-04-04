import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getUserProducts } from "../../api/productService"
import { getUserBids, getUserWinningBids } from "../../api/bidService"
import {
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline"

const DashboardPage = () => {
    const { currentUser } = useAuth()
    const [userProducts, setUserProducts] = useState([])
    const [userBids, setUserBids] = useState([])
    const [winningBids, setWinningBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)

                // Fetch user's products
                const productsData = await getUserProducts(currentUser._id)
                setUserProducts(productsData.data?.products || [])

                // Fetch user's bids
                const bidsData = await getUserBids()
                console.log("User bids data:", bidsData)

                // Transform the data structure to match what the component expects
                const transformedBids =
                    bidsData?.bids?.map((bid) => {
                        // Check if the bid has productId instead of product
                        if (bid.productId && !bid.product) {
                            bid.product = bid.productId
                            // Make sure we don't lose the reference
                            delete bid.productId
                        }
                        return bid
                    }) || []

                setUserBids(transformedBids)

                // Fetch user's winning bids
                try {
                    const winningBidsData = await getUserWinningBids()
                    console.log("Winning bids data:", winningBidsData)

                    // Transform the winning bids data structure
                    const transformedWinningBids =
                        winningBidsData?.bids?.map((bid) => {
                            // Check if the bid has productId instead of product
                            if (bid.productId && !bid.product) {
                                bid.product = bid.productId
                                // Make sure we don't lose the reference
                                delete bid.productId
                            }
                            return bid
                        }) || []

                    setWinningBids(transformedWinningBids)
                } catch (winError) {
                    console.error("Failed to fetch winning bids:", winError)
                    setWinningBids([])
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [currentUser])

    // Calculate statistics
    const activeListings = userProducts.filter(
        (product) => product.endTime && new Date(product.endTime) > new Date()
    ).length
    const endedListings = userProducts.length - activeListings
    const activeBids = userBids.filter(
        (bid) =>
            bid.product &&
            bid.product.endTime &&
            new Date(bid.product.endTime) > new Date()
    ).length

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Dashboard header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Welcome back, {currentUser?.name || "User"}!
                    </p>
                </div>

                {/* Dashboard tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`${
                                activeTab === "overview"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("listings")}
                            className={`${
                                activeTab === "listings"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            My Listings
                        </button>
                        <button
                            onClick={() => setActiveTab("bids")}
                            className={`${
                                activeTab === "bids"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            My Bids
                        </button>
                        <button
                            onClick={() => setActiveTab("won")}
                            className={`${
                                activeTab === "won"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Won Auctions
                        </button>
                    </nav>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                )}

                {/* Dashboard content */}
                {!loading && (
                    <>
                        {/* Overview tab */}
                        {activeTab === "overview" && (
                            <div>
                                {/* Stats cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-primary-500">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                                                <ClockIcon className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="ml-5">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Active Listings
                                                </p>
                                                <p className="text-3xl font-bold text-primary-600">
                                                    {activeListings}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500">
                                            Items currently up for auction
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-gray-500">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                                                <XCircleIcon className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <div className="ml-5">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Ended Listings
                                                </p>
                                                <p className="text-3xl font-bold text-gray-700">
                                                    {endedListings}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500">
                                            Completed auction listings
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-accent-500">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-accent-100 rounded-full p-3">
                                                <ClockIcon className="h-6 w-6 text-accent-600" />
                                            </div>
                                            <div className="ml-5">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Active Bids
                                                </p>
                                                <p className="text-3xl font-bold text-accent-600">
                                                    {activeBids}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500">
                                            Your current active bids
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-green-500">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-5">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Won Auctions
                                                </p>
                                                <p className="text-3xl font-bold text-green-600">
                                                    {winningBids.length}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500">
                                            Auctions you've won
                                        </div>
                                    </div>
                                </div>

                                {/* Recent activity */}
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Recent Activity
                                        </h3>
                                    </div>

                                    {userBids.length === 0 &&
                                    userProducts.length === 0 ? (
                                        <div className="px-6 py-12 text-center">
                                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <ClockIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 mb-4">
                                                No recent activity found.
                                            </p>
                                            <div className="mt-6 flex justify-center space-x-4">
                                                <Link
                                                    to="/auctions"
                                                    className="btn-outline"
                                                >
                                                    Browse Auctions
                                                </Link>
                                                <Link
                                                    to="/create-listing"
                                                    className="btn-primary"
                                                >
                                                    Create Listing
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {/* Show most recent 5 bids or listings */}
                                            {[...userBids, ...userProducts]
                                                .sort(
                                                    (a, b) =>
                                                        new Date(b.createdAt) -
                                                        new Date(a.createdAt)
                                                )
                                                .slice(0, 5)
                                                .map((item) => {
                                                    const isBid =
                                                        "amount" in item
                                                    const date = new Date(
                                                        item.createdAt
                                                    )
                                                    const formattedDate =
                                                        date.toLocaleDateString()
                                                    const formattedTime =
                                                        date.toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )

                                                    return (
                                                        <li
                                                            key={item._id}
                                                            className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0">
                                                                    <img
                                                                        src={
                                                                            isBid
                                                                                ? item.product &&
                                                                                  item
                                                                                      .product
                                                                                      .images &&
                                                                                  item
                                                                                      .product
                                                                                      .images
                                                                                      .length >
                                                                                      0
                                                                                    ? item
                                                                                          .product
                                                                                          .images[0]
                                                                                    : "https://via.placeholder.com/50"
                                                                                : item.images &&
                                                                                  item
                                                                                      .images
                                                                                      .length >
                                                                                      0
                                                                                ? item
                                                                                      .images[0]
                                                                                : "https://via.placeholder.com/50"
                                                                        }
                                                                        alt={
                                                                            isBid
                                                                                ? item.product
                                                                                    ? item
                                                                                          .product
                                                                                          .title ||
                                                                                      "Product"
                                                                                    : "Product"
                                                                                : item.title ||
                                                                                  "Product"
                                                                        }
                                                                        className="h-16 w-16 rounded-lg object-cover shadow"
                                                                    />
                                                                </div>
                                                                <div className="ml-4 flex-1">
                                                                    <div className="flex justify-between">
                                                                        <Link
                                                                            to={`/product/${
                                                                                isBid
                                                                                    ? item.product
                                                                                        ? item
                                                                                              .product
                                                                                              ._id
                                                                                        : "not-found"
                                                                                    : item._id ||
                                                                                      "not-found"
                                                                            }`}
                                                                            className="text-md font-medium text-primary-600 hover:text-primary-800 hover:underline"
                                                                        >
                                                                            {isBid
                                                                                ? item.product
                                                                                    ? item
                                                                                          .product
                                                                                          .title ||
                                                                                      "Unknown Product"
                                                                                    : "Unknown Product"
                                                                                : item.title ||
                                                                                  "Unknown Product"}
                                                                        </Link>
                                                                        <div className="text-sm text-gray-500">
                                                                            <div>
                                                                                {
                                                                                    formattedDate
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs">
                                                                                {
                                                                                    formattedTime
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {isBid
                                                                            ? `You placed a bid of `
                                                                            : `You listed this item for `}
                                                                        <span className="font-semibold text-primary-600">
                                                                            ₹
                                                                            {isBid
                                                                                ? item.amount !=
                                                                                      null &&
                                                                                  !isNaN(
                                                                                      item.amount
                                                                                  )
                                                                                    ? parseFloat(
                                                                                          item.amount
                                                                                      ).toFixed(
                                                                                          2
                                                                                      )
                                                                                    : "0.00"
                                                                                : item.startingPrice !=
                                                                                      null &&
                                                                                  !isNaN(
                                                                                      item.startingPrice
                                                                                  )
                                                                                ? parseFloat(
                                                                                      item.startingPrice
                                                                                  ).toFixed(
                                                                                      2
                                                                                  )
                                                                                : "0.00"}
                                                                        </span>
                                                                    </p>
                                                                    {isBid &&
                                                                        item.product &&
                                                                        item
                                                                            .product
                                                                            .endTime && (
                                                                            <div className="mt-1 text-xs">
                                                                                {new Date(
                                                                                    item.product.endTime
                                                                                ) >
                                                                                new Date() ? (
                                                                                    <span className="text-green-600">
                                                                                        Auction
                                                                                        active
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-gray-500">
                                                                                        Auction
                                                                                        ended
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* My Listings tab */}
                        {activeTab === "listings" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        My Listings
                                    </h2>
                                    <Link
                                        to="/create-listing"
                                        className="btn-primary flex items-center"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-1" />
                                        Create Listing
                                    </Link>
                                </div>

                                {userProducts.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
                                        <p className="text-gray-500 mb-6">
                                            You haven't created any listings
                                            yet.
                                        </p>
                                        <Link
                                            to="/create-listing"
                                            className="btn-primary"
                                        >
                                            Create Your First Listing
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <ul className="divide-y divide-gray-200">
                                            {userProducts.map((product) => {
                                                const isActive = product.endTime
                                                    ? new Date(
                                                          product.endTime
                                                      ) > new Date()
                                                    : false
                                                return (
                                                    <li
                                                        key={product._id}
                                                        className="px-6 py-4"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    src={
                                                                        product.images &&
                                                                        product
                                                                            .images
                                                                            .length >
                                                                            0
                                                                            ? product
                                                                                  .images[0]
                                                                            : "https://via.placeholder.com/50"
                                                                    }
                                                                    alt={
                                                                        product.title ||
                                                                        "Product"
                                                                    }
                                                                    className="h-16 w-16 rounded-md object-cover"
                                                                />
                                                            </div>
                                                            <div className="ml-4 flex-1">
                                                                <div className="flex justify-between">
                                                                    <Link
                                                                        to={`/product/${product._id}`}
                                                                        className="text-lg font-medium text-primary-600 hover:text-primary-800"
                                                                    >
                                                                        {
                                                                            product.title
                                                                        }
                                                                    </Link>
                                                                    <div className="flex items-center">
                                                                        {isActive ? (
                                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                                Active
                                                                            </span>
                                                                        ) : (
                                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                                                Ended
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 flex justify-between">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Current
                                                                            bid:{" "}
                                                                            <span className="font-medium">
                                                                                $
                                                                                {(product.currentBid !=
                                                                                    null &&
                                                                                !isNaN(
                                                                                    product.currentBid
                                                                                )
                                                                                    ? parseFloat(
                                                                                          product.currentBid
                                                                                      )
                                                                                    : product.startingPrice !=
                                                                                          null &&
                                                                                      !isNaN(
                                                                                          product.startingPrice
                                                                                      )
                                                                                    ? parseFloat(
                                                                                          product.startingPrice
                                                                                      )
                                                                                    : 0
                                                                                ).toFixed(
                                                                                    2
                                                                                )}
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {product.bids &&
                                                                            Array.isArray(
                                                                                product.bids
                                                                            )
                                                                                ? product
                                                                                      .bids
                                                                                      .length
                                                                                : 0}{" "}
                                                                            {product.bids &&
                                                                            Array.isArray(
                                                                                product.bids
                                                                            ) &&
                                                                            product
                                                                                .bids
                                                                                .length ===
                                                                                1
                                                                                ? "bid"
                                                                                : "bids"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {product.endTime ? (
                                                                            isActive ? (
                                                                                <span>
                                                                                    Ends
                                                                                    on{" "}
                                                                                    {new Date(
                                                                                        product.endTime
                                                                                    ).toLocaleDateString()}
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    Ended
                                                                                    on{" "}
                                                                                    {new Date(
                                                                                        product.endTime
                                                                                    ).toLocaleDateString()}
                                                                                </span>
                                                                            )
                                                                        ) : (
                                                                            <span>
                                                                                No
                                                                                end
                                                                                date
                                                                                set
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Bids tab */}
                        {activeTab === "bids" && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    My Bids
                                </h2>

                                {userBids.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
                                        <p className="text-gray-500 mb-6">
                                            You haven't placed any bids yet.
                                        </p>
                                        <Link
                                            to="/auctions"
                                            className="btn-primary"
                                        >
                                            Browse Auctions
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <ul className="divide-y divide-gray-200">
                                            {userBids.map((bid) => {
                                                const isActive =
                                                    bid.product &&
                                                    bid.product.endTime
                                                        ? new Date(
                                                              bid.product.endTime
                                                          ) > new Date()
                                                        : false
                                                const isHighestBidder =
                                                    bid.isHighestBid

                                                return (
                                                    <li
                                                        key={bid._id}
                                                        className="px-6 py-4"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    src={
                                                                        bid.product &&
                                                                        bid
                                                                            .product
                                                                            .images &&
                                                                        bid
                                                                            .product
                                                                            .images
                                                                            .length >
                                                                            0
                                                                            ? bid
                                                                                  .product
                                                                                  .images[0]
                                                                            : "https://via.placeholder.com/50"
                                                                    }
                                                                    alt={
                                                                        bid.product
                                                                            ? bid
                                                                                  .product
                                                                                  .title ||
                                                                              "Product"
                                                                            : "Product"
                                                                    }
                                                                    className="h-16 w-16 rounded-md object-cover"
                                                                />
                                                            </div>
                                                            <div className="ml-4 flex-1">
                                                                <div className="flex justify-between">
                                                                    <Link
                                                                        to={`/product/${
                                                                            bid.product
                                                                                ? bid
                                                                                      .product
                                                                                      ._id
                                                                                : "not-found"
                                                                        }`}
                                                                        className="text-lg font-medium text-primary-600 hover:text-primary-800"
                                                                    >
                                                                        {bid.product
                                                                            ? bid
                                                                                  .product
                                                                                  .title ||
                                                                              "Unknown Product"
                                                                            : "Unknown Product"}
                                                                    </Link>
                                                                    <div className="flex items-center space-x-2">
                                                                        {isActive ? (
                                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                                Active
                                                                            </span>
                                                                        ) : (
                                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                                                Ended
                                                                            </span>
                                                                        )}

                                                                        {isHighestBidder && (
                                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-800">
                                                                                Highest
                                                                                Bid
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 flex justify-between">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Your
                                                                            bid:{" "}
                                                                            <span className="font-medium">
                                                                                $
                                                                                {(bid.amount !=
                                                                                    null &&
                                                                                !isNaN(
                                                                                    bid.amount
                                                                                )
                                                                                    ? parseFloat(
                                                                                          bid.amount
                                                                                      )
                                                                                    : 0
                                                                                ).toFixed(
                                                                                    2
                                                                                )}
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            Current
                                                                            highest:{" "}
                                                                            <span className="font-medium">
                                                                                $
                                                                                {(bid.product &&
                                                                                bid
                                                                                    .product
                                                                                    .currentBid !=
                                                                                    null &&
                                                                                !isNaN(
                                                                                    bid
                                                                                        .product
                                                                                        .currentBid
                                                                                )
                                                                                    ? parseFloat(
                                                                                          bid
                                                                                              .product
                                                                                              .currentBid
                                                                                      )
                                                                                    : bid.product &&
                                                                                      bid
                                                                                          .product
                                                                                          .startingPrice !=
                                                                                          null &&
                                                                                      !isNaN(
                                                                                          bid
                                                                                              .product
                                                                                              .startingPrice
                                                                                      )
                                                                                    ? parseFloat(
                                                                                          bid
                                                                                              .product
                                                                                              .startingPrice
                                                                                      )
                                                                                    : 0
                                                                                ).toFixed(
                                                                                    2
                                                                                )}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        Bid
                                                                        placed
                                                                        on{" "}
                                                                        {new Date(
                                                                            bid.createdAt
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Won Auctions tab */}
                        {activeTab === "won" && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    Won Auctions
                                </h2>

                                {winningBids.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
                                        <p className="text-gray-500 mb-6">
                                            You haven't won any auctions yet.
                                        </p>
                                        <Link
                                            to="/auctions"
                                            className="btn-primary"
                                        >
                                            Browse Auctions
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <ul className="divide-y divide-gray-200">
                                            {winningBids.map((bid) => (
                                                <li
                                                    key={bid._id}
                                                    className="px-6 py-4"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src={
                                                                    bid.product &&
                                                                    bid.product
                                                                        .images &&
                                                                    bid.product
                                                                        .images
                                                                        .length >
                                                                        0
                                                                        ? bid
                                                                              .product
                                                                              .images[0]
                                                                        : "https://via.placeholder.com/50"
                                                                }
                                                                alt={
                                                                    bid.product
                                                                        ? bid
                                                                              .product
                                                                              .title ||
                                                                          "Product"
                                                                        : "Product"
                                                                }
                                                                className="h-16 w-16 rounded-md object-cover"
                                                            />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <div className="flex justify-between">
                                                                <Link
                                                                    to={`/product/${
                                                                        bid.product
                                                                            ? bid
                                                                                  .product
                                                                                  ._id
                                                                            : "not-found"
                                                                    }`}
                                                                    className="text-lg font-medium text-primary-600 hover:text-primary-800"
                                                                >
                                                                    {bid.product
                                                                        ? bid
                                                                              .product
                                                                              .title ||
                                                                          "Unknown Product"
                                                                        : "Unknown Product"}
                                                                </Link>
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                    Won
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 flex justify-between">
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Winning
                                                                        bid:{" "}
                                                                        <span className="font-medium">
                                                                            $
                                                                            {(bid.amount !=
                                                                                null &&
                                                                            !isNaN(
                                                                                bid.amount
                                                                            )
                                                                                ? parseFloat(
                                                                                      bid.amount
                                                                                  )
                                                                                : 0
                                                                            ).toFixed(
                                                                                2
                                                                            )}
                                                                        </span>
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        Seller:{" "}
                                                                        <span className="font-medium">
                                                                            {bid.product &&
                                                                            bid
                                                                                .product
                                                                                .seller &&
                                                                            bid
                                                                                .product
                                                                                .seller
                                                                                .name
                                                                                ? bid
                                                                                      .product
                                                                                      .seller
                                                                                      .name
                                                                                : "Unknown"}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Auction
                                                                    ended on{" "}
                                                                    {bid.product &&
                                                                    bid.product
                                                                        .endTime
                                                                        ? new Date(
                                                                              bid.product.endTime
                                                                          ).toLocaleDateString()
                                                                        : "unknown date"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default DashboardPage
