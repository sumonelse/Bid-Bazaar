import cron from "node-cron"
import Product from "../models/Product.js"
import User from "../models/User.js"
import Bid from "../models/Bid.js"
import notificationService from "./notificationService.js"
import { getIO } from "../sockets/bidSocket.js"

class SchedulerService {
    constructor() {
        this.tasks = []
    }

    // Initialize all scheduled tasks
    initialize() {
        // Check for ending auctions every minute
        this.tasks.push(
            cron.schedule("* * * * *", async () => {
                await this.processEndingAuctions()
            })
        )

        // Check for ended auctions every 5 minutes
        this.tasks.push(
            cron.schedule("*/5 * * * *", async () => {
                await this.processEndedAuctions()
            })
        )

        // Send daily digest at midnight
        this.tasks.push(
            cron.schedule("0 0 * * *", async () => {
                await this.sendDailyDigest()
            })
        )

        console.log("Scheduler service initialized")
    }

    // Process auctions that are ending soon (within 1 hour)
    async processEndingAuctions() {
        try {
            const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
            const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)

            // Find auctions ending within the next hour but more than 5 minutes from now
            const endingAuctions = await Product.find({
                status: "live",
                endTime: { $gt: fiveMinutesFromNow, $lt: oneHourFromNow },
                endingSoonNotificationSent: { $ne: true }, // Only those that haven't had notifications sent
            })

            for (const auction of endingAuctions) {
                // Get users who have bid on this auction
                const bidders = await Bid.distinct("userId", {
                    productId: auction._id,
                })

                // Get users who have this item in their watchlist
                const watchers = await User.find(
                    { watchlist: auction._id },
                    { _id: 1 }
                )

                // Combine unique user IDs
                const userIds = [
                    ...new Set([
                        ...bidders.map((id) => id.toString()),
                        ...watchers.map((user) => user._id.toString()),
                    ]),
                ]

                // Send notifications
                for (const userId of userIds) {
                    await notificationService.createNotification({
                        userId,
                        type: "endingSoon",
                        message: `Auction for "${
                            auction.title
                        }" is ending soon! Only ${this._formatTimeRemaining(
                            auction.endTime
                        )} left.`,
                        productId: auction._id,
                    })
                }

                // Mark as notified
                await Product.findByIdAndUpdate(auction._id, {
                    endingSoonNotificationSent: true,
                })

                // Emit auction update to all clients viewing this product
                try {
                    const io = getIO()
                    io.to(`product:${auction._id}`).emit(
                        "auction-ending-soon",
                        {
                            productId: auction._id,
                            endTime: auction.endTime,
                        }
                    )
                } catch (error) {
                    console.error("Socket emission error:", error)
                }
            }
        } catch (error) {
            console.error("Error processing ending auctions:", error)
        }
    }

    // Process auctions that have ended
    async processEndedAuctions() {
        try {
            const now = new Date()

            // Find auctions that have ended but still marked as live
            const endedAuctions = await Product.find({
                status: "live",
                endTime: { $lt: now },
            })

            for (const auction of endedAuctions) {
                // Update auction status
                await Product.findByIdAndUpdate(auction._id, {
                    status: "ended",
                })

                // Find the winning bid (highest bid)
                const winningBid = await Bid.findOne({ productId: auction._id })
                    .sort({ amount: -1 })
                    .populate("userId", "name email")

                if (winningBid) {
                    // Notify the winner
                    await notificationService.createNotification({
                        userId: winningBid.userId._id,
                        type: "auctionWon",
                        message: `Congratulations! You won the auction for "${
                            auction.title
                        }" with a bid of $${winningBid.amount.toFixed(2)}.`,
                        productId: auction._id,
                    })

                    // Notify the seller
                    await notificationService.createNotification({
                        userId: auction.sellerId,
                        type: "auctionEnded",
                        message: `Your auction for "${
                            auction.title
                        }" has ended. The winning bid was $${winningBid.amount.toFixed(
                            2
                        )}.`,
                        productId: auction._id,
                    })

                    // Notify other bidders
                    const otherBidders = await Bid.distinct("userId", {
                        productId: auction._id,
                        userId: { $ne: winningBid.userId._id },
                    })

                    for (const bidderId of otherBidders) {
                        await notificationService.createNotification({
                            userId: bidderId,
                            type: "auctionLost",
                            message: `The auction for "${auction.title}" has ended. Unfortunately, your bid was not the highest.`,
                            productId: auction._id,
                        })
                    }
                } else {
                    // No bids were placed
                    await notificationService.createNotification({
                        userId: auction.sellerId,
                        type: "auctionEnded",
                        message: `Your auction for "${auction.title}" has ended with no bids.`,
                        productId: auction._id,
                    })
                }

                // Emit auction ended event
                try {
                    const io = getIO()
                    io.to(`product:${auction._id}`).emit("auction-ended", {
                        productId: auction._id,
                        winningBid: winningBid
                            ? {
                                  amount: winningBid.amount,
                                  bidder: {
                                      id: winningBid.userId._id,
                                      name: winningBid.userId.name,
                                  },
                              }
                            : null,
                    })
                } catch (error) {
                    console.error("Socket emission error:", error)
                }
            }
        } catch (error) {
            console.error("Error processing ended auctions:", error)
        }
    }

    // Send daily digest of activity
    async sendDailyDigest() {
        try {
            // Get all active users (those who have logged in within the last 30 days)
            const thirtyDaysAgo = new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
            )
            const activeUsers = await User.find({
                lastLogin: { $gt: thirtyDaysAgo },
            })

            for (const user of activeUsers) {
                // Get user's active bids
                const activeBids = await Bid.countDocuments({
                    userId: user._id,
                    "product.endTime": { $gt: new Date() },
                })

                // Get user's watchlist items ending soon
                const watchlistEndingSoon = await Product.countDocuments({
                    _id: { $in: user.watchlist },
                    status: "live",
                    endTime: {
                        $lt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                })

                // Get user's active listings
                const activeListings = await Product.countDocuments({
                    sellerId: user._id,
                    status: "live",
                })

                // Only send digest if there's something to report
                if (
                    activeBids > 0 ||
                    watchlistEndingSoon > 0 ||
                    activeListings > 0
                ) {
                    let message = "Your BidBazaar daily update: "

                    if (activeBids > 0) {
                        message += `You have ${activeBids} active bid${
                            activeBids !== 1 ? "s" : ""
                        }. `
                    }

                    if (watchlistEndingSoon > 0) {
                        message += `${watchlistEndingSoon} item${
                            watchlistEndingSoon !== 1 ? "s" : ""
                        } in your watchlist ${
                            watchlistEndingSoon !== 1 ? "are" : "is"
                        } ending within 24 hours. `
                    }

                    if (activeListings > 0) {
                        message += `You have ${activeListings} active listing${
                            activeListings !== 1 ? "s" : ""
                        }.`
                    }

                    await notificationService.createNotification({
                        userId: user._id,
                        type: "digest",
                        message,
                    })
                }
            }
        } catch (error) {
            console.error("Error sending daily digest:", error)
        }
    }

    // Format time remaining in a human-readable format
    _formatTimeRemaining(endTime) {
        const now = new Date()
        const end = new Date(endTime)
        const diffMs = end - now

        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? "s" : ""}`
        }

        const diffHours = Math.floor(diffMins / 60)
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`
    }

    // Stop all scheduled tasks
    stopAll() {
        this.tasks.forEach((task) => task.stop())
        console.log("All scheduled tasks stopped")
    }
}

export default new SchedulerService()
