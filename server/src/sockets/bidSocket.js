import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import { config } from "../config/config.js"

// Create a singleton instance that can be imported elsewhere
let io

const setupSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.clientURL || "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
    })

    // Authentication middleware for Socket.IO
    io.use((socket, next) => {
        const token = socket.handshake.auth.token

        if (!token) {
            // Allow connection without authentication for public features
            socket.user = null
            return next()
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret)
            socket.user = decoded
            next()
        } catch (error) {
            console.error("Socket authentication error:", error.message)
            socket.user = null
            next()
        }
    })

    io.on("connection", (socket) => {
        console.log(
            `User connected: ${socket.id} ${
                socket.user ? `(User: ${socket.user.id})` : "(Anonymous)"
            }`
        )

        // Join user to their personal room for notifications
        if (socket.user) {
            socket.join(`user:${socket.user.id}`)
        }

        // Join product rooms for real-time updates
        socket.on("join-product", (productId) => {
            socket.join(`product:${productId}`)
            console.log(`Socket ${socket.id} joined product room: ${productId}`)
        })

        // Leave product room
        socket.on("leave-product", (productId) => {
            socket.leave(`product:${productId}`)
            console.log(`Socket ${socket.id} left product room: ${productId}`)
        })

        // Handle new bid event (this will be emitted from bidService)
        socket.on("place-bid", async (bidData) => {
            // Validation and processing will be handled in the bidService
            // This is just for direct socket-to-socket communication if needed
            socket.to(`product:${bidData.productId}`).emit("new-bid", bidData)
        })

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`)
        })
    })

    return io
}

// Export a function to get the io instance
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!")
    }
    return io
}

export default setupSocket
