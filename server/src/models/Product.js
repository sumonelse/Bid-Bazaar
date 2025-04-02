import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [{ type: String }],
    basePrice: {
        type: Number,
        required: true,
    },
    currentBid: {
        type: Number,
        default: function () {
            return this.basePrice
        },
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User ",
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    condition: {
        type: String,
        enum: ["new", "used", "refurbished"], // Added condition options
    },
    status: {
        type: String,
        enum: ["upcoming", "live", "ended"],
        default: "upcoming",
    },
    endTime: {
        type: Date,
        required: true,
    },
    bidType: {
        type: String,
        enum: ["active", "passive"],
        required: true,
    },
    featuredItem: {
        type: Boolean,
        default: false,
    },
    watchCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Index for faster searches
productSchema.index({ categoryId: 1, status: 1 })
productSchema.index({ endTime: 1 })
productSchema.index({ sellerId: 1 })

const Product = mongoose.model("Product", productSchema)
export default Product
