import mongoose from "mongoose"

const sellerDetailsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User ",
            required: true,
        },
        storeName: {
            type: String,
            required: true,
            trim: true,
        },
        storeDescription: {
            type: String,
            trim: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
)

const SellerDetails = mongoose.model("SellerDetails", sellerDetailsSchema)
export default SellerDetails
