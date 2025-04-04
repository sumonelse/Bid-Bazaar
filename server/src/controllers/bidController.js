import bidService from "../services/bidService.js"
import ApiResponse from "../utils/ApiResponse.js"

class BidController {
    // Place a bid
    async placeBid(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const bid = await bidService.placeBid(req.body, req.user._id)
            return apiResponse.success(bid, "Bid placed successfully", 201)
        } catch (error) {
            console.error("Place bid error:", error)

            // Handle specific errors
            const clientErrors = [
                "Product not found",
                "Auction is not live",
                "Auction has ended",
                "Bid amount must be higher than current bid",
                "You cannot bid on your own product",
            ]

            if (clientErrors.includes(error.message)) {
                return apiResponse.error(error.message, 400)
            }

            // Handle server errors
            return apiResponse.error("Server error", 500, error.message)
        }
    }

    // Get bids for a product
    async getProductBids(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10 } = req.query

            const result = await bidService.getProductBids(
                req.params.productId,
                parseInt(page),
                parseInt(limit)
            )

            return apiResponse.success(result)
        } catch (error) {
            console.error("Get product bids error:", error)
            return apiResponse.error("Server error", 500, error.message)
        }
    }

    // Get user's bid history
    async getUserBids(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10 } = req.query

            const result = await bidService.getUserBids(
                req.user._id,
                parseInt(page),
                parseInt(limit)
            )

            return apiResponse.success(result)
        } catch (error) {
            console.error("Get user bids error:", error)
            return apiResponse.error("Server error", 500, error.message)
        }
    }

    // Get user's winning bids
    async getUserWinningBids(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { page = 1, limit = 10 } = req.query

            const result = await bidService.getUserWinningBids(
                req.user._id,
                parseInt(page),
                parseInt(limit)
            )

            return apiResponse.success(result)
        } catch (error) {
            console.error("Get user winning bids error:", error)
            return apiResponse.error("Server error", 500, error.message)
        }
    }
}

export default new BidController()
