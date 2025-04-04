import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        type: {
            type: String,
            enum: [
                "newBid",
                "outbid",
                "endingSoon",
                "auctionWon",
                "auctionLost",
                "auctionEnded",
                "message",
                "system",
                "digest",
            ],
            required: [true, "Notification type is required"],
        },
        title: {
            type: String,
            maxlength: [100, "Notification title cannot exceed 100 characters"],
        },
        message: {
            type: String,
            required: [true, "Notification message is required"],
            maxlength: [
                500,
                "Notification message cannot exceed 500 characters",
            ],
        },
        readStatus: {
            type: Boolean,
            default: false,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        link: {
            type: String,
        },
        expiresAt: {
            type: Date,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Virtual for product details
notificationSchema.virtual("product", {
    ref: "Product",
    localField: "productId",
    foreignField: "_id",
    justOne: true,
})

// Set default title based on type if not provided
notificationSchema.pre("save", function (next) {
    if (!this.title) {
        switch (this.type) {
            case "newBid":
                this.title = "New Bid Placed"
                break
            case "outbid":
                this.title = "You've Been Outbid"
                break
            case "endingSoon":
                this.title = "Auction Ending Soon"
                break
            case "auctionWon":
                this.title = "Auction Won!"
                break
            case "auctionLost":
                this.title = "Auction Ended"
                break
            case "auctionEnded":
                this.title = "Your Auction Has Ended"
                break
            case "message":
                this.title = "New Message"
                break
            case "system":
                this.title = "System Notification"
                break
            case "digest":
                this.title = "Daily Update"
                break
            default:
                this.title = "Notification"
        }
    }

    // Set link if productId is provided and link is not
    if (this.productId && !this.link) {
        this.link = `/product/${this.productId}`
    }

    next()
})

// Index for faster queries
notificationSchema.index({ userId: 1, readStatus: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, type: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for auto-deletion

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
