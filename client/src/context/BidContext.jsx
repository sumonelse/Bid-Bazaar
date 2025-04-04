import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react"
import { useAuth } from "./AuthContext"
import socketService from "../services/socketService"
import { placeBid as placeBidApi } from "../api/bidService"

// Create the context
const BidContext = createContext()

// Custom hook to use the bid context
export const useBidding = () => {
    return useContext(BidContext)
}

// Provider component
export const BidProvider = ({ children }) => {
    const [activeBids, setActiveBids] = useState({})
    const { isAuthenticated, user } = useAuth()
    const [isConnected, setIsConnected] = useState(false)

    // Initialize socket connection when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize the socket service with the user's token
            socketService.initialize(localStorage.getItem("token"))
            setIsConnected(true)

            // Set up event listeners for connection status
            socketService.on("connect", () => setIsConnected(true))
            socketService.on("disconnect", () => setIsConnected(false))

            // Clean up on unmount
            return () => {
                socketService.disconnect()
            }
        }
    }, [isAuthenticated, user])

    // Listen for bid updates
    useEffect(() => {
        if (isConnected) {
            // Listen for new bids
            const handleNewBid = (data) => {
                console.log("New bid received:", data)
                const productId = data.productId

                setActiveBids((prev) => ({
                    ...prev,
                    [productId]: {
                        ...prev[productId],
                        currentBid: data.amount,
                        bidCount:
                            data.product?.bidCount ||
                            (prev[productId]?.bidCount || 0) + 1,
                        lastBidder: data.user,
                        lastBidTime: new Date(data.timestamp),
                    },
                }))
            }

            // Listen for auction ended events
            const handleAuctionEnded = (data) => {
                const { productId, winningBid } = data

                setActiveBids((prev) => ({
                    ...prev,
                    [productId]: {
                        ...prev[productId],
                        isEnded: true,
                        winningBid,
                    },
                }))
            }

            // Listen for auction ending soon events
            const handleAuctionEndingSoon = (data) => {
                const { productId, endTime } = data

                setActiveBids((prev) => ({
                    ...prev,
                    [productId]: {
                        ...prev[productId],
                        isEndingSoon: true,
                        endTime,
                    },
                }))
            }

            // Register event listeners
            socketService.on("new-bid", handleNewBid)
            socketService.on("auction-ended", handleAuctionEnded)
            socketService.on("auction-ending-soon", handleAuctionEndingSoon)

            // Clean up listeners when component unmounts or connection changes
            return () => {
                socketService.off("new-bid", handleNewBid)
                socketService.off("auction-ended", handleAuctionEnded)
                socketService.off(
                    "auction-ending-soon",
                    handleAuctionEndingSoon
                )
            }
        }
    }, [isConnected])

    // Join a product's bid room to receive updates
    const joinBidRoom = useCallback(
        (productId) => {
            if (isConnected && productId) {
                socketService.joinProduct(productId)
            }
        },
        [isConnected]
    )

    // Leave a product's bid room
    const leaveBidRoom = useCallback(
        (productId) => {
            if (isConnected && productId) {
                socketService.leaveProduct(productId)
            }
        },
        [isConnected]
    )

    // Place a bid
    const placeBid = useCallback(
        async (productId, amount) => {
            try {
                // Use the API service to place the bid
                const response = await placeBidApi(productId, amount)

                // Also emit through socket for real-time updates
                if (isConnected) {
                    socketService.placeBid({ productId, amount })
                }

                return response
            } catch (error) {
                console.error("Error placing bid:", error)
                throw error
            }
        },
        [isConnected]
    )

    // Context value
    const value = {
        activeBids,
        joinBidRoom,
        leaveBidRoom,
        placeBid,
        isConnected,
    }

    return <BidContext.Provider value={value}>{children}</BidContext.Provider>
}
