import api from "./axios"

// Get user's gamification profile
export const getGamificationProfile = async () => {
    try {
        const response = await api.get("/gamification/profile")
        return response.data.data
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to fetch gamification profile",
            }
        )
    }
}

// Get user's achievements
export const getUserAchievements = async () => {
    try {
        const response = await api.get("/gamification/achievements")
        return response.data.data
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to fetch achievements" }
        )
    }
}

// Get user's badges
export const getUserBadges = async () => {
    try {
        const response = await api.get("/gamification/badges")
        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch badges" }
    }
}

// Equip a badge
export const equipBadge = async (badgeId) => {
    try {
        const response = await api.put(`/gamification/badges/${badgeId}/equip`)
        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to equip badge" }
    }
}

// Update display title
export const updateDisplayTitle = async (title) => {
    try {
        const response = await api.put("/gamification/title", { title })
        return response.data.data
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to update display title",
            }
        )
    }
}

// Get leaderboard
export const getLeaderboard = async (category = "level", limit = 10) => {
    try {
        const response = await api.get(
            `/gamification/leaderboard?category=${category}&limit=${limit}`
        )
        return response.data.data
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch leaderboard" }
    }
}

// Update login streak
export const updateLoginStreak = async () => {
    try {
        const response = await api.post("/gamification/streak")
        return response.data.data
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to update login streak" }
        )
    }
}
