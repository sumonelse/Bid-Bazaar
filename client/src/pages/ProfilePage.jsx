import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { getUserProducts } from "../api/productService"
import { getUserBids, getUserWinningBids } from "../api/bidService"
import {
    PencilIcon,
    CameraIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    ClockIcon,
    CheckCircleIcon,
    TagIcon,
} from "@heroicons/react/24/outline"

const ProfilePage = () => {
    const { currentUser, updateUserProfile } = useAuth()
    const [userProducts, setUserProducts] = useState([])
    const [userBids, setUserBids] = useState([])
    const [winningBids, setWinningBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        bio: "",
        location: "",
        phone: "",
    })
    const [avatar, setAvatar] = useState(null)
    const [previewAvatar, setPreviewAvatar] = useState(null)
    const [stats, setStats] = useState({
        activeListings: 0,
        endedListings: 0,
        activeBids: 0,
        wonAuctions: 0,
    })

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                name: currentUser.name || "",
                email: currentUser.email || "",
                bio: currentUser.bio || "",
                location: currentUser.location || "",
                phone: currentUser.phone || "",
            })

            if (currentUser.avatar) {
                setPreviewAvatar(currentUser.avatar)
            }

            fetchUserData()
        }
    }, [currentUser])

    const fetchUserData = async () => {
        if (!currentUser) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)

            // Fetch user's products
            const productsData = await getUserProducts(currentUser._id)
            const products = productsData.data?.products || []
            setUserProducts(products)

            // Fetch user's bids
            const bidsData = await getUserBids()
            const bids = bidsData?.bids || []

            // Transform bids if needed
            const transformedBids = bids.map((bid) => {
                if (bid.productId && !bid.product) {
                    bid.product = bid.productId
                    delete bid.productId
                }
                return bid
            })

            setUserBids(transformedBids)

            // Fetch user's winning bids
            const winningBidsData = await getUserWinningBids()
            const winningBidsArray = winningBidsData?.bids || []

            // Transform winning bids if needed
            const transformedWinningBids = winningBidsArray.map((bid) => {
                if (bid.productId && !bid.product) {
                    bid.product = bid.productId
                    delete bid.productId
                }
                return bid
            })

            setWinningBids(transformedWinningBids)

            // Calculate statistics
            const activeListings = products.filter(
                (product) =>
                    product.endTime && new Date(product.endTime) > new Date()
            ).length

            const endedListings = products.length - activeListings

            const activeBids = transformedBids.filter(
                (bid) =>
                    bid.product &&
                    bid.product.endTime &&
                    new Date(bid.product.endTime) > new Date()
            ).length

            setStats({
                activeListings,
                endedListings,
                activeBids,
                wonAuctions: transformedWinningBids.length,
            })
        } catch (error) {
            console.error("Failed to fetch user data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatar(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewAvatar(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const formData = new FormData()
            formData.append("name", profileData.name)
            formData.append("bio", profileData.bio)
            formData.append("location", profileData.location)
            formData.append("phone", profileData.phone)

            if (avatar) {
                formData.append("avatar", avatar)
            }

            await updateUserProfile(formData)
            setEditMode(false)
        } catch (error) {
            console.error("Failed to update profile:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 relative inline-block">
                        <span className="relative z-10">My Profile</span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-primary-100 -z-10 transform -translate-y-2"></span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative h-40 bg-gradient-to-r from-primary-500 to-accent-500 bg-pattern-grid">
                                {editMode ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                        <label
                                            htmlFor="cover-photo"
                                            className="cursor-pointer bg-white bg-opacity-80 rounded-full p-2"
                                        >
                                            <CameraIcon className="h-6 w-6 text-gray-700" />
                                            <input
                                                id="cover-photo"
                                                type="file"
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                ) : null}
                            </div>

                            <div className="relative px-6 pt-16 pb-6">
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                                    <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                                        {previewAvatar ? (
                                            <img
                                                src={previewAvatar}
                                                alt={currentUser?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircleIcon className="w-full h-full text-gray-300" />
                                        )}

                                        {editMode && (
                                            <label
                                                htmlFor="avatar-upload"
                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer"
                                            >
                                                <CameraIcon className="h-8 w-8 text-white" />
                                                <input
                                                    id="avatar-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={
                                                        handleAvatarChange
                                                    }
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {editMode ? (
                                    <form
                                        onSubmit={handleSubmit}
                                        className="mt-4"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={profileData.name}
                                                    onChange={handleInputChange}
                                                    className="form-input mt-1"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="form-input mt-1 bg-gray-50"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Email cannot be changed
                                                </p>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="bio"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Bio
                                                </label>
                                                <textarea
                                                    id="bio"
                                                    name="bio"
                                                    rows="3"
                                                    value={profileData.bio}
                                                    onChange={handleInputChange}
                                                    className="form-input mt-1"
                                                    placeholder="Tell us about yourself"
                                                ></textarea>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="location"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    id="location"
                                                    name="location"
                                                    value={profileData.location}
                                                    onChange={handleInputChange}
                                                    className="form-input mt-1"
                                                    placeholder="City, Country"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={profileData.phone}
                                                    onChange={handleInputChange}
                                                    className="form-input mt-1"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>

                                            <div className="flex space-x-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="btn-primary flex-1"
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditMode(false)
                                                    }
                                                    className="btn-outline flex-1"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {currentUser?.name}
                                        </h2>
                                        <p className="text-gray-500 mt-1">
                                            {currentUser?.email}
                                        </p>

                                        {profileData.bio && (
                                            <p className="text-gray-700 mt-4">
                                                {profileData.bio}
                                            </p>
                                        )}

                                        <div className="mt-6 space-y-3">
                                            {profileData.location && (
                                                <div className="flex items-center justify-center text-gray-600">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 mr-2"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    {profileData.location}
                                                </div>
                                            )}

                                            {profileData.phone && (
                                                <div className="flex items-center justify-center text-gray-600">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 mr-2"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                        />
                                                    </svg>
                                                    {profileData.phone}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8">
                                            <button
                                                onClick={() =>
                                                    setEditMode(true)
                                                }
                                                className="btn-outline inline-flex items-center"
                                            >
                                                <PencilIcon className="h-4 w-4 mr-2" />
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Stats */}
                        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Account Statistics
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-primary-100 p-2 rounded-full mr-3">
                                            <TagIcon className="h-5 w-5 text-primary-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            Active Listings
                                        </span>
                                    </div>
                                    <span className="font-semibold text-primary-600">
                                        {stats.activeListings}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                                            <ClockIcon className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            Ended Listings
                                        </span>
                                    </div>
                                    <span className="font-semibold text-gray-600">
                                        {stats.endedListings}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-accent-100 p-2 rounded-full mr-3">
                                            <ShieldCheckIcon className="h-5 w-5 text-accent-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            Active Bids
                                        </span>
                                    </div>
                                    <span className="font-semibold text-accent-600">
                                        {stats.activeBids}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-2 rounded-full mr-3">
                                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            Won Auctions
                                        </span>
                                    </div>
                                    <span className="font-semibold text-green-600">
                                        {stats.wonAuctions}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-500">
                                    Member since{" "}
                                    {new Date(
                                        currentUser?.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                                            const isBid = "amount" in item
                                            const date = new Date(
                                                item.createdAt
                                            )
                                            const formattedDate =
                                                date.toLocaleDateString()
                                            const formattedTime =
                                                date.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })

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
                                                                <a
                                                                    href={`/product/${
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
                                                                </a>
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
                                                                item.product
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

                        {/* Recent Listings */}
                        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    My Recent Listings
                                </h3>
                            </div>

                            {userProducts.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-gray-500 mb-4">
                                        You haven't created any listings yet.
                                    </p>
                                    <a
                                        href="/create-listing"
                                        className="btn-primary"
                                    >
                                        Create Your First Listing
                                    </a>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {userProducts.slice(0, 3).map((product) => {
                                        const isActive = product.endTime
                                            ? new Date(product.endTime) >
                                              new Date()
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
                                                                product.images
                                                                    .length > 0
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
                                                            <a
                                                                href={`/product/${product._id}`}
                                                                className="text-lg font-medium text-primary-600 hover:text-primary-800"
                                                            >
                                                                {product.title}
                                                            </a>
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
                                                                    Current bid:{" "}
                                                                    <span className="font-medium">
                                                                        ₹
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
                                                                    product.bids
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
                                                                        No end
                                                                        date set
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
                            )}

                            {userProducts.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <a
                                        href="/dashboard"
                                        className="text-primary-600 hover:text-primary-800 font-medium"
                                    >
                                        View all listings →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
