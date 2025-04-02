import mongoose from "mongoose"

const sellerDetailsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        storeName: {
            type: String,
            required: [true, "Store name is required"],
            trim: true,
            maxlength: [50, "Store name cannot exceed 50 characters"],
        },
        storeDescription: {
            type: String,
            trim: true,
            maxlength: [500, "Store description cannot exceed 500 characters"],
        },
        contactNumber: {
            type: String,
            required: [true, "Contact number is required"],
            match: [
                /^\d{10,15}$/,
                "Contact number must be between 10 and 15 digits",
            ],
        },
    },
    { timestamps: true }
)

// Index for faster queries
sellerDetailsSchema.index({ user: 1 })

const SellerDetails = mongoose.model("SellerDetails", sellerDetailsSchema)
export default SellerDetails
