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
            min: [1, "Bid amount must be at least 1"],
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
)

// Index for faster queries
bidSchema.index({ productId: 1, timestamp: -1 })
bidSchema.index({ userId: 1 })

const Bid = mongoose.model("Bid", bidSchema)
export default Bid
