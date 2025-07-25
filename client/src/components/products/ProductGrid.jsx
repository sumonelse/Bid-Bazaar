import ProductCard from "./ProductCard"

const ProductGrid = ({ products, loading, error }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                {[...Array(8)].map((_, index) => (
                    <div
                        key={index}
                        className="card animate-pulse bg-white rounded-xl overflow-hidden h-full"
                    >
                        <div className="bg-gray-200 h-56 mb-4"></div>
                        <div className="p-5">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="flex justify-between">
                                <div>
                                    <div className="h-7 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded-full w-28"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
            >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        )
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium text-gray-900">
                    No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter to find what you're
                    looking for.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    )
}

export default ProductGrid
