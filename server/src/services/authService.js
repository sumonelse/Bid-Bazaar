import User from "../models/User.js"
import jwt from "jsonwebtoken"
import { config } from "../config/config.js"

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
                throw new Error("User  not found")
            }
            return user
        } catch (error) {
            throw error
        }
    }
}

export default new AuthService()
