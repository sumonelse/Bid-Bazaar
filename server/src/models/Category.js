import mongoose from "mongoose"

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
            maxlength: [50, "Category name cannot exceed 50 characters"],
        },
        icon: {
            type: String,
            trim: true,
            default: "", // Default icon URL
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, "Description cannot exceed 200 characters"],
        },
    },
    { timestamps: true }
)

// Index for faster queries
categorySchema.index({ name: 1 })

// Static method to search categories by name
categorySchema.statics.searchByName = async function (name) {
    return this.find({ name: new RegExp(name, "i") }) // Case-insensitive search
}

const Category = mongoose.model("Category", categorySchema)
export default Category
