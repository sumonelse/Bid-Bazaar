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
                2000,
                "Product description cannot exceed 2000 characters",
            ],
        },
        images: {
            type: [String], // Store image URLs as strings
            validate: {
                validator: function (v) {
                    return v.length > 0
                },
                message: "At least one image is required",
            },
        },
        startingPrice: {
            type: Number,
            required: [true, "Starting price is required"],
            min: [0.01, "Starting price must be at least 0.01"],
        },
        currentBid: {
            type: Number,
            default: function () {
                return this.startingPrice
            },
        },
        bidIncrement: {
            type: Number,
            required: [true, "Bid increment is required"],
            min: [0.01, "Bid increment must be at least 0.01"],
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Seller ID is required"],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        condition: {
            type: String,
            enum: ["New", "Like New", "Excellent", "Good", "Fair", "Poor"],
            required: [true, "Condition is required"],
        },
        status: {
            type: String,
            enum: ["draft", "pending", "live", "ended", "cancelled"],
            default: "live",
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
            required: [true, "End time is required"],
            validate: {
                validator: function (v) {
                    return v > this.startTime
                },
                message: "End time must be after start time",
            },
        },
        location: {
            type: String,
            trim: true,
        },
        bidCount: {
            type: Number,
            default: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        watchCount: {
            type: Number,
            default: 0,
        },
        featuredItem: {
            type: Boolean,
            default: false,
        },
        endingSoonNotificationSent: {
            type: Boolean,
            default: false,
        },
        winningBidId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bid",
        },
        tags: {
            type: [String],
            default: [],
        },
        shippingInfo: {
            type: String,
            trim: true,
        },
        returnPolicy: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Virtual for time remaining
productSchema.virtual("timeRemaining").get(function () {
    if (this.status === "ended") return 0
    const now = new Date()
    const end = new Date(this.endTime)
    return Math.max(0, end - now)
})

// Virtual for bids (for populating)
productSchema.virtual("bids", {
    ref: "Bid",
    localField: "_id",
    foreignField: "productId",
})

// Index for faster searches
productSchema.index({ category: 1, status: 1 })
productSchema.index({ endTime: 1 })
productSchema.index({ sellerId: 1 })
productSchema.index({ title: "text", description: "text", tags: "text" })
productSchema.index({ startingPrice: 1 })
productSchema.index({ currentBid: 1 })
productSchema.index({ createdAt: -1 })

// Pre-save hook to ensure status is correct based on time
productSchema.pre("save", function (next) {
    const now = new Date()

    // If end time has passed, set status to ended
    if (this.endTime <= now && this.status === "live") {
        this.status = "ended"
    }

    next()
})

const Product = mongoose.model("Product", productSchema)
export default Product
