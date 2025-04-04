import mongoose from "mongoose"
import bcrypt from "bcrypt"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters long"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters long"],
            maxlength: [20, "Username cannot exceed 20 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
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
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false, // Exclude password from query results by default
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
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
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
        // Gamification fields
        level: {
            type: Number,
            default: 1,
            min: 1,
        },
        experience: {
            type: Number,
            default: 0,
            min: 0,
        },
        reputation: {
            type: Number,
            default: 0,
        },
        coins: {
            type: Number,
            default: 100,
            min: 0,
        },
        streak: {
            count: {
                type: Number,
                default: 0,
            },
            lastActive: {
                type: Date,
                default: Date.now,
            },
        },
        stats: {
            bidsPlaced: {
                type: Number,
                default: 0,
            },
            auctionsWon: {
                type: Number,
                default: 0,
            },
            auctionsCreated: {
                type: Number,
                default: 0,
            },
            auctionsSold: {
                type: Number,
                default: 0,
            },
            totalSpent: {
                type: Number,
                default: 0,
            },
            totalEarned: {
                type: Number,
                default: 0,
            },
            highestBid: {
                type: Number,
                default: 0,
            },
            outbidRecoveries: {
                type: Number,
                default: 0,
            },
            perfectFeedbacks: {
                type: Number,
                default: 0,
            },
            referrals: {
                type: Number,
                default: 0,
            },
        },
        preferences: {
            displayTitle: {
                type: String,
                default: "Novice Bidder",
            },
            selectedBadges: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Badge",
                    max: 3,
                },
            ],
            notifyOnAchievements: {
                type: Boolean,
                default: true,
            },
            showLevelProgress: {
                type: Boolean,
                default: true,
            },
            showInLeaderboards: {
                type: Boolean,
                default: true,
            },
        },
    },
    { timestamps: true }
)

// Index for faster searches
userSchema.index({ username: 1 })
userSchema.index({ email: 1 })

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

// Static method to find users by role
userSchema.statics.findByRole = async function (role) {
    return this.find({ role })
}

// Create the User model
const User = mongoose.model("User", userSchema)
export default User
