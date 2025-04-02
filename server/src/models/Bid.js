import mongoose from "mongoose"

const bidSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
})

// Index for faster queries
bidSchema.index({ productId: 1, timestamp: -1 })
bidSchema.index({ userId: 1 })

const Bid = mongoose.model("Bid", bidSchema)
export default Bid
