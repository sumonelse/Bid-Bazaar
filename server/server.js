import express from "express"
import http from "http"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"
import { config } from "./src/config/config.js"
import connectDB from "./src/config/db.js"
import errorHandler from "./src/middlewares/errorHandler.js"
import setupSocket from "./src/sockets/bidSocket.js"
import schedulerService from "./src/services/schedulerService.js"

// Import routes
import authRoutes from "./src/routes/authRoutes.js"
import productRoutes from "./src/routes/productRoutes.js"
import notificationRoutes from "./src/routes/notificationRoutes.js"
import categoryRoutes from "./src/routes/categoryRoutes.js"
import bidRoutes from "./src/routes/bidRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"
import gamificationRoutes from "./src/routes/gamificationRoutes.js"

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const httpServer = http.createServer(app)

// Setup WebSocket
setupSocket(httpServer)

// Connect to MongoDB
connectDB()

// Initialize scheduler service
schedulerService.initialize()

// Middleware
app.use(helmet()) // Security headers
app.use(cors({ origin: config.clientURL || "*", credentials: true })) // CORS configuration
app.use(express.json()) // Parse JSON request bodies
app.use(morgan("combined")) // Logging

// API Routes
app.use("/api/auth", authRoutes) // Authentication routes
app.use("/api/products", productRoutes) // Product-related routes
app.use("/api/notifications", notificationRoutes) // Notification-related routes
app.use("/api/categories", categoryRoutes) // Category-related routes
app.use("/api/bids", bidRoutes) // Bid-related routes
app.use("/api/user", userRoutes) // User-related routes
app.use("/api/gamification", gamificationRoutes) // Gamification-related routes

// Fallback route for undefined endpoints
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" })
})

// Error handling middleware
app.use(errorHandler)

// Start the server
const PORT = config.port || 5000
httpServer.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT}${PORT === 5000 ? " (default)" : ""}`
    )
})
