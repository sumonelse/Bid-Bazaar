import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { config } from "../config/config.js"
import ApiResponse from "../utils/ApiResponse.js"

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
    const apiResponse = new ApiResponse(res) // Create an instance of ApiResponse
    const token = req.headers.authorization?.split(" ")[1]

    // Check if token is provided
    if (!token) {
        return apiResponse.error("No token provided, authorization denied", 401)
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, config.jwtSecret)

        // Check if the decoded token contains the user ID
        if (!decoded || !decoded._id) {
            return apiResponse.error("Invalid authentication token", 401)
        }

        // Find the user by ID and exclude the password
        const user = await User.findById(decoded._id).lean()

        // Check if user exists
        if (!user) {
            return apiResponse.error("Not authorized, invalid token.", 401)
        }

        // Attach user information to the request object
        req.user = user
        next() // Proceed to the next middleware or route handler
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === "TokenExpiredError") {
            return apiResponse.error("Token expired. Please log in again.", 401)
        }

        if (error.name === "JsonWebTokenError") {
            return apiResponse.error("Invalid token", 401)
        }

        // Log the error for server-side tracking
        console.error("Authentication Error:", error)

        // Return a generic server error response
        return apiResponse.error(
            "Internal server error during authentication",
            500
        )
    }
}

// Check if user is the seller
exports.isSeller = async (req, res, next) => {
    try {
        const product = await require("../models/product.model").findById(
            req.params.id
        )

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        if (product.sellerId.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Not authorized to perform this action" })
        }

        next()
    } catch (error) {
        console.error("isSeller middleware error:", error)
        res.status(500).json({ message: "Server error" })
    }
}
