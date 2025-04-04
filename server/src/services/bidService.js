import Bid from "../models/Bid.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import notificationService from "../services/notificationService.js"
import { getIO } from "../sockets/bidSocket.js"
import gamificationService from "./gamificationService.js"

class BidService {
    // Place a bid
    async placeBid(bidData, userId) {
        try {
            const { productId, amount } = bidData

            // Get product
            const product = await Product.findById(productId)
            if (!product) {
                throw new Error("Product not found")
            }

            // Check if auction is live
            if (product.status !== "live") {
                throw new Error("Auction is not live")
            }

            // Check if auction has ended
            if (new Date() > product.endTime) {
                // Update product status to ended
                await Product.findByIdAndUpdate(productId, { status: "ended" })
                throw new Error("Auction has ended")
            }

            // Check if bid amount is higher than current bid
            if (amount <= product.currentBid) {
                throw new Error("Bid amount must be higher than current bid")
            }

            // Check if seller is trying to bid on their own product
            if (product.sellerId.toString() === userId.toString()) {
                throw new Error("You cannot bid on your own product")
            }

            // Create new bid
            const bid = await Bid.create({
                userId,
                productId,
                amount,
            })

            // Update product current bid and increment bid count
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    currentBid: amount,
                    $inc: { bidCount: 1 },
                },
                { new: true }
            ).populate("sellerId", "name")

            // Get bidder information
            const bidder = await User.findById(userId, "name avatar")

            // Prepare bid data for real-time updates
            const bidSocketData = {
                _id: bid._id,
                amount: bid.amount,
                productId: bid.productId,
                timestamp: bid.timestamp,
                user: {
                    _id: bidder._id,
                    name: bidder.name,
                    avatar: bidder.avatar,
                },
                product: {
                    _id: updatedProduct._id,
                    title: updatedProduct.title,
                    currentBid: updatedProduct.currentBid,
                    bidCount: updatedProduct.bidCount,
                    endTime: updatedProduct.endTime,
                },
            }

            // Emit real-time update to all clients viewing this product
            try {
                const io = getIO()
                io.to(`product:${productId}`).emit("new-bid", bidSocketData)
            } catch (socketError) {
                console.error("Socket emission error:", socketError)
                // Continue with the process even if socket emission fails
            }

            // Add bid to user's bid history
            await User.findByIdAndUpdate(userId, {
                $push: { bidHistory: bid._id },
            })

            // Track bid for gamification
            await gamificationService.trackUserAction(userId, "bid_placed")

            // Award experience points for placing a bid
            await gamificationService.awardExperience(
                userId,
                5,
                "placing a bid"
            )

            // If this is the highest bid ever placed by this user, update that stat
            await User.findOneAndUpdate(
                { _id: userId, "stats.highestBid": { $lt: amount } },
                { "stats.highestBid": amount }
            )

            // Handle outbid notifications
            await this._handleOutbidNotifications(
                productId,
                userId,
                amount,
                product.title
            )

            return bid
        } catch (error) {
            throw error
        }
    }

    // Get bids for a product
    async getProductBids(productId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit

            const bids = await Bid.find({ productId })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate("userId", "name avatar")

            const total = await Bid.countDocuments({ productId })

            return {
                bids,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            throw error
        }
    }

    // Get user's bid history
    async getUserBids(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit

            const bids = await Bid.find({ userId })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate("productId", "title images currentBid status endTime")

            const total = await Bid.countDocuments({ userId })

            return {
                bids,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            throw error
        }
    }

    // Get user's winning bids
    async getUserWinningBids(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit

            // Find products where the auction has ended and this user has the highest bid
            const endedProducts = await Product.find({
                status: "ended",
            }).select("_id")

            const endedProductIds = endedProducts.map((p) => p._id)

            // For each ended product, find the highest bid by this user
            const winningBids = []

            // If there are no ended products, return empty result
            if (endedProductIds.length === 0) {
                return {
                    bids: [],
                    totalPages: 0,
                    currentPage: page,
                    total: 0,
                }
            }

            // For each ended product, find if this user has the highest bid
            for (const productId of endedProductIds) {
                // Find the highest bid for this product
                const highestBid = await Bid.findOne({ productId })
                    .sort({ amount: -1 })
                    .populate("userId", "name avatar")

                // If the highest bid is from this user, add it to winning bids
                if (
                    highestBid &&
                    highestBid.userId._id.toString() === userId.toString()
                ) {
                    const populatedBid = await Bid.findById(
                        highestBid._id
                    ).populate(
                        "productId",
                        "title images currentBid status endTime"
                    )

                    winningBids.push(populatedBid)
                }
            }

            // Apply pagination to the winning bids
            const paginatedBids = winningBids.slice(skip, skip + limit)

            return {
                bids: paginatedBids,
                totalPages: Math.ceil(winningBids.length / limit),
                currentPage: page,
                total: winningBids.length,
            }
        } catch (error) {
            throw error
        }
    }

    // Handle outbid notifications
    async _handleOutbidNotifications(
        productId,
        newBidUserId,
        newBidAmount,
        productTitle
    ) {
        try {
            // Find previous highest bidder (excluding the new bidder)
            const previousHighestBid = await Bid.findOne({
                productId,
                userId: { $ne: newBidUserId },
            }).sort({ amount: -1 })

            if (previousHighestBid) {
                // Notify previous highest bidder that they've been outbid
                await notificationService.createNotification({
                    userId: previousHighestBid.userId,
                    type: "outbid",
                    message: `You've been outbid on ${productTitle}. The new highest bid is $${newBidAmount}.`,
                    productId,
                })
            }

            // Get all users who have bid on this product (for newBid notifications)
            const uniqueBidders = await Bid.distinct("userId", {
                productId,
                userId: { $ne: newBidUserId }, // Exclude the new bidder
            })

            // Notify all unique bidders (except the new bidder and previous highest)
            for (const bidderId of uniqueBidders) {
                if (
                    previousHighestBid &&
                    bidderId.toString() === previousHighestBid.userId.toString()
                ) {
                    continue // Skip previous highest bidder as they already got an outbid notification
                }

                await notificationService.createNotification({
                    userId: bidderId,
                    type: "newBid",
                    message: `A new bid of $${newBidAmount} has been placed on ${productTitle}.`,
                    productId,
                })
            }

            // Notify seller about the new bid
            const product = await Product.findById(productId)
            if (product) {
                await notificationService.createNotification({
                    userId: product.sellerId,
                    type: "newBid",
                    message: `A new bid of $${newBidAmount} has been placed on your listing: ${productTitle}.`,
                    productId,
                })
            }
        } catch (error) {
            console.error("Error handling outbid notifications:", error)
            // Don't throw the error as this is a secondary operation
        }
    }
}

export default new BidService()
