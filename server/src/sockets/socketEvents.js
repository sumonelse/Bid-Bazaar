import Product from "../models/Product.js"
import User from "../models/User.js"
import Bid from "../models/Bid.js"
import notificationService from "../services/notificationService.js"

// Set up socket events
const setupSocketEvents = (io) => {
    // Mapping of user IDs to socket IDs
    const userSockets = {}

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id)

        // Authenticate socket connection
        socket.on("authenticate", (data) => {
            if (data && data.userId) {
                // Store user ID with socket ID
                userSockets[data.userId] = socket.id
                console.log(
                    `User ${data.userId} authenticated with socket ${socket.id}`
                )

                // Join user-specific room
                socket.join(`user:${data.userId}`)
            }
        })

        // Join auction room
        socket.on("join-auction", (productId) => {
            console.log(`Socket ${socket.id} joined auction ${productId}`)
            socket.join(`auction-${productId}`)
        })

        // Leave auction room
        socket.on("leave-auction", (productId) => {
            console.log(`Socket ${socket.id} left auction ${productId}`)
            socket.leave(`auction-${productId}`)
        })

        // Place bid
        socket.on("place-bid", async (bidData) => {
            try {
                const { productId, userId, amount, type, userName } = bidData

                // Check if product exists and auction is live
                const product = await Product.findById(productId)

                if (!product) {
                    socket.emit("bid-error", { message: "Product not found" })
                    return
                }

                if (product.status !== "live") {
                    socket.emit("bid-error", { message: "Auction is not live" })
                    return
                }

                if (new Date() > product.endTime) {
                    // Update product status to ended
                    await Product.findByIdAndUpdate(productId, {
                        status: "ended",
                    })
                    socket.emit("bid-error", { message: "Auction has ended" })
                    io.to(`auction-${productId}`).emit("auction-ended", {
                        productId,
                    })
                    return
                }

                if (amount <= product.currentBid) {
                    socket.emit("bid-error", {
                        message: "Bid amount must be higher than current bid",
                    })
                    return
                }

                // Check if seller is trying to bid on their own product
                if (product.sellerId.toString() === userId) {
                    socket.emit("bid-error", {
                        message: "You cannot bid on your own product",
                    })
                    return
                }

                // Create new bid
                const newBid = new Bid({
                    userId,
                    userName,
                    productId,
                    amount,
                    type,
                })

                await newBid.save()

                // Update product current bid
                await Product.findByIdAndUpdate(productId, {
                    currentBid: amount,
                })

                // Add bid to user's bid history
                await User.findByIdAndUpdate(userId, {
                    $push: { bidHistory: newBid._id },
                })

                // Emit to all clients in the auction room
                io.to(`auction-${productId}`).emit("new-bid", {
                    ...newBid.toJSON(),
                    productTitle: product.title,
                })

                // Notify previous highest bidder
                const previousHighestBid = await Bid.findOne({
                    productId,
                    userId: { $ne: userId },
                }).sort({ amount: -1 })

                if (previousHighestBid) {
                    const outbidUserId = previousHighestBid.userId.toString()

                    // Create notification
                    const notification =
                        await notificationService.createNotification({
                            userId: outbidUserId,
                            type: "outbid",
                            message: `You've been outbid on ${product.title}. The new highest bid is $${amount}.`,
                            productId,
                        })

                    // Send notification to outbid user if they're connected
                    io.to(`user:${outbidUserId}`).emit(
                        "new-notification",
                        notification
                    )
                }

                // Notify seller
                const sellerNotification =
                    await notificationService.createNotification({
                        userId: product.sellerId,
                        type: "newBid",
                        message: `A new bid of $${amount} has been placed on your listing: ${product.title}.`,
                        productId,
                    })

                io.to(`user:${product.sellerId}`).emit(
                    "new-notification",
                    sellerNotification
                )

                // Emit success to the bidder
                socket.emit("bid-success", newBid)
            } catch (error) {
                console.error("Socket bid error:", error)
                socket.emit("bid-error", {
                    message: "An error occurred while placing your bid",
                })
            }
        })

        // Check auction status
        socket.on("check-auction-status", async (productId) => {
            try {
                const product = await Product.findById(productId)

                if (!product) {
                    socket.emit("auction-error", {
                        message: "Product not found",
                    })
                    return
                }

                const now = new Date()

                // If auction has ended but status not updated
                if (now > product.endTime && product.status !== "ended") {
                    await Product.findByIdAndUpdate(productId, {
                        status: "ended",
                    })

                    // Emit to all clients in the auction room
                    io.to(`auction-${productId}`).emit("auction-ended", {
                        productId,
                    })

                    // Get highest bidder
                    const highestBid = await Bid.findOne({ productId }).sort({
                        amount: -1,
                    })

                    if (highestBid) {
                        // Add to user's wins
                        await User.findByIdAndUpdate(highestBid.userId, {
                            $push: { wins: productId },
                        })

                        // Notify winner
                        const winnerNotification =
                            await notificationService.createNotification({
                                userId: highestBid.userId,
                                type: "win",
                                message: `Congratulations! You won the auction for ${product.title}`,
                                productId,
                            })

                        io.to(`user:${highestBid.userId}`).emit(
                            "new-notification",
                            winnerNotification
                        )
                        io.to(`user:${highestBid.userId}`).emit("auction-won", {
                            productId,
                            product,
                        })

                        // Notify seller
                        const sellerNotification =
                            await notificationService.createNotification({
                                userId: product.sellerId,
                                type: "win",
                                message: `Your auction for ${product.title} has ended with a winning bid of $${highestBid.amount}`,
                                productId,
                            })

                        io.to(`user:${product.sellerId}`).emit(
                            "new-notification",
                            sellerNotification
                        )
                    }
                }
            } catch (error) {
                console.error("Socket check auction status error:", error)
            }
        })

        // Handle ending soon notifications
        socket.on("check-ending-soon", async () => {
            try {
                const oneHourFromNow = new Date(
                    new Date().getTime() + 60 * 60 * 1000
                )
                const thirtyMinutesFromNow = new Date(
                    new Date().getTime() + 30 * 60 * 1000
                )

                // Find auctions ending within the next hour
                const endingSoonProducts = await Product.find({
                    status: "live",
                    endTime: {
                        $gte: thirtyMinutesFromNow,
                        $lte: oneHourFromNow,
                    },
                })

                for (const product of endingSoonProducts) {
                    // Get all users watching this product
                    const watchingUsers = await User.find({
                        watchlist: product._id,
                    })

                    for (const user of watchingUsers) {
                        // Create notification
                        const notification =
                            await notificationService.createNotification({
                                userId: user._id,
                                type: "endingSoon",
                                message: `Auction for ${product.title} is ending soon! Don't miss your chance to bid.`,
                                productId: product._id,
                            })

                        // Send notification if user is connected
                        io.to(`user:${user._id}`).emit(
                            "new-notification",
                            notification
                        )
                    }

                    // Notify all users in the auction room
                    io.to(`auction-${product._id}`).emit(
                        "auction-ending-soon",
                        {
                            productId: product._id,
                            timeLeft: Math.floor(
                                (product.endTime - new Date()) / 1000
                            ),
                        }
                    )
                }
            } catch (error) {
                console.error("Socket check ending soon error:", error)
            }
        })

        // Disconnect event
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id)

            // Remove user from userSockets mapping
            for (const userId in userSockets) {
                if (userSockets[userId] === socket.id) {
                    delete userSockets[userId]
                    console.log(`User ${userId} disconnected`)
                    break
                }
            }
        })
    })

    // Set up scheduled tasks
    // Check for auctions ending soon every minute
    setInterval(() => {
        console.log("Checking for auctions ending soon...")
        io.emit("check-ending-soon")
    }, 60 * 1000)

    // Check and update auction statuses every minute
    setInterval(async () => {
        try {
            console.log("Updating auction statuses...")

            const now = new Date()

            // Find live auctions that have ended
            const endedAuctions = await Product.find({
                status: "live",
                endTime: { $lte: now },
            })

            for (const auction of endedAuctions) {
                await Product.findByIdAndUpdate(auction._id, {
                    status: "ended",
                })

                // Notify all users in the auction room
                io.to(`auction-${auction._id}`).emit("auction-ended", {
                    productId: auction._id,
                })

                // Get highest bidder
                const highestBid = await Bid.findOne({
                    productId: auction._id,
                }).sort({ amount: -1 })

                if (highestBid) {
                    // Add to user's wins
                    await User.findByIdAndUpdate(highestBid.userId, {
                        $push: { wins: auction._id },
                    })

                    // Notify winner
                    const winnerNotification =
                        await notificationService.createNotification({
                            userId: highestBid.userId,
                            type: "win",
                            message: `Congratulations! You won the auction for ${auction.title}`,
                            productId: auction._id,
                        })

                    io.to(`user:${highestBid.userId}`).emit(
                        "new-notification",
                        winnerNotification
                    )
                    io.to(`user:${highestBid.userId}`).emit("auction-won", {
                        productId: auction._id,
                        product: auction,
                    })

                    // Notify seller
                    const sellerNotification =
                        await notificationService.createNotification({
                            userId: auction.sellerId,
                            type: "win",
                            message: `Your auction for ${auction.title} has ended with a winning bid of $${highestBid.amount}`,
                            productId: auction._id,
                        })

                    io.to(`user:${auction.sellerId}`).emit(
                        "new-notification",
                        sellerNotification
                    )
                }
            }

            // Update upcoming auctions to live if their start time has passed
            await Product.updateMany(
                { status: "upcoming", startTime: { $lte: now } },
                { $set: { status: "live" } }
            )
        } catch (error) {
            console.error("Scheduled task error:", error)
        }
    }, 60 * 1000)
}

export default setupSocketEvents
