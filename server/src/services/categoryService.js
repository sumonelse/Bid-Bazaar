import Category from "../models/Category.js"
import Product from "../models/Product.js"

class CategoryService {
    // Create a new category
    async createCategory(categoryData) {
        const existingCategory = await Category.findOne({
            name: categoryData.name,
        })
        if (existingCategory) {
            throw new Error("Category already exists")
        }

        const category = await Category.create(categoryData)
        return category
    }

    // Get all categories
    async getAllCategories() {
        return await Category.find().sort({ name: 1 })
    }

    // Get category by ID
    async getCategoryById(categoryId) {
        const category = await Category.findById(categoryId)
        if (!category) {
            throw new Error("Category not found")
        }
        return category
    }

    // Update category
    async updateCategory(categoryId, updates) {
        const category = await Category.findById(categoryId)
        if (!category) {
            throw new Error("Category not found")
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            updates,
            {
                new: true,
            }
        )
        return updatedCategory
    }

    // Delete category
    async deleteCategory(categoryId) {
        const productsUsingCategory = await Product.countDocuments({
            category: categoryId,
        })
        if (productsUsingCategory > 0) {
            throw new Error(
                "Cannot delete category as it is being used by products"
            )
        }

        await Category.findByIdAndDelete(categoryId)
        return { message: "Category deleted successfully" }
    }

    // Get products by category
    async getProductsByCategory(
        categoryId,
        page = 1,
        limit = 10,
        filters = {}
    ) {
        const query = { category: categoryId }

        // Apply additional filters
        if (filters.status) query.status = filters.status
        if (filters.minPrice) query.currentBid = { $gte: filters.minPrice }
        if (filters.maxPrice) {
            query.currentBid = { ...query.currentBid, $lte: filters.maxPrice }
        }

        const skip = (page - 1) * limit
        const sort = this.getSortOrder(filters.sortBy)

        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
        const total = await Product.countDocuments(query)

        return {
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        }
    }

    // Helper method to determine sort order
    getSortOrder(sortBy) {
        switch (sortBy) {
            case "endingSoon":
                return { endTime: 1 }
            case "recentlyAdded":
                return { createdAt: -1 }
            case "priceAsc":
                return { currentBid: 1 }
            case "priceDesc":
                return { currentBid: -1 }
            default:
                return { createdAt: -1 }
        }
    }
}

export default new CategoryService()
