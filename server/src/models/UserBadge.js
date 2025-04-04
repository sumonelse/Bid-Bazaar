import mongoose from "mongoose"

const userBadgeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        badgeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Badge",
            required: [true, "Badge ID is required"],
        },
        unlockedAt: {
            type: Date,
            default: Date.now,
        },
        isEquipped: {
            type: Boolean,
            default: false,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

// Compound index to ensure a user can only have one entry per badge
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true })
userBadgeSchema.index({ userId: 1, isEquipped: 1 })
userBadgeSchema.index({ unlockedAt: -1 })

const UserBadge = mongoose.model("UserBadge", userBadgeSchema)
export default UserBadge
