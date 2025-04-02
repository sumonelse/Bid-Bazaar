import mongoose from "mongoose"
import bcrypt from "bcrypt"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return emailRegex.test(v)
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ["user", "seller", "admin"],
            default: "user",
        },
        avatar: {
            type: String,
            default: "",
        },
        watchlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        wins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        listings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true }
)

// Index for faster searches
userSchema.index({ username: 1 })

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    try {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    } catch (error) {
        next(error) // Pass the error to the next middleware
    }
})

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Create the User model
const User = mongoose.model("User ", userSchema)
export default User
