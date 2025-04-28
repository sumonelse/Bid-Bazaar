import productService from "../services/productService.js"
import ApiResponse from "../utils/ApiResponse.js"

class ProductController {
    // Create a new product
    async createProduct(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const product = await productService.createProduct(
                req.body,
                req.user._id
            )
            return apiResponse.success(
                product,
                "Product created successfully",
                201
            )
        } catch (error) {
            console.error("Create product error:", error)
            const statusCode =
                error.message === "Category not found" ? 404 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Get products with filtering and pagination
    async getProducts(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const {
                page = 1,
                limit = 10,
                sortBy,
                sortOrder,
                search,
                ...filters
            } = req.query

            // Convert string numbers to actual numbers
            const numericPage = parseInt(page)
            const numericLimit = parseInt(limit)

            // Parse price filters
            if (filters.minPrice)
                filters.minPrice = parseFloat(filters.minPrice)
            if (filters.maxPrice)
                filters.maxPrice = parseFloat(filters.maxPrice)

            // Add search parameter if provided
            if (search) {
                filters.search = search
            }

            // Add sort parameters if provided
            if (sortBy) {
                filters.sortBy = sortBy
            }

            if (sortOrder) {
                filters.sortOrder = sortOrder
            }

            console.log("Filters received:", filters)

            const result = await productService.getProducts(
                filters,
                numericPage,
                numericLimit
            )
            return apiResponse.success(
                result,
                "Products retrieved successfully"
            )
        } catch (error) {
            console.error("Get products error:", error)
            return apiResponse.error("Server error", 500)
        }
    }

    // Get featured products
    async getFeaturedProducts(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { limit = 4 } = req.query
            const featuredProducts = await productService.getFeaturedProducts(
                parseInt(limit)
            )
            return apiResponse.success(featuredProducts)
        } catch (error) {
            console.error("Get featured products error:", error)
            return apiResponse.error("Server error", 500)
        }
    }

    // Get product by ID
    async getProductById(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const product = await productService.getProductById(req.params.id)
            await productService.checkAuctionStatus(req.params.id) // Check auction status
            return apiResponse.success(
                product,
                "Product retrieved successfully"
            )
        } catch (error) {
            console.error("Get product error:", error)
            const statusCode = error.message === "Product not found" ? 404 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Update product
    async updateProduct(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const updatedProduct = await productService.updateProduct(
                req.params.id,
                req.body,
                req.user._id
            )
            return apiResponse.success(
                updatedProduct,
                "Product updated successfully"
            )
        } catch (error) {
            console.error("Update product error:", error)
            const statusCode =
                error.message === "Product not found"
                    ? 404
                    : error.message === "Not authorized to update this product"
                    ? 403
                    : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Delete product
    async deleteProduct(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await productService.deleteProduct(
                req.params.id,
                req.user._id
            )
            return apiResponse.success(result, "Product deleted successfully")
        } catch (error) {
            console.error("Delete product error:", error)
            const statusCode =
                error.message === "Product not found"
                    ? 404
                    : error.message === "Not authorized to delete this product"
                    ? 403
                    : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Add product to watchlist
    async addToWatchlist(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await productService.addToWatchlist(
                req.params.id,
                req.user._id
            )
            return apiResponse.success(result, "Product added to watchlist")
        } catch (error) {
            console.error("Add to watchlist error:", error)
            const statusCode = error.message === "Product not found" ? 404 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Remove product from watchlist
    async removeFromWatchlist(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await productService.removeFromWatchlist(
                req.params.id,
                req.user._id
            )
            return apiResponse.success(result, "Product removed from watchlist")
        } catch (error) {
            console.error("Remove from watchlist error:", error)
            const statusCode = error.message === "Product not found" ? 404 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Get products by user ID
    async getUserProducts(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10 } = req.query
            const userId = req.params.userId

            const result = await productService.getUserProducts(
                userId,
                parseInt(page),
                parseInt(limit)
            )
            return apiResponse.success(
                result,
                "User products retrieved successfully"
            )
        } catch (error) {
            console.error("Get user products error:", error)
            return apiResponse.error(error.message, 500)
        }
    }
}

export default new ProductController()
