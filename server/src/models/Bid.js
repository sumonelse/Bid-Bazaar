import mongoose from "mongoose"

const bidSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
        },
        amount: {
            type: Number,
            required: [true, "Bid amount is required"],
            min: [0.01, "Bid amount must be at least 0.01"],
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        isWinningBid: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["active", "outbid", "won", "lost", "cancelled"],
            default: "active",
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Virtual to determine if this is the highest bid
bidSchema.virtual("isHighestBid").get(async function () {
    const highestBid = await this.constructor
        .findOne({
            productId: this.productId,
        })
        .sort({ amount: -1 })
        .limit(1)

    return highestBid && highestBid._id.equals(this._id)
})

// Virtual for product details
bidSchema.virtual("product", {
    ref: "Product",
    localField: "productId",
    foreignField: "_id",
    justOne: true,
})

// Index for faster queries
bidSchema.index({ productId: 1, amount: -1 })
bidSchema.index({ productId: 1, timestamp: -1 })
bidSchema.index({ userId: 1, timestamp: -1 })
bidSchema.index({ status: 1 })

const Bid = mongoose.model("Bid", bidSchema)
export default Bid
