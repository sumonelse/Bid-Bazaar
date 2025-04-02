import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        message: {
            type: String,
            required: [true, "Notification message is required"],
            maxlength: [
                200,
                "Notification message cannot exceed 200 characters",
            ],
        },
        readStatus: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

// Index for faster queries
notificationSchema.index({ userId: 1, readStatus: 1, createdAt: -1 })

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
