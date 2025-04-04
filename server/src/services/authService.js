import User from "../models/User.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { config } from "../config/config.js"
import gamificationService from "./gamificationService.js"

class AuthService {
    // Register a new user
    async register(userData) {
        try {
            // Check if user already exists by email
            const existingUserByEmail = await User.findOne({
                email: userData.email,
            })
            if (existingUserByEmail) {
                throw new Error("User with this email already exists")
            }

            // Check if user already exists by username
            if (userData.username) {
                const existingUserByUsername = await User.findOne({
                    username: userData.username,
                })
                if (existingUserByUsername) {
                    throw new Error("Username is already taken")
                }
            } else {
                throw new Error("Username is required")
            }

            // Generate avatar
            const avatar = this.generateAvatar()

            // Create new user
            const user = new User({
                ...userData,
                avatar,
            })

            await user.save()

            // Generate JWT token
            const token = this.generateToken(user)

            return {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                },
            }
        } catch (error) {
            console.error("Registration error:", error)
            throw error
        }
    }

    // Login user
    async login(userCredentials) {
        try {
            const { email, username, password } = userCredentials

            // Find user by email or username
            const user = await User.findOne({
                $or: [{ email }, { username }], // Check for either email or username
            }).select("+password")

            if (!user) {
                throw new Error("Invalid credentials")
            }

            // Compare password
            const isMatch = await user.comparePassword(password)
            if (!isMatch) {
                throw new Error("Invalid credentials")
            }

            // Update login streak - wrap in try/catch to prevent login failures
            try {
                await gamificationService.updateLoginStreak(user._id)
            } catch (streakError) {
                console.error("Error updating login streak:", streakError)
                // Continue with login even if streak update fails
            }

            // Award experience for logging in - wrap in try/catch to prevent login failures
            try {
                await gamificationService.awardExperience(
                    user._id,
                    2,
                    "logging in"
                )
            } catch (expError) {
                console.error("Error awarding experience:", expError)
                // Continue with login even if experience award fails
            }

            // Generate JWT token
            const token = this.generateToken(user)

            // Get user's gamification profile - wrap in try/catch to prevent login failures
            let gamificationProfile = null
            try {
                gamificationProfile =
                    await gamificationService.getUserGamificationProfile(
                        user._id
                    )
            } catch (profileError) {
                console.error(
                    "Error getting gamification profile:",
                    profileError
                )
                // Create a default profile if we can't get the real one
                gamificationProfile = {
                    level: 1,
                    experience: 0,
                    coins: 0,
                    streak: { count: 0 },
                    preferences: { displayTitle: "Novice Bidder" },
                    equippedBadges: [],
                }
            }

            return {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    level: gamificationProfile.level,
                    experience: gamificationProfile.experience,
                    coins: gamificationProfile.coins,
                    streak: gamificationProfile.streak,
                    title: gamificationProfile.preferences.displayTitle,
                    badges: gamificationProfile.equippedBadges,
                },
            }
        } catch (error) {
            // Just pass the original error message without adding "Login failed: " prefix
            throw error
        }
    }

    // Generate avatar using DiceBear
    generateAvatar() {
        try {
            // Generate a random name for the seed
            const randomNames = [
                "Alice",
                "Adrian",
                "Bob",
                "Caleb",
                "Charlie",
                "Diana",
                "Destiny",
                "Ethan",
                "Felix",
                "Jameson",
                "Leah",
                "Ryker",
                "Sophia",
            ]
            const randomName =
                randomNames[Math.floor(Math.random() * randomNames.length)]

            // Define avatar size
            const size = 32

            // Construct the API URL for the fun-emoji style
            const avatarUrl = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${randomName}&size=${size}`

            // Return the URL of the generated avatar
            return avatarUrl
        } catch (error) {
            console.error("Error generating avatar:", error)
            // Return a default avatar URL if generation fails
            return "https://example.com/default-avatar.png" // Replace with your default avatar URL
        }
    }

    // Generate JWT token
    generateToken(user) {
        return jwt.sign(
            {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
            config.jwtSecret,
            { expiresIn: "7d" }
        )
    }

    // Get current user
    async getCurrentUser(userId) {
        try {
            const user = await User.findById(userId)
            if (!user) {
                throw new Error("User not found")
            }
            return user
        } catch (error) {
            throw error
        }
    }

    // Generate password reset token
    async generatePasswordResetToken(email) {
        try {
            const user = await User.findOne({ email })
            if (!user) {
                throw new Error("User not found")
            }

            // Generate a random token
            const resetToken = crypto.randomBytes(32).toString("hex")

            // Hash the token and store it in the database
            const hashedToken = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex")

            // Set token and expiration (1 hour)
            user.resetPasswordToken = hashedToken
            user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

            await user.save()

            return { user, resetToken }
        } catch (error) {
            throw error
        }
    }

    // Reset password with token
    async resetPassword(token, newPassword) {
        try {
            // Hash the token from the URL
            const hashedToken = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex")

            // Find user with this token and valid expiration
            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() },
            })

            if (!user) {
                throw new Error("Invalid or expired password reset token")
            }

            // Set the new password
            user.password = newPassword

            // Clear the reset token fields
            user.resetPasswordToken = null
            user.resetPasswordExpires = null

            await user.save()

            return { email: user.email }
        } catch (error) {
            throw error
        }
    }
}

export default new AuthService()
