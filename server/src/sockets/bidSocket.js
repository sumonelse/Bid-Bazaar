import { Server } from "socket.io"

const setupSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    })

    io.on("connection", (socket) => {
        console.log(`User  connected: ${socket.id}`)

        socket.on("disconnect", () => {
            console.log(`User  disconnected: ${socket.id}`)
        })
    })
}

export default setupSocket
