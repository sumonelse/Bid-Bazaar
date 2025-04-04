import mongoose from "mongoose"

const userAchievementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        achievementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Achievement",
            required: [true, "Achievement ID is required"],
        },
        unlockedAt: {
            type: Date,
            default: Date.now,
        },
        progress: {
            type: Number,
            default: 0,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        isDisplayed: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

// Compound index to ensure a user can only have one entry per achievement
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true })
userAchievementSchema.index({ userId: 1, isCompleted: 1 })
userAchievementSchema.index({ unlockedAt: -1 })

const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema)
export default UserAchievement
