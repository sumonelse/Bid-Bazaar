import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        readStatus: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, timestamp: -1 })

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
