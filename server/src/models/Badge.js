import mongoose from "mongoose"

const badgeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Badge name is required"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Badge description is required"],
            trim: true,
        },
        icon: {
            type: String,
            required: [true, "Badge icon is required"],
        },
        category: {
            type: String,
            enum: ["bidding", "selling", "account", "social", "special"],
            required: [true, "Badge category is required"],
        },
        rarity: {
            type: String,
            enum: ["common", "uncommon", "rare", "epic", "legendary"],
            default: "common",
        },
        requirements: {
            achievements: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Achievement",
                },
            ],
            level: {
                type: Number,
                min: 0,
                default: 0,
            },
        },
        benefits: {
            type: [String],
            default: [],
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
badgeSchema.index({ category: 1 })
badgeSchema.index({ rarity: 1 })

const Badge = mongoose.model("Badge", badgeSchema)
export default Badge
