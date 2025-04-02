import { config as conf } from "dotenv"
conf()

const _config = {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    dbURL: process.env.MONGODB_URI,
    clientURL: process.env.CLIENT_URL,
    jwtSecret: process.env.JWT_SECRET,
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    email: {
        service: process.env.EMAIL_SERVICE || "gmail", // Default email service
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
    },
}

// Freeze the config object to prevent modifications
export const config = Object.freeze(_config)
