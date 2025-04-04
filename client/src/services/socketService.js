import { io } from "socket.io-client"

class SocketService {
    constructor() {
        this.socket = null
        this.isConnected = false
        this.listeners = new Map()
    }

    // Initialize the socket connection
    initialize(token) {
        if (this.socket) {
            this.socket.disconnect()
        }

        const apiUrl =
            import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        const baseUrl = apiUrl.replace("/api", "")

        this.socket = io(baseUrl, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        this.setupListeners()
        return this.socket
    }

    // Set up default socket listeners
    setupListeners() {
        this.socket.on("connect", () => {
            console.log("Socket connected")
            this.isConnected = true
        })

        this.socket.on("disconnect", () => {
            console.log("Socket disconnected")
            this.isConnected = false
        })

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error)
            this.isConnected = false
        })
    }

    // Join a product room to receive updates about a specific product
    joinProduct(productId) {
        if (!this.isConnected || !productId) return
        this.socket.emit("join-auction", productId)
    }

    // Leave a product room
    leaveProduct(productId) {
        if (!this.isConnected || !productId) return
        this.socket.emit("leave-auction", productId)
    }

    // Place a bid via socket
    placeBid(bidData) {
        if (!this.isConnected) return
        this.socket.emit("place-bid", bidData)
    }

    // Add an event listener
    on(event, callback) {
        if (!this.socket) return

        // Store the callback in our listeners map
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event).push(callback)

        // Add the listener to the socket
        this.socket.on(event, callback)
    }

    // Remove an event listener
    off(event, callback) {
        if (!this.socket) return

        // If callback is provided, remove only that callback
        if (callback) {
            this.socket.off(event, callback)

            // Update our listeners map
            if (this.listeners.has(event)) {
                const callbacks = this.listeners.get(event)
                const index = callbacks.indexOf(callback)
                if (index !== -1) {
                    callbacks.splice(index, 1)
                }
                if (callbacks.length === 0) {
                    this.listeners.delete(event)
                } else {
                    this.listeners.set(event, callbacks)
                }
            }
        }
        // If no callback is provided, remove all listeners for this event
        else {
            this.socket.off(event)
            this.listeners.delete(event)
        }
    }

    // Remove all listeners
    removeAllListeners() {
        if (!this.socket) return

        // Remove all socket listeners
        for (const [event] of this.listeners) {
            this.socket.off(event)
        }

        // Clear our listeners map
        this.listeners.clear()
    }

    // Disconnect the socket
    disconnect() {
        if (this.socket) {
            this.removeAllListeners()
            this.socket.disconnect()
            this.socket = null
            this.isConnected = false
        }
    }

    // Check if socket is connected
    getConnectionStatus() {
        return this.isConnected
    }
}

// Create a singleton instance
const socketService = new SocketService()
export default socketService
