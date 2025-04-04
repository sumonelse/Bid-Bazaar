import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { getProducts } from "../api/productService"
import ProductGrid from "../components/products/ProductGrid"
import ProductFilters from "../components/products/ProductFilters"
import useDebounce from "../hooks/useDebounce"

const AuctionsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalProducts, setTotalProducts] = useState(0)

    // Initialize state from URL parameters
    const initialPage = parseInt(searchParams.get("page")) || 1
    const [currentPage, setCurrentPage] = useState(initialPage)

    // Parse categories from URL
    const categoriesParam = searchParams.get("categories")
    const initialCategories = categoriesParam ? categoriesParam.split(",") : []

    // Parse price filters from URL
    const minPriceParam = searchParams.get("minPrice")
    const maxPriceParam = searchParams.get("maxPrice")

    // Parse status and sort from URL
    const statusParam = searchParams.get("status") || "all"
    const sortParam = searchParams.get("sort") || "newest"

    const [filters, setFilters] = useState({
        categories: initialCategories,
        price: {
            min: minPriceParam ? parseFloat(minPriceParam) : undefined,
            max: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
        },
        status: statusParam,
        sortBy: sortParam,
    })

    const searchQuery = searchParams.get("q") || ""
    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const productsPerPage = 12

    // Update URL when filters change
    useEffect(() => {
        // Create a new URLSearchParams object instead of modifying the existing one
        const params = new URLSearchParams()

        // Preserve the search query if it exists
        if (searchQuery) {
            params.set("q", searchQuery)
        }

        // Update search params based on filters
        if (filters.categories.length > 0) {
            params.set("categories", filters.categories.join(","))
        }

        if (filters.price.min !== undefined) {
            params.set("minPrice", filters.price.min)
        }

        if (filters.price.max !== undefined) {
            params.set("maxPrice", filters.price.max)
        }

        if (filters.status !== "all") {
            params.set("status", filters.status)
        }

        if (filters.sortBy !== "newest") {
            params.set("sort", filters.sortBy)
        }

        params.set("page", currentPage)

        // Only update if the params string is different from the current searchParams
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()

        if (newParamsString !== currentParamsString) {
            setSearchParams(params)
        }
    }, [filters, currentPage, searchQuery, searchParams, setSearchParams])

    // Fetch products when filters or search query change
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)

                // Prepare query parameters
                const queryParams = {
                    page: currentPage,
                    limit: productsPerPage,
                    search: debouncedSearchQuery,
                }

                // Add filter parameters
                if (filters.categories.length > 0) {
                    queryParams.categories = filters.categories.join(",")
                }

                if (filters.price.min !== undefined) {
                    queryParams.minPrice = filters.price.min
                }

                if (filters.price.max !== undefined) {
                    queryParams.maxPrice = filters.price.max
                }

                if (filters.status !== "all") {
                    queryParams.status = filters.status
                }

                // Map sort options to API parameters
                switch (filters.sortBy) {
                    case "ending-soon":
                        queryParams.sortBy = "endTime"
                        queryParams.sortOrder = "asc"
                        break
                    case "price-low":
                        queryParams.sortBy = "currentBid"
                        queryParams.sortOrder = "asc"
                        break
                    case "price-high":
                        queryParams.sortBy = "currentBid"
                        queryParams.sortOrder = "desc"
                        break
                    case "popular":
                        queryParams.sortBy = "bidCount"
                        queryParams.sortOrder = "desc"
                        break
                    default:
                        queryParams.sortBy = "createdAt"
                        queryParams.sortOrder = "desc"
                }

                const data = await getProducts(queryParams)
                setProducts(data.products || [])
                setTotalProducts(data.total || 0)
            } catch (err) {
                setError("Failed to load products. Please try again later.")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [filters, currentPage, debouncedSearchQuery, productsPerPage])

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        // Only update if filters actually changed
        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            setFilters(newFilters)
            setCurrentPage(1) // Reset to first page when filters change
        }
    }

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / productsPerPage)

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 relative inline-block">
                        <span className="relative z-10">
                            {debouncedSearchQuery
                                ? `Search Results for "${debouncedSearchQuery}"`
                                : "Browse Auctions"}
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-primary-100 -z-10 transform -translate-y-2"></span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-600">
                        {totalProducts} {totalProducts === 1 ? "item" : "items"}{" "}
                        found
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Filters sidebar */}
                    <div className="w-full md:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                                Filters
                            </h2>
                            <ProductFilters
                                initialFilters={filters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="flex-1">
                        <ProductGrid
                            products={products}
                            loading={loading}
                            error={error}
                        />

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="mt-10 flex justify-center">
                                <nav className="flex items-center">
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-md mr-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 hover:shadow font-medium"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex space-x-2">
                                        {[...Array(totalPages)].map(
                                            (_, index) => {
                                                const page = index + 1
                                                // Show current page, first page, last page, and pages around current
                                                if (
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 &&
                                                        page <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    page
                                                                )
                                                            }
                                                            className={`w-10 h-10 flex items-center justify-center rounded-md ${
                                                                currentPage ===
                                                                page
                                                                    ? "bg-primary-600 text-white shadow-md font-semibold"
                                                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow transition-all duration-200"
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                                } else if (
                                                    (page === currentPage - 2 &&
                                                        currentPage > 3) ||
                                                    (page === currentPage + 2 &&
                                                        currentPage <
                                                            totalPages - 2)
                                                ) {
                                                    return (
                                                        <span
                                                            key={page}
                                                            className="w-10 h-10 flex items-center justify-center text-gray-500"
                                                        >
                                                            &hellip;
                                                        </span>
                                                    )
                                                }
                                                return null
                                            }
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-md ml-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 hover:shadow font-medium"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}

                        {/* No results message */}
                        {!loading && products.length === 0 && (
                            <div className="bg-white rounded-xl shadow-md p-10 text-center">
                                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No auctions found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Try adjusting your filters or search
                                    criteria
                                </p>
                                <button
                                    onClick={() => {
                                        setFilters({
                                            categories: [],
                                            price: {
                                                min: undefined,
                                                max: undefined,
                                            },
                                            status: "all",
                                            sortBy: "newest",
                                        })
                                        setCurrentPage(1)
                                    }}
                                    className="btn-primary"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuctionsPage
