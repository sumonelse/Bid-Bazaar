import api from "./axios"

// Get all products with optional filters
export const getProducts = async (params = {}) => {
    try {
        const response = await api.get("/products", { params })
        // Return the data in the expected format
        return {
            products: response.data.data?.products || [],
            totalPages: response.data.data?.totalPages || 1,
            currentPage: response.data.data?.currentPage || 1,
            total: response.data.data?.total || 0,
            message: response.data.message,
        }
    } catch (error) {
        console.error("Error fetching products:", error)
        throw error.response?.data || { message: "Failed to fetch products" }
    }
}

// Get a single product by ID
export const getProductById = async (id) => {
    try {
        const response = await api.get(`/products/${id}`)
        // Return the entire response data to match what the component expects
        return {
            product: response.data.data,
            message: response.data.message,
        }
    } catch (error) {
        console.error("Error fetching product:", error)
        throw (
            error.response?.data || {
                message: "Failed to fetch product details",
            }
        )
    }
}

// Create a new product
export const createProduct = async (productData) => {
    try {
        // If productData contains image files, use FormData
        if (productData.images && productData.images.length > 0) {
            const formData = new FormData()

            // Append text fields
            Object.keys(productData).forEach((key) => {
                if (key !== "images") {
                    formData.append(
                        key,
                        typeof productData[key] === "object"
                            ? JSON.stringify(productData[key])
                            : productData[key]
                    )
                }
            })

            // Append image files
            productData.images.forEach((image) => {
                formData.append("images", image)
            })

            const response = await api.post("/products", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            return response.data.data
        } else {
            // Regular JSON request if no images
            const response = await api.post("/products", productData)
            return response.data.data
        }
    } catch (error) {
        throw error.response?.data || { message: "Failed to create product" }
    }
}

// Update a product
export const updateProduct = async (id, productData) => {
    try {
        // Handle FormData for image uploads
        if (
            productData.images &&
            productData.images.some((img) => img instanceof File)
        ) {
            const formData = new FormData()

            // Append text fields
            Object.keys(productData).forEach((key) => {
                if (key !== "images") {
                    formData.append(
                        key,
                        typeof productData[key] === "object" &&
                            key !== "category"
                            ? JSON.stringify(productData[key])
                            : productData[key]
                    )
                }
            })

            // Handle existing images - store them separately
            const existingImages = []

            // Append new image files
            if (productData.images && Array.isArray(productData.images)) {
                productData.images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append("images", image)
                    } else if (typeof image === "string") {
                        existingImages.push(image)
                    } else if (image && image.url) {
                        existingImages.push(image.url)
                    }
                })
            }

            // Add existing images as a JSON string
            if (existingImages.length > 0) {
                formData.append(
                    "existingImages",
                    JSON.stringify(existingImages)
                )
            }

            const response = await api.put(`/products/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            return response.data.data
        } else {
            // Regular JSON request if no new images
            const response = await api.put(`/products/${id}`, productData)
            return response.data.data
        }
    } catch (error) {
        throw error.response?.data || { message: "Failed to update product" }
    }
}

// Delete a product
export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`)
        return response.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete product" }
    }
}

// Get products by user ID
export const getUserProducts = async (userId) => {
    try {
        const response = await api.get(`/products/user/${userId}`)
        return response.data
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to fetch user products" }
        )
    }
}

// Search products
export const searchProducts = async (query) => {
    try {
        const response = await api.get("/products/search", {
            params: { q: query },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to search products" }
    }
}
