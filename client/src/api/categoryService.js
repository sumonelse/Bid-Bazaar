import api from "./axios"

// Get all categories
export const getCategories = async () => {
    try {
        const response = await api.get("/categories")
        // Return the data in the expected format
        return {
            categories: response.data.data || [],
            message: response.data.message,
        }
    } catch (error) {
        console.error("Error fetching categories:", error)
        throw error.response?.data || { message: "Failed to fetch categories" }
    }
}

// Get a single category by ID
export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`/categories/${id}`)
        // Return the data in the expected format
        return {
            category: response.data.data,
            message: response.data.message,
        }
    } catch (error) {
        console.error("Error fetching category:", error)
        throw error.response?.data || { message: "Failed to fetch category" }
    }
}

// Get products by category ID
export const getProductsByCategory = async (categoryId, params = {}) => {
    try {
        const response = await api.get(`/categories/${categoryId}/products`, {
            params,
        })
        // Return the data in the expected format
        return {
            products: response.data.data?.products || [],
            totalPages: response.data.data?.totalPages || 1,
            currentPage: response.data.data?.currentPage || 1,
            total: response.data.data?.total || 0,
            message: response.data.message,
        }
    } catch (error) {
        console.error("Error fetching products by category:", error)
        throw (
            error.response?.data || {
                message: "Failed to fetch products by category",
            }
        )
    }
}
