import mongoose from "mongoose"

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        icon: {
            type: String,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
)

// Index for faster queries
categorySchema.index({ name: 1 })

const Category = mongoose.model("Category", categorySchema)
export default Category
