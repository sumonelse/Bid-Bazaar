import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Product title is required"],
            trim: true,
            maxlength: [100, "Product title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            maxlength: [
                1000,
                "Product description cannot exceed 1000 characters",
            ],
        },
        images: {
            type: [Object],
        },
        basePrice: {
            type: Number,
            required: [true, "Base price is required"],
            min: [1, "Base price must be at least 1"],
        },
        currentBid: {
            type: Number,
            default: function () {
                return this.basePrice
            },
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Seller ID is required"],
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category ID is required"],
        },
        condition: {
            type: String,
            enum: ["new", "used", "refurbished"],
            required: [true, "Condition is required"],
        },
        status: {
            type: String,
            enum: ["upcoming", "live", "ended"],
            default: "upcoming",
        },
        endTime: {
            type: Date,
            required: [true, "End time is required"],
        },
        bidType: {
            type: String,
            enum: ["active", "passive"],
            required: [true, "Bid type is required"],
        },
        featuredItem: {
            type: Boolean,
            default: false,
        },
        watchCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

// Index for faster searches
productSchema.index({ categoryId: 1, status: 1 })
productSchema.index({ endTime: 1 })
productSchema.index({ sellerId: 1 })

const Product = mongoose.model("Product", productSchema)
export default Product
