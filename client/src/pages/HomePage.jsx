import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getProducts } from "../api/productService"
import { getCategories } from "../api/categoryService"
import ProductGrid from "../components/products/ProductGrid"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [endingSoonProducts, setEndingSoonProducts] = useState([])
    const [popularCategories, setPopularCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch featured products
                const featuredData = await getProducts({
                    featured: true,
                    limit: 8,
                })
                console.log("Featured products:", featuredData)
                setFeaturedProducts(featuredData.products || [])

                // Fetch ending soon products
                const endingSoonData = await getProducts({
                    sortBy: "endingSoon",
                    status: "live",
                    limit: 8,
                })
                console.log("Ending soon products:", endingSoonData)
                setEndingSoonProducts(endingSoonData.products || [])

                // Fetch categories
                const categoriesData = await getCategories()
                console.log("Categories data:", categoriesData)
                if (categoriesData && categoriesData.categories) {
                    setPopularCategories(
                        categoriesData.categories.slice(0, 6) || []
                    )
                } else {
                    console.error(
                        "No categories found in response:",
                        categoriesData
                    )
                }
            } catch (err) {
                setError("Failed to load products. Please try again later.")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-pattern-dots"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                            Find Unique Items at{" "}
                            <span className="text-accent-300">
                                Great Prices
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-10 max-w-3xl mx-auto text-gray-100">
                            Join thousands of bidders on BidBazaar, your premier
                            online auction platform.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
                            <Link
                                to="/auctions"
                                className="btn bg-white text-primary-700 hover:bg-gray-100 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
                            >
                                Browse Auctions
                            </Link>
                            <Link
                                to="/register"
                                className="btn bg-accent-500 text-white hover:bg-accent-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
                            >
                                Start Bidding
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
            </section>

            {/* Featured Products */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 relative">
                            <span className="relative z-10">
                                Featured Auctions
                            </span>
                            <span className="absolute bottom-0 left-0 w-1/2 h-3 bg-accent-100 -z-10 transform -translate-y-2"></span>
                        </h2>
                        <Link
                            to="/auctions"
                            className="text-primary-600 hover:text-primary-800 flex items-center group"
                        >
                            <span className="mr-2 font-medium">
                                View all auctions
                            </span>
                            <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                    </div>
                    <ProductGrid
                        products={featuredProducts}
                        loading={loading}
                        error={error}
                    />
                </div>
            </section>

            {/* Categories */}
            <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-10 relative inline-block">
                        <span className="relative z-10">
                            Popular Categories
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-primary-100 -z-10 transform -translate-y-2"></span>
                    </h2>
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                            {[...Array(6)].map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow animate-pulse h-32 sm:h-40"
                                ></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                            {popularCategories.map((category) => (
                                <Link
                                    key={category._id}
                                    to={`/categories/${category._id}`}
                                    className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
                                >
                                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary-100 group-hover:bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
                                        <span className="text-primary-600 group-hover:text-primary-700 text-xl sm:text-2xl font-bold transition-colors duration-300">
                                            {category.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Ending Soon */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 relative">
                            <span className="relative z-10">Ending Soon</span>
                            <span className="absolute bottom-0 left-0 w-1/2 h-3 bg-red-100 -z-10 transform -translate-y-2"></span>
                        </h2>
                        <Link
                            to="/auctions?sort=ending-soon"
                            className="text-primary-600 hover:text-primary-800 flex items-center group"
                        >
                            <span className="mr-2 font-medium">
                                View all ending soon
                            </span>
                            <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                    </div>
                    <ProductGrid
                        products={endingSoonProducts}
                        loading={loading}
                        error={error}
                    />
                </div>
            </section>

            {/* How It Works */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center relative inline-block">
                        <span className="relative z-10">How It Works</span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-success-100 -z-10 transform -translate-y-2"></span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
                                <span className="text-primary-600 text-xl sm:text-2xl font-bold">
                                    1
                                </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
                                Browse Auctions
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Explore our wide range of products across
                                various categories. Find unique items that match
                                your interests.
                            </p>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
                                <span className="text-accent-600 text-xl sm:text-2xl font-bold">
                                    2
                                </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
                                Place Your Bid
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Bid on items you're interested in and track your
                                bids in real-time. Get notifications when you're
                                outbid.
                            </p>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
                                <span className="text-success-600 text-xl sm:text-2xl font-bold">
                                    3
                                </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
                                Win & Collect
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                If you're the highest bidder when the auction
                                ends, the item is yours! We'll notify you of
                                your win.
                            </p>
                        </div>
                    </div>
                    <div className="text-center mt-8 sm:mt-12">
                        <Link
                            to="/register"
                            className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
