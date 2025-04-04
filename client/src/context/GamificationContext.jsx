import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react"
import { useAuth } from "./AuthContext"
import {
    getGamificationProfile,
    getUserAchievements,
    getUserBadges,
    equipBadge,
    updateDisplayTitle,
    getLeaderboard,
} from "../api/gamificationService"
import socketService from "../services/socketService"

// Create the context
const GamificationContext = createContext()

// Custom hook to use the gamification context
export const useGamification = () => {
    return useContext(GamificationContext)
}

// Provider component
export const GamificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [achievements, setAchievements] = useState([])
    const [badges, setBadges] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)
    const [recentAchievements, setRecentAchievements] = useState([])
    const [recentBadges, setRecentBadges] = useState([])
    const [showLevelUp, setShowLevelUp] = useState(false)
    const [levelUpData, setLevelUpData] = useState(null)

    // Fetch gamification profile
    const fetchGamificationProfile = useCallback(async () => {
        if (!isAuthenticated) {
            setProfile(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await getGamificationProfile()
            setProfile(data)
        } catch (error) {
            console.error("Failed to fetch gamification profile:", error)
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated])

    // Fetch user achievements
    const fetchAchievements = useCallback(async () => {
        if (!isAuthenticated) {
            setAchievements([])
            return
        }

        try {
            const data = await getUserAchievements()
            setAchievements(data)
        } catch (error) {
            console.error("Failed to fetch achievements:", error)
        }
    }, [isAuthenticated])

    // Fetch user badges
    const fetchBadges = useCallback(async () => {
        if (!isAuthenticated) {
            setBadges([])
            return
        }

        try {
            const data = await getUserBadges()
            setBadges(data)
        } catch (error) {
            console.error("Failed to fetch badges:", error)
        }
    }, [isAuthenticated])

    // Fetch leaderboard
    const fetchLeaderboard = useCallback(
        async (category = "level", limit = 10) => {
            try {
                const data = await getLeaderboard(category, limit)
                setLeaderboard(data)
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error)
            }
        },
        []
    )

    // Equip a badge
    const handleEquipBadge = useCallback(
        async (badgeId) => {
            try {
                await equipBadge(badgeId)
                // Refresh badges
                fetchBadges()
                // Refresh profile to update equipped badges
                fetchGamificationProfile()
            } catch (error) {
                console.error("Failed to equip badge:", error)
            }
        },
        [fetchBadges, fetchGamificationProfile]
    )

    // Update display title
    const handleUpdateDisplayTitle = useCallback(
        async (title) => {
            try {
                await updateDisplayTitle(title)
                // Refresh profile
                fetchGamificationProfile()
            } catch (error) {
                console.error("Failed to update display title:", error)
            }
        },
        [fetchGamificationProfile]
    )

    // Initialize data when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchGamificationProfile()
            fetchAchievements()
            fetchBadges()
            fetchLeaderboard()
        }
    }, [
        isAuthenticated,
        fetchGamificationProfile,
        fetchAchievements,
        fetchBadges,
        fetchLeaderboard,
    ])

    // Set up socket listeners for gamification events
    useEffect(() => {
        if (isAuthenticated && user) {
            // Handle achievement unlocked event
            const handleAchievementUnlocked = (data) => {
                // Add to recent achievements
                setRecentAchievements((prev) => [data.achievement, ...prev])

                // Refresh profile and achievements
                fetchGamificationProfile()
                fetchAchievements()
            }

            // Handle badge unlocked event
            const handleBadgeUnlocked = (data) => {
                // Add to recent badges
                setRecentBadges((prev) => [data.badge, ...prev])

                // Refresh profile and badges
                fetchGamificationProfile()
                fetchBadges()
            }

            // Handle level up event
            const handleLevelUp = (data) => {
                setLevelUpData(data)
                setShowLevelUp(true)

                // Refresh profile
                fetchGamificationProfile()
            }

            // Handle streak updated event
            const handleStreakUpdated = () => {
                // Refresh profile
                fetchGamificationProfile()
            }

            // Register socket event listeners
            socketService.on("achievement-unlocked", handleAchievementUnlocked)
            socketService.on("badge-unlocked", handleBadgeUnlocked)
            socketService.on("level-up", handleLevelUp)
            socketService.on("streak-updated", handleStreakUpdated)

            // Clean up listeners when component unmounts
            return () => {
                socketService.off(
                    "achievement-unlocked",
                    handleAchievementUnlocked
                )
                socketService.off("badge-unlocked", handleBadgeUnlocked)
                socketService.off("level-up", handleLevelUp)
                socketService.off("streak-updated", handleStreakUpdated)
            }
        }
    }, [
        isAuthenticated,
        user,
        fetchGamificationProfile,
        fetchAchievements,
        fetchBadges,
    ])

    // Clear recent notifications after 5 seconds
    useEffect(() => {
        if (recentAchievements.length > 0) {
            const timer = setTimeout(() => {
                setRecentAchievements([])
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [recentAchievements])

    useEffect(() => {
        if (recentBadges.length > 0) {
            const timer = setTimeout(() => {
                setRecentBadges([])
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [recentBadges])

    // Context value
    const value = {
        profile,
        achievements,
        badges,
        leaderboard,
        loading,
        recentAchievements,
        recentBadges,
        showLevelUp,
        levelUpData,
        fetchGamificationProfile,
        fetchAchievements,
        fetchBadges,
        fetchLeaderboard,
        equipBadge: handleEquipBadge,
        updateDisplayTitle: handleUpdateDisplayTitle,
        dismissLevelUp: () => setShowLevelUp(false),
        clearRecentAchievements: () => setRecentAchievements([]),
        clearRecentBadges: () => setRecentBadges([]),
    }

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    )
}
