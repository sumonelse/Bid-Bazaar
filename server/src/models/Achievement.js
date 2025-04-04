import mongoose from "mongoose"

const achievementSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Achievement name is required"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Achievement description is required"],
            trim: true,
        },
        category: {
            type: String,
            enum: ["bidding", "selling", "account", "social", "special"],
            required: [true, "Achievement category is required"],
        },
        icon: {
            type: String,
            required: [true, "Achievement icon is required"],
        },
        points: {
            type: Number,
            required: [true, "Achievement points are required"],
            min: [1, "Achievement points must be at least 1"],
        },
        criteria: {
            type: {
                type: String,
                enum: ["count", "value", "streak", "special"],
                required: [true, "Criteria type is required"],
            },
            threshold: {
                type: Number,
                required: [true, "Criteria threshold is required"],
                min: [1, "Criteria threshold must be at least 1"],
            },
            action: {
                type: String,
                enum: [
                    "bid_placed",
                    "auction_won",
                    "auction_created",
                    "auction_sold",
                    "profile_completed",
                    "days_active",
                    "watchlist_items",
                    "outbid_recovery",
                    "consecutive_days",
                    "feedback_received",
                    "referrals",
                    "special_event",
                ],
                required: [true, "Criteria action is required"],
            },
        },
        tier: {
            type: Number,
            enum: [1, 2, 3], // Bronze, Silver, Gold
            default: 1,
        },
        isSecret: {
            type: Boolean,
            default: false,
        },
        isLimited: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
        },
    },
    { timestamps: true }
)

// Index for faster searches
achievementSchema.index({ category: 1 })
achievementSchema.index({ "criteria.action": 1 })
achievementSchema.index({ tier: 1 })

const Achievement = mongoose.model("Achievement", achievementSchema)
export default Achievement
