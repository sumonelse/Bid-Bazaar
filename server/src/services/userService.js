import User from "../models/User.js"

class UserService {
    // Get user profile
    async getUserProfile(userId) {
        try {
            const user = await User.findById(userId)
                .populate("watchlist", "title images currentBid status endTime")
                .populate("wins", "title images currentBid status endTime")
                .populate("listings", "title images currentBid status endTime")

            if (!user) {
                throw new Error("User not found")
            }

            return user
        } catch (error) {
            throw error
        }
    }

    // Update user profile
    async updateProfile(userId, updates) {
        try {
            // Don't allow updating email directly for security
            const { email, password, ...allowedUpdates } = updates

            const user = await User.findById(userId)

            if (!user) {
                throw new Error("User not found")
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: allowedUpdates },
                { new: true }
            ).select("-password")

            return updatedUser
        } catch (error) {
            throw error
        }
    }

    // Update password
    async updatePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId)

            if (!user) {
                throw new Error("User not found")
            }

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword)
            if (!isMatch) {
                throw new Error("Current password is incorrect")
            }

            // Update password
            user.password = newPassword
            await user.save()

            return { message: "Password updated successfully" }
        } catch (error) {
            throw error
        }
    }

    // Get user's watchlist
    async getWatchlist(userId, page = 1, limit = 10) {
        try {
            const user = await User.findById(userId).select("watchlist")

            if (!user) {
                throw new Error("User not found")
            }

            const skip = (page - 1) * limit

            // Get products in watchlist with pagination
            const watchlistItems = await require("../models/product.model")
                .find({ _id: { $in: user.watchlist } })
                .sort({ endTime: 1 })
                .skip(skip)
                .limit(limit)

            const total = user.watchlist.length

            return {
                watchlist: watchlistItems,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            throw error
        }
    }

    // Get user's won auctions
    async getWonAuctions(userId, page = 1, limit = 10) {
        try {
            const user = await User.findById(userId).select("wins")

            if (!user) {
                throw new Error("User not found")
            }

            const skip = (page - 1) * limit

            // Get won products with pagination
            const wonItems = await require("../models/product.model")
                .find({ _id: { $in: user.wins } })
                .sort({ endTime: -1 })
                .skip(skip)
                .limit(limit)

            const total = user.wins.length

            return {
                wonAuctions: wonItems,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            throw error
        }
    }

    // Get user's listings
    async getUserListings(userId, page = 1, limit = 10, status) {
        try {
            const user = await User.findById(userId).select("listings")

            if (!user) {
                throw new Error("User not found")
            }

            const query = {
                _id: { $in: user.listings },
                sellerId: userId,
            }

            // Filter by status if provided
            if (status) {
                query.status = status
            }

            const skip = (page - 1) * limit

            // Get listings with pagination
            const listings = await require("../models/product.model")
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)

            const total =
                await require("../models/product.model").countDocuments(query)

            return {
                listings,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            throw error
        }
    }
}

export default new UserService()
