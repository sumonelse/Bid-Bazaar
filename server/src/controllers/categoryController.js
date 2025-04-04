import categoryService from "../services/categoryService.js"
import ApiResponse from "../utils/ApiResponse.js"

class CategoryController {
    // Create a new category
    async createCategory(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const category = await categoryService.createCategory(req.body)
            return apiResponse.success(
                category,
                "Category created successfully",
                201
            )
        } catch (error) {
            console.error("Create category error:", error)
            const statusCode =
                error.message === "Category already exists" ? 400 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Get all categories
    async getAllCategories(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const categories = await categoryService.getAllCategories()
            return apiResponse.success(
                categories,
                "Categories retrieved successfully"
            )
        } catch (error) {
            console.error("Get categories error:", error)
            return apiResponse.error("Server error", 500)
        }
    }

    // Get category by ID
    async getCategoryById(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const category = await categoryService.getCategoryById(
                req.params.id
            )
            return apiResponse.success(category)
        } catch (error) {
            console.error("Get category error:", error)
            const statusCode =
                error.message === "Category not found" ? 404 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Update category
    async updateCategory(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const category = await categoryService.updateCategory(
                req.params.id,
                req.body
            )
            return apiResponse.success(
                category,
                "Category updated successfully"
            )
        } catch (error) {
            console.error("Update category error:", error)
            const statusCode =
                error.message === "Category not found" ? 404 : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Delete category
    async deleteCategory(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const result = await categoryService.deleteCategory(req.params.id)
            return apiResponse.success(result, "Category deleted successfully")
        } catch (error) {
            console.error("Delete category error:", error)
            const statusCode =
                error.message ===
                "Cannot delete category as it is being used by products"
                    ? 400
                    : error.message === "Category not found"
                    ? 404
                    : 500
            return apiResponse.error(error.message, statusCode)
        }
    }

    // Get products by category
    async getProductsByCategory(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10, ...filters } = req.query

            // Convert string numbers to actual numbers
            const numericPage = parseInt(page)
            const numericLimit = parseInt(limit)
            if (filters.minPrice)
                filters.minPrice = parseFloat(filters.minPrice)
            if (filters.maxPrice)
                filters.maxPrice = parseFloat(filters.maxPrice)

            const result = await categoryService.getProductsByCategory(
                req.params.id,
                numericPage,
                numericLimit,
                filters
            )
            return apiResponse.success(result)
        } catch (error) {
            console.error("Get products by category error:", error)
            return apiResponse.error("Server error", 500)
        }
    }
}

export default new CategoryController()
