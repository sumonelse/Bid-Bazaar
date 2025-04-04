import { useState, useEffect } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { getCategories } from "../../api/categoryService"

const ProductFilters = ({ initialFilters = {}, onFilterChange }) => {
    const [categories, setCategories] = useState([])
    const [selectedCategories, setSelectedCategories] = useState(
        initialFilters.categories || []
    )
    const [priceRange, setPriceRange] = useState({
        min:
            initialFilters.price?.min !== undefined
                ? initialFilters.price.min.toString()
                : "",
        max:
            initialFilters.price?.max !== undefined
                ? initialFilters.price.max.toString()
                : "",
    })
    const [status, setStatus] = useState(initialFilters.status || "all") // 'all', 'active', 'ended'
    const [sortBy, setSortBy] = useState(initialFilters.sortBy || "newest") // 'newest', 'ending-soon', 'price-low', 'price-high'
    const [loading, setLoading] = useState(true)

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories()
                setCategories(data.categories || [])
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    // Update filters when any filter changes
    useEffect(() => {
        const filters = {
            categories: selectedCategories,
            price: {
                min: priceRange.min !== "" ? Number(priceRange.min) : undefined,
                max: priceRange.max !== "" ? Number(priceRange.max) : undefined,
            },
            status,
            sortBy,
        }

        onFilterChange(filters)
    }, [selectedCategories, priceRange, status, sortBy, onFilterChange])

    // Toggle category selection
    const toggleCategory = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    // Clear all filters
    const clearFilters = () => {
        setSelectedCategories([])
        setPriceRange({ min: "", max: "" })
        setStatus("all")
        setSortBy("newest")
    }

    // Handle price range input
    const handlePriceChange = (e) => {
        const { name, value } = e.target
        setPriceRange((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-800 flex items-center group"
                >
                    <XMarkIcon className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:underline">
                        Clear all filters
                    </span>
                </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-primary-500 rounded mr-2"></span>
                    Categories
                </h4>
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div
                                key={index}
                                className="h-5 bg-gray-200 rounded w-3/4"
                            ></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="flex items-center"
                            >
                                <input
                                    id={`category-${category._id}`}
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={selectedCategories.includes(
                                        category._id
                                    )}
                                    onChange={() =>
                                        toggleCategory(category._id)
                                    }
                                />
                                <label
                                    htmlFor={`category-${category._id}`}
                                    className="ml-2 text-sm text-gray-700 hover:text-primary-600 cursor-pointer transition-colors duration-200"
                                >
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-accent-500 rounded mr-2"></span>
                    Price Range
                </h4>
                <div className="flex space-x-3">
                    <div className="flex-1">
                        <label
                            htmlFor="min-price"
                            className="text-xs text-gray-500 mb-1 block"
                        >
                            Min Price
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">
                                    $
                                </span>
                            </div>
                            <input
                                type="number"
                                name="min"
                                id="min-price"
                                className="form-input pl-7 block w-full sm:text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                                placeholder="0"
                                value={priceRange.min}
                                onChange={handlePriceChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label
                            htmlFor="max-price"
                            className="text-xs text-gray-500 mb-1 block"
                        >
                            Max Price
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">
                                    $
                                </span>
                            </div>
                            <input
                                type="number"
                                name="max"
                                id="max-price"
                                className="form-input pl-7 block w-full sm:text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Any"
                                value={priceRange.max}
                                onChange={handlePriceChange}
                                min="0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="mb-8">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-green-500 rounded mr-2"></span>
                    Status
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    <div
                        className={`flex items-center justify-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                            status === "all"
                                ? "bg-primary-100 text-primary-700 font-medium border-2 border-primary-200"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setStatus("all")}
                    >
                        All
                    </div>
                    <div
                        className={`flex items-center justify-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                            status === "active"
                                ? "bg-green-100 text-green-700 font-medium border-2 border-green-200"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setStatus("active")}
                    >
                        Active
                    </div>
                    <div
                        className={`flex items-center justify-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                            status === "ended"
                                ? "bg-red-100 text-red-700 font-medium border-2 border-red-200"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setStatus("ended")}
                    >
                        Ended
                    </div>
                </div>
            </div>

            {/* Sort By */}
            <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-secondary-500 rounded mr-2"></span>
                    Sort By
                </h4>
                <select
                    className="form-input block w-full sm:text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500 py-2.5"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="ending-soon">Ending Soon</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Bids</option>
                </select>
            </div>
        </div>
    )
}

export default ProductFilters
