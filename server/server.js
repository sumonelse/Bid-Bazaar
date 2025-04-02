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
import authRoutes from "./src/routes/authRoutes.js"

dotenv.config()
connectDB()

const app = express()
const httpServer = http.createServer(app)
setupSocket(httpServer)

// Middleware
app.use(helmet())
app.use(
    cors({
        origin: config.clientURL,
        credentials: true,
    })
)
app.use(express.json())
app.use(morgan("combined"))

// Routes
app.use("/api/auth", authRoutes)
// app.use("/api/bid", quizRoutes)

// Error handling middleware
app.use(errorHandler)

// Start the server
const PORT = config.port || 5000
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
