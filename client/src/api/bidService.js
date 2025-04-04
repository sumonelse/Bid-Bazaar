import api from "./axios"

// Place a bid on a product
export const placeBid = async (productId, amount) => {
    try {
        const response = await api.post(`/bids`, { productId, amount })
        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to place bid" }
    }
}

// Get all bids for a product
export const getProductBids = async (productId) => {
    try {
        const response = await api.get(`/bids/product/${productId}`)
        return response.data.data
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to fetch product bids" }
        )
    }
}

// Get all bids placed by a user
export const getUserBids = async () => {
    try {
        const response = await api.get("/bids/user")
        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch user bids" }
    }
}

// Get winning bids for a user
export const getUserWinningBids = async () => {
    try {
        const response = await api.get("/bids/user/winning")
        return response.data.data
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to fetch winning bids" }
        )
    }
}

// Get highest bid for a product
export const getHighestBid = async (productId) => {
    try {
        const response = await api.get(`/bids/product/${productId}/highest`)
        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch highest bid" }
    }
}
