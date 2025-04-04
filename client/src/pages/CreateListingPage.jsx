import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { createProduct } from "../api/productService"
import { getCategories } from "../api/categoryService"
import { useAuth } from "../context/AuthContext"
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline"

const CreateListingPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [selectedImages, setSelectedImages] = useState([])
    const [imageFiles, setImageFiles] = useState([])
    const [imageError, setImageError] = useState("")
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories()
                setCategories(data.categories || [])
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            }
        }

        fetchCategories()
    }, [])

    // Handle image selection
    const handleImageChange = (e) => {
        setImageError("")
        const files = Array.from(e.target.files)

        // Validate file types and size
        const validFiles = files.filter((file) => {
            const isValidType = [
                "image/jpeg",
                "image/png",
                "image/webp",
            ].includes(file.type)
            const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB max

            if (!isValidType) {
                setImageError("Only JPEG, PNG, and WebP images are allowed")
                return false
            }

            if (!isValidSize) {
                setImageError("Images must be less than 5MB")
                return false
            }

            return true
        })

        if (validFiles.length === 0) return

        // Limit to 5 images
        if (selectedImages.length + validFiles.length > 5) {
            setImageError("You can upload a maximum of 5 images")
            return
        }

        // Create preview URLs
        const newImagePreviews = validFiles.map((file) =>
            URL.createObjectURL(file)
        )

        setSelectedImages((prev) => [...prev, ...newImagePreviews])
        setImageFiles((prev) => [...prev, ...validFiles])
    }

    // Remove an image
    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index))
        setImageFiles((prev) => prev.filter((_, i) => i !== index))
    }

    // Form submission handler
    const onSubmit = async (data) => {
        if (imageFiles.length === 0) {
            setImageError("Please upload at least one image")
            return
        }

        setError("")
        setLoading(true)

        try {
            // Prepare form data with images
            const productData = {
                ...data,
                startingPrice: parseFloat(data.startingPrice),
                bidIncrement: parseFloat(data.bidIncrement),
                images: imageFiles,
            }

            // Convert endTime to ISO string
            if (data.endTime) {
                const endDate = new Date(data.endTime)
                productData.endTime = endDate.toISOString()
            }

            await createProduct(productData)
            setSuccess(true)
            reset()
            setSelectedImages([])
            setImageFiles([])

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate("/dashboard")
            }, 2000)
        } catch (err) {
            setError(
                err.message || "Failed to create listing. Please try again."
            )
        } finally {
            setLoading(false)
        }
    }

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
        }
    }, [isAuthenticated, navigate])

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create New Listing
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Fill out the form below to list your item for auction.
                    </p>
                </div>

                {success ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    Your listing has been created successfully!
                                    Redirecting to dashboard...
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-white shadow-md rounded-lg p-6"
                    >
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div className="mb-6">
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                className={`form-input ${
                                    errors.title
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                {...register("title", {
                                    required: "Title is required",
                                    minLength: {
                                        value: 5,
                                        message:
                                            "Title must be at least 5 characters",
                                    },
                                    maxLength: {
                                        value: 100,
                                        message:
                                            "Title must be less than 100 characters",
                                    },
                                })}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Description *
                            </label>
                            <textarea
                                id="description"
                                rows="4"
                                className={`form-input ${
                                    errors.description
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                {...register("description", {
                                    required: "Description is required",
                                    minLength: {
                                        value: 20,
                                        message:
                                            "Description must be at least 20 characters",
                                    },
                                })}
                            ></textarea>
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="mb-6">
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Category *
                            </label>
                            <select
                                id="category"
                                className={`form-input ${
                                    errors.categoryId
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                {...register("categoryId", {
                                    required: "Please select a category",
                                })}
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category._id}
                                        value={category._id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.category.message}
                                </p>
                            )}
                        </div>

                        {/* Condition */}
                        <div className="mb-6">
                            <label
                                htmlFor="condition"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Condition *
                            </label>
                            <select
                                id="condition"
                                className={`form-input ${
                                    errors.condition
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                {...register("condition", {
                                    required: "Please select a condition",
                                })}
                            >
                                <option value="">Select condition</option>
                                <option value="New">New</option>
                                <option value="Like New">Like New</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                            {errors.condition && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.condition.message}
                                </p>
                            )}
                        </div>

                        {/* Starting Price */}
                        <div className="mb-6">
                            <label
                                htmlFor="startingPrice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Starting Price ($) *
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">
                                        $
                                    </span>
                                </div>
                                <input
                                    id="startingPrice"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className={`form-input pl-7 ${
                                        errors.startingPrice
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }`}
                                    {...register("startingPrice", {
                                        required: "Starting price is required",
                                        min: {
                                            value: 0.01,
                                            message:
                                                "Starting price must be at least $0.01",
                                        },
                                        pattern: {
                                            value: /^\d+(\.\d{1,2})?$/,
                                            message:
                                                "Please enter a valid price",
                                        },
                                    })}
                                />
                            </div>
                            {errors.startingPrice && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.startingPrice.message}
                                </p>
                            )}
                        </div>

                        {/* Bid Increment */}
                        <div className="mb-6">
                            <label
                                htmlFor="bidIncrement"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Minimum Bid Increment ($) *
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">
                                        $
                                    </span>
                                </div>
                                <input
                                    id="bidIncrement"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className={`form-input pl-7 ${
                                        errors.bidIncrement
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }`}
                                    {...register("bidIncrement", {
                                        required: "Bid increment is required",
                                        min: {
                                            value: 0.01,
                                            message:
                                                "Bid increment must be at least $0.01",
                                        },
                                        pattern: {
                                            value: /^\d+(\.\d{1,2})?$/,
                                            message:
                                                "Please enter a valid amount",
                                        },
                                    })}
                                />
                            </div>
                            {errors.bidIncrement && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.bidIncrement.message}
                                </p>
                            )}
                        </div>

                        {/* End Time */}
                        <div className="mb-6">
                            <label
                                htmlFor="endTime"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Auction End Date/Time *
                            </label>
                            <input
                                id="endTime"
                                type="datetime-local"
                                className={`form-input ${
                                    errors.endTime
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                {...register("endTime", {
                                    required: "End time is required",
                                    validate: (value) => {
                                        const endDate = new Date(value)
                                        const now = new Date()
                                        return (
                                            endDate > now ||
                                            "End time must be in the future"
                                        )
                                    },
                                })}
                            />
                            {errors.endTime && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.endTime.message}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <label
                                htmlFor="location"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Location
                            </label>
                            <input
                                id="location"
                                type="text"
                                className="form-input border-gray-300"
                                {...register("location")}
                            />
                        </div>

                        {/* Images */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Images * (Max 5)
                            </label>

                            {/* Image preview */}
                            {selectedImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Preview ${index + 1}`}
                                                className="h-32 w-full object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                            >
                                                <XMarkIcon className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Image upload */}
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="images"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                        >
                                            <span>Upload images</span>
                                            <input
                                                id="images"
                                                name="images"
                                                type="file"
                                                className="sr-only"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, WEBP up to 5MB
                                    </p>
                                </div>
                            </div>
                            {imageError && (
                                <p className="mt-1 text-sm text-red-600">
                                    {imageError}
                                </p>
                            )}
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? (
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
                                        Creating...
                                    </span>
                                ) : (
                                    "Create Listing"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default CreateListingPage
