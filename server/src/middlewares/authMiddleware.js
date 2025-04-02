import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Product from "../models/Product.js"
import { config } from "../config/config.js"
import ApiResponse from "../utils/ApiResponse.js"

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
    const apiResponse = new ApiResponse(res)
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return apiResponse.error("No token provided, authorization denied", 401)
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret)

        if (!decoded || !decoded._id) {
            return apiResponse.error("Invalid authentication token", 401)
        }

        const user = await User.findById(decoded._id).lean()

        if (!user) {
            return apiResponse.error("Not authorized, invalid token.", 401)
        }

        req.user = user
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return apiResponse.error("Token expired. Please log in again.", 401)
        }

        if (error.name === "JsonWebTokenError") {
            return apiResponse.error("Invalid token", 401)
        }

        console.error("Authentication Error:", error)
        return apiResponse.error(
            "Internal server error during authentication",
            500
        )
    }
}

// Admin authorization middleware
export const isAdmin = (req, res, next) => {
    const apiResponse = new ApiResponse(res)
    try {
        if (req.user && req.user.role === "admin") {
            next()
        } else {
            return apiResponse.error(
                "Access denied: Admin privileges required",
                500
            )
        }
    } catch (error) {
        console.error("isAdmin middleware error:", error)
        return apiResponse.error("Server error", 500)
    }
}

// Check if user is the seller
export const isSeller = async (req, res, next) => {
    const apiResponse = new ApiResponse(res)
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return apiResponse.error("Product not found", 404)
        }

        if (product.sellerId.toString() !== req.user.id) {
            return apiResponse.error(
                "Not authorized to perform this action",
                403
            )
        }

        next()
    } catch (error) {
        console.error("isSeller middleware error:", error)
        return apiResponse.error("Server error", 500)
    }
}
