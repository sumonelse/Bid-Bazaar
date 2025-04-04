import User from "../models/User.js"
import Achievement from "../models/Achievement.js"
import UserAchievement from "../models/UserAchievement.js"
import Badge from "../models/Badge.js"
import UserBadge from "../models/UserBadge.js"
import notificationService from "./notificationService.js"
import { getIO } from "../sockets/bidSocket.js"

class GamificationService {
    // Experience points needed for each level
    levelThresholds = [
        0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500,
        5200, 6000, 6900, 7900, 9000, 10200, 11500, 13000,
    ]

    // Titles for each level
    levelTitles = [
        "Novice Bidder",
        "Auction Explorer",
        "Bargain Hunter",
        "Deal Finder",
        "Auction Enthusiast",
        "Bidding Specialist",
        "Auction Tactician",
        "Bidding Strategist",
        "Deal Master",
        "Auction Expert",
        "Elite Bidder",
        "Auction Virtuoso",
        "Bidding Champion",
        "Auction Mogul",
        "Bidding Legend",
        "Auction Tycoon",
        "Bidding Royalty",
        "Auction Overlord",
        "Bidding Deity",
        "Ultimate Auctioneer",
    ]

    // Award experience points to a user
    async awardExperience(userId, points, reason) {
        try {
            const user = await User.findById(userId)
            if (!user) {
                throw new Error("User not found")
            }

            // Add experience points
            user.experience += points

            // Check if user leveled up
            const currentLevel = user.level
            let newLevel = currentLevel

            // Find the highest level the user qualifies for
            for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
                if (user.experience >= this.levelThresholds[i]) {
                    newLevel = i + 1
                    break
                }
            }

            // If user leveled up
            if (newLevel > currentLevel) {
                user.level = newLevel

                // Update user's display title if they haven't customized it
                if (
                    user.preferences.displayTitle ===
                    this.levelTitles[currentLevel - 1]
                ) {
                    user.preferences.displayTitle =
                        this.levelTitles[newLevel - 1]
                }

                // Award coins for leveling up
                const levelUpBonus = newLevel * 50
                user.coins += levelUpBonus

                // Create level up notification
                await notificationService.createNotification({
                    userId,
                    type: "system",
                    title: "Level Up!",
                    message: `Congratulations! You've reached level ${newLevel} and earned ${levelUpBonus} coins!`,
                })

                // Emit level up event via socket
                try {
                    const io = getIO()
                    io.to(`user:${userId}`).emit("level-up", {
                        level: newLevel,
                        coins: levelUpBonus,
                        title: this.levelTitles[newLevel - 1],
                    })
                } catch (socketError) {
                    console.error("Socket level-up event error:", socketError)
                }

                // Check for new badges unlocked by level
                await this.checkLevelBasedBadges(userId, newLevel)
            }

            // Save user
            await user.save()

            return {
                experienceGained: points,
                totalExperience: user.experience,
                level: user.level,
                leveledUp: newLevel > currentLevel,
                newTitle:
                    newLevel > currentLevel
                        ? this.levelTitles[newLevel - 1]
                        : null,
            }
        } catch (error) {
            console.error("Award experience error:", error)
            throw error
        }
    }

    // Award coins to a user
    async awardCoins(userId, amount, reason) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { $inc: { coins: amount } },
                { new: true }
            )

            if (!user) {
                throw new Error("User not found")
            }

            // Create notification for significant coin awards
            if (amount >= 50) {
                await notificationService.createNotification({
                    userId,
                    type: "system",
                    title: "Coins Awarded!",
                    message: `You've earned ${amount} coins for ${reason}!`,
                })
            }

            return {
                coinsAwarded: amount,
                totalCoins: user.coins,
            }
        } catch (error) {
            console.error("Award coins error:", error)
            throw error
        }
    }

    // Track user action for achievements
    async trackUserAction(userId, action, value = 1) {
        try {
            // Update user stats based on action
            const updateQuery = {}

            switch (action) {
                case "bid_placed":
                    updateQuery["stats.bidsPlaced"] = value
                    break
                case "auction_won":
                    updateQuery["stats.auctionsWon"] = value
                    break
                case "auction_created":
                    updateQuery["stats.auctionsCreated"] = value
                    break
                case "auction_sold":
                    updateQuery["stats.auctionsSold"] = value
                    break
                case "outbid_recovery":
                    updateQuery["stats.outbidRecoveries"] = value
                    break
                case "perfect_feedback":
                    updateQuery["stats.perfectFeedbacks"] = value
                    break
                case "referral":
                    updateQuery["stats.referrals"] = value
                    break
                case "total_spent":
                    updateQuery["stats.totalSpent"] = value
                    break
                case "total_earned":
                    updateQuery["stats.totalEarned"] = value
                    break
                case "highest_bid":
                    updateQuery["stats.highestBid"] = value
                    break
                default:
                    // No stat to update
                    break
            }

            // If we have stats to update
            if (Object.keys(updateQuery).length > 0) {
                // Increment the stats
                const incrementQuery = {}
                for (const key in updateQuery) {
                    incrementQuery[key] = updateQuery[key]
                }

                await User.findByIdAndUpdate(userId, { $inc: incrementQuery })
            }

            // Check for achievements related to this action
            await this.checkAchievements(userId, action, value)

            return true
        } catch (error) {
            console.error(`Track user action (${action}) error:`, error)
            throw error
        }
    }

    // Check for achievements based on an action
    async checkAchievements(userId, action, value) {
        try {
            // Get user stats
            const user = await User.findById(userId)
            if (!user) {
                throw new Error("User not found")
            }

            // Find achievements for this action that the user hasn't completed yet
            const achievements = await Achievement.find({
                "criteria.action": action,
            })

            if (!achievements.length) {
                return []
            }

            const unlockedAchievements = []

            for (const achievement of achievements) {
                // Check if user already has this achievement
                const userAchievement = await UserAchievement.findOne({
                    userId,
                    achievementId: achievement._id,
                })

                // If already completed, skip
                if (userAchievement && userAchievement.isCompleted) {
                    continue
                }

                // Get the current stat value based on the action
                let currentValue = 0

                switch (action) {
                    case "bid_placed":
                        currentValue = user.stats.bidsPlaced
                        break
                    case "auction_won":
                        currentValue = user.stats.auctionsWon
                        break
                    case "auction_created":
                        currentValue = user.stats.auctionsCreated
                        break
                    case "auction_sold":
                        currentValue = user.stats.auctionsSold
                        break
                    case "outbid_recovery":
                        currentValue = user.stats.outbidRecoveries
                        break
                    case "perfect_feedback":
                        currentValue = user.stats.perfectFeedbacks
                        break
                    case "referral":
                        currentValue = user.stats.referrals
                        break
                    case "days_active":
                        // Calculate days since registration
                        const daysSinceRegistration = Math.floor(
                            (Date.now() - user.createdAt) /
                                (1000 * 60 * 60 * 24)
                        )
                        currentValue = daysSinceRegistration
                        break
                    case "consecutive_days":
                        currentValue = user.streak.count
                        break
                    case "watchlist_items":
                        currentValue = user.watchlist.length
                        break
                    case "profile_completed":
                        // Check if profile is complete (has avatar, etc.)
                        currentValue = user.avatar ? 1 : 0
                        break
                    default:
                        currentValue = 0
                }

                // If user doesn't have this achievement yet, create it with current progress
                if (!userAchievement) {
                    await UserAchievement.create({
                        userId,
                        achievementId: achievement._id,
                        progress: currentValue,
                        isCompleted:
                            currentValue >= achievement.criteria.threshold,
                    })
                }
                // Otherwise update the progress
                else {
                    userAchievement.progress = currentValue
                    userAchievement.isCompleted =
                        currentValue >= achievement.criteria.threshold

                    if (userAchievement.isCompleted) {
                        userAchievement.unlockedAt = new Date()
                    }

                    await userAchievement.save()
                }

                // If achievement is completed
                if (currentValue >= achievement.criteria.threshold) {
                    // Award experience and coins
                    await this.awardExperience(
                        userId,
                        achievement.points,
                        `completing the "${achievement.name}" achievement`
                    )
                    await this.awardCoins(
                        userId,
                        achievement.points * 5,
                        `completing the "${achievement.name}" achievement`
                    )

                    // Create notification
                    await notificationService.createNotification({
                        userId,
                        type: "system",
                        title: "Achievement Unlocked!",
                        message: `You've unlocked the "${
                            achievement.name
                        }" achievement and earned ${
                            achievement.points * 5
                        } coins!`,
                    })

                    // Emit achievement unlocked event via socket
                    try {
                        const io = getIO()
                        io.to(`user:${userId}`).emit("achievement-unlocked", {
                            achievement: {
                                _id: achievement._id,
                                name: achievement.name,
                                description: achievement.description,
                                icon: achievement.icon,
                                points: achievement.points,
                                category: achievement.category,
                                tier: achievement.tier,
                            },
                            coins: achievement.points * 5,
                        })
                    } catch (socketError) {
                        console.error(
                            "Socket achievement event error:",
                            socketError
                        )
                    }

                    unlockedAchievements.push(achievement)

                    // Check if any badges are unlocked by this achievement
                    await this.checkAchievementBasedBadges(
                        userId,
                        achievement._id
                    )
                }
            }

            return unlockedAchievements
        } catch (error) {
            console.error("Check achievements error:", error)
            throw error
        }
    }

    // Check for badges unlocked by completing achievements
    async checkAchievementBasedBadges(userId, achievementId) {
        try {
            // Find badges that require this achievement
            const badges = await Badge.find({
                "requirements.achievements": achievementId,
            })

            if (!badges.length) {
                return []
            }

            const unlockedBadges = []

            for (const badge of badges) {
                // Check if user already has this badge
                const userBadge = await UserBadge.findOne({
                    userId,
                    badgeId: badge._id,
                })

                if (userBadge) {
                    continue // User already has this badge
                }

                // Check if user has all required achievements
                const requiredAchievementIds = badge.requirements.achievements

                if (requiredAchievementIds.length === 0) {
                    continue // No achievement requirements
                }

                const completedAchievements = await UserAchievement.find({
                    userId,
                    achievementId: { $in: requiredAchievementIds },
                    isCompleted: true,
                })

                // If user has completed all required achievements
                if (
                    completedAchievements.length ===
                    requiredAchievementIds.length
                ) {
                    // Create user badge
                    await UserBadge.create({
                        userId,
                        badgeId: badge._id,
                        unlockedAt: new Date(),
                    })

                    // Award coins
                    const coinsAwarded = this.getBadgeCoinsReward(badge.rarity)
                    await this.awardCoins(
                        userId,
                        coinsAwarded,
                        `unlocking the "${badge.name}" badge`
                    )

                    // Create notification
                    await notificationService.createNotification({
                        userId,
                        type: "system",
                        title: "Badge Unlocked!",
                        message: `You've unlocked the "${badge.name}" badge and earned ${coinsAwarded} coins!`,
                    })

                    // Emit badge unlocked event via socket
                    try {
                        const io = getIO()
                        io.to(`user:${userId}`).emit("badge-unlocked", {
                            badge: {
                                _id: badge._id,
                                name: badge.name,
                                description: badge.description,
                                icon: badge.icon,
                                category: badge.category,
                                rarity: badge.rarity,
                            },
                            coins: coinsAwarded,
                        })
                    } catch (socketError) {
                        console.error("Socket badge event error:", socketError)
                    }

                    unlockedBadges.push(badge)
                }
            }

            return unlockedBadges
        } catch (error) {
            console.error("Check achievement-based badges error:", error)
            throw error
        }
    }

    // Check for badges unlocked by reaching a certain level
    async checkLevelBasedBadges(userId, level) {
        try {
            // Find badges that require this level or lower
            const badges = await Badge.find({
                "requirements.level": { $lte: level, $gt: 0 },
            })

            if (!badges.length) {
                return []
            }

            const unlockedBadges = []

            for (const badge of badges) {
                // Check if user already has this badge
                const userBadge = await UserBadge.findOne({
                    userId,
                    badgeId: badge._id,
                })

                if (userBadge) {
                    continue // User already has this badge
                }

                // Create user badge
                await UserBadge.create({
                    userId,
                    badgeId: badge._id,
                    unlockedAt: new Date(),
                })

                // Award coins
                const coinsAwarded = this.getBadgeCoinsReward(badge.rarity)
                await this.awardCoins(
                    userId,
                    coinsAwarded,
                    `unlocking the "${badge.name}" badge`
                )

                // Create notification
                await notificationService.createNotification({
                    userId,
                    type: "system",
                    title: "Badge Unlocked!",
                    message: `You've unlocked the "${badge.name}" badge and earned ${coinsAwarded} coins!`,
                })

                // Emit badge unlocked event via socket
                try {
                    const io = getIO()
                    io.to(`user:${userId}`).emit("badge-unlocked", {
                        badge: {
                            _id: badge._id,
                            name: badge.name,
                            description: badge.description,
                            icon: badge.icon,
                            category: badge.category,
                            rarity: badge.rarity,
                        },
                        coins: coinsAwarded,
                    })
                } catch (socketError) {
                    console.error("Socket badge event error:", socketError)
                }

                unlockedBadges.push(badge)
            }

            return unlockedBadges
        } catch (error) {
            console.error("Check level-based badges error:", error)
            throw error
        }
    }

    // Get user's achievements
    async getUserAchievements(userId) {
        try {
            const userAchievements = await UserAchievement.find({ userId })
                .populate("achievementId")
                .sort({ unlockedAt: -1 })

            return userAchievements
        } catch (error) {
            console.error("Get user achievements error:", error)
            throw error
        }
    }

    // Get user's badges
    async getUserBadges(userId) {
        try {
            const userBadges = await UserBadge.find({ userId })
                .populate("badgeId")
                .sort({ unlockedAt: -1 })

            return userBadges
        } catch (error) {
            console.error("Get user badges error:", error)
            throw error
        }
    }

    // Get user's gamification profile
    async getUserGamificationProfile(userId) {
        try {
            const user = await User.findById(userId).select(
                "level experience coins streak stats preferences"
            )

            if (!user) {
                throw new Error("User not found")
            }

            // Calculate next level threshold
            const nextLevelThreshold =
                user.level < this.levelThresholds.length
                    ? this.levelThresholds[user.level]
                    : this.levelThresholds[this.levelThresholds.length - 1] *
                      1.5

            // Calculate progress to next level
            const currentLevelThreshold = this.levelThresholds[user.level - 1]
            const progressToNextLevel = Math.min(
                100,
                Math.floor(
                    ((user.experience - currentLevelThreshold) /
                        (nextLevelThreshold - currentLevelThreshold)) *
                        100
                )
            )

            // Get user's achievements
            const achievements = await this.getUserAchievements(userId)

            // Get user's badges
            const badges = await this.getUserBadges(userId)

            // Get user's equipped badges
            const equippedBadges = badges.filter((badge) => badge.isEquipped)

            return {
                level: user.level,
                experience: user.experience,
                coins: user.coins,
                streak: user.streak,
                stats: user.stats,
                preferences: user.preferences,
                nextLevelThreshold,
                progressToNextLevel,
                achievements: achievements.map((ua) => ({
                    _id: ua.achievementId._id,
                    name: ua.achievementId.name,
                    description: ua.achievementId.description,
                    icon: ua.achievementId.icon,
                    category: ua.achievementId.category,
                    tier: ua.achievementId.tier,
                    points: ua.achievementId.points,
                    progress: ua.progress,
                    threshold: ua.achievementId.criteria.threshold,
                    isCompleted: ua.isCompleted,
                    unlockedAt: ua.unlockedAt,
                })),
                badges: badges.map((ub) => ({
                    _id: ub.badgeId._id,
                    name: ub.badgeId.name,
                    description: ub.badgeId.description,
                    icon: ub.badgeId.icon,
                    category: ub.badgeId.category,
                    rarity: ub.badgeId.rarity,
                    isEquipped: ub.isEquipped,
                    unlockedAt: ub.unlockedAt,
                })),
                equippedBadges: equippedBadges.map((ub) => ({
                    _id: ub.badgeId._id,
                    name: ub.badgeId.name,
                    icon: ub.badgeId.icon,
                    rarity: ub.badgeId.rarity,
                })),
            }
        } catch (error) {
            console.error("Get user gamification profile error:", error)
            throw error
        }
    }

    // Update user's login streak
    async updateLoginStreak(userId) {
        try {
            const user = await User.findById(userId)
            if (!user) {
                throw new Error("User not found")
            }

            const now = new Date()
            const lastActive = user.streak.lastActive
            const daysSinceLastActive = Math.floor(
                (now - lastActive) / (1000 * 60 * 60 * 24)
            )

            // If last active was today, do nothing
            if (daysSinceLastActive < 1) {
                return user.streak
            }

            // If last active was yesterday, increment streak
            if (daysSinceLastActive === 1) {
                user.streak.count += 1
                user.streak.lastActive = now

                // Award coins based on streak
                let coinsAwarded = 10 // Base coins

                // Bonus coins for milestone streaks
                if (user.streak.count % 7 === 0) {
                    // Weekly bonus
                    coinsAwarded += 50
                    await notificationService.createNotification({
                        userId,
                        type: "system",
                        title: "Weekly Streak Bonus!",
                        message: `You've maintained a ${user.streak.count}-day login streak! Here's a bonus of 50 coins!`,
                    })
                } else if (user.streak.count % 30 === 0) {
                    // Monthly bonus
                    coinsAwarded += 200
                    await notificationService.createNotification({
                        userId,
                        type: "system",
                        title: "Monthly Streak Bonus!",
                        message: `Incredible! You've maintained a ${user.streak.count}-day login streak! Here's a bonus of 200 coins!`,
                    })
                }

                user.coins += coinsAwarded

                // Check for streak-based achievements
                await this.trackUserAction(
                    userId,
                    "consecutive_days",
                    user.streak.count
                )

                // Emit streak update event via socket
                try {
                    const io = getIO()
                    io.to(`user:${userId}`).emit("streak-updated", {
                        streak: user.streak.count,
                        coins: coinsAwarded,
                    })
                } catch (socketError) {
                    console.error("Socket streak event error:", socketError)
                }
            }
            // If last active was more than a day ago, reset streak
            else {
                user.streak.count = 1
                user.streak.lastActive = now

                // Award base coins for logging in
                user.coins += 10
            }

            await user.save()
            return user.streak
        } catch (error) {
            console.error("Update login streak error:", error)
            throw error
        }
    }

    // Equip a badge
    async equipBadge(userId, badgeId) {
        try {
            // Check if user has this badge
            const userBadge = await UserBadge.findOne({
                userId,
                badgeId,
            })

            if (!userBadge) {
                throw new Error("Badge not found or not unlocked")
            }

            // Count currently equipped badges
            const equippedCount = await UserBadge.countDocuments({
                userId,
                isEquipped: true,
            })

            // If user already has 3 badges equipped, unequip the oldest one
            if (equippedCount >= 3 && !userBadge.isEquipped) {
                const oldestEquipped = await UserBadge.findOne({
                    userId,
                    isEquipped: true,
                }).sort({ updatedAt: 1 })

                if (oldestEquipped) {
                    oldestEquipped.isEquipped = false
                    await oldestEquipped.save()
                }
            }

            // Toggle equipped status
            userBadge.isEquipped = !userBadge.isEquipped
            await userBadge.save()

            return userBadge
        } catch (error) {
            console.error("Equip badge error:", error)
            throw error
        }
    }

    // Update user's display title
    async updateDisplayTitle(userId, title) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { "preferences.displayTitle": title },
                { new: true }
            )

            if (!user) {
                throw new Error("User not found")
            }

            return user.preferences.displayTitle
        } catch (error) {
            console.error("Update display title error:", error)
            throw error
        }
    }

    // Get leaderboard
    async getLeaderboard(category = "level", limit = 10) {
        try {
            let sortField

            switch (category) {
                case "level":
                    sortField = { level: -1, experience: -1 }
                    break
                case "bids":
                    sortField = { "stats.bidsPlaced": -1 }
                    break
                case "wins":
                    sortField = { "stats.auctionsWon": -1 }
                    break
                case "sales":
                    sortField = { "stats.auctionsSold": -1 }
                    break
                case "streak":
                    sortField = { "streak.count": -1 }
                    break
                default:
                    sortField = { level: -1, experience: -1 }
            }

            const leaderboard = await User.find({
                "preferences.showInLeaderboards": true,
            })
                .select(
                    "name username avatar level experience stats streak preferences"
                )
                .sort(sortField)
                .limit(limit)

            return leaderboard.map((user, index) => ({
                rank: index + 1,
                _id: user._id,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                level: user.level,
                title: user.preferences.displayTitle,
                value: this.getLeaderboardValue(user, category),
            }))
        } catch (error) {
            console.error("Get leaderboard error:", error)
            throw error
        }
    }

    // Helper method to get the appropriate value for leaderboard
    getLeaderboardValue(user, category) {
        switch (category) {
            case "level":
                return user.level
            case "bids":
                return user.stats.bidsPlaced
            case "wins":
                return user.stats.auctionsWon
            case "sales":
                return user.stats.auctionsSold
            case "streak":
                return user.streak.count
            default:
                return user.level
        }
    }

    // Helper method to determine coin reward based on badge rarity
    getBadgeCoinsReward(rarity) {
        switch (rarity) {
            case "common":
                return 50
            case "uncommon":
                return 100
            case "rare":
                return 200
            case "epic":
                return 500
            case "legendary":
                return 1000
            default:
                return 50
        }
    }

    // Initialize default achievements
    async initializeDefaultAchievements() {
        try {
            const defaultAchievements = [
                // Bidding achievements
                {
                    name: "First Bid",
                    description: "Place your first bid",
                    category: "bidding",
                    icon: "🎯",
                    points: 10,
                    criteria: {
                        type: "count",
                        threshold: 1,
                        action: "bid_placed",
                    },
                    tier: 1,
                },
                {
                    name: "Bidding Novice",
                    description: "Place 10 bids",
                    category: "bidding",
                    icon: "🔨",
                    points: 20,
                    criteria: {
                        type: "count",
                        threshold: 10,
                        action: "bid_placed",
                    },
                    tier: 1,
                },
                {
                    name: "Bidding Enthusiast",
                    description: "Place 50 bids",
                    category: "bidding",
                    icon: "💰",
                    points: 50,
                    criteria: {
                        type: "count",
                        threshold: 50,
                        action: "bid_placed",
                    },
                    tier: 2,
                },
                {
                    name: "Bidding Master",
                    description: "Place 100 bids",
                    category: "bidding",
                    icon: "🏆",
                    points: 100,
                    criteria: {
                        type: "count",
                        threshold: 100,
                        action: "bid_placed",
                    },
                    tier: 3,
                },

                // Auction winning achievements
                {
                    name: "First Win",
                    description: "Win your first auction",
                    category: "bidding",
                    icon: "🥇",
                    points: 20,
                    criteria: {
                        type: "count",
                        threshold: 1,
                        action: "auction_won",
                    },
                    tier: 1,
                },
                {
                    name: "Winning Streak",
                    description: "Win 5 auctions",
                    category: "bidding",
                    icon: "🏅",
                    points: 50,
                    criteria: {
                        type: "count",
                        threshold: 5,
                        action: "auction_won",
                    },
                    tier: 2,
                },
                {
                    name: "Auction Champion",
                    description: "Win 20 auctions",
                    category: "bidding",
                    icon: "👑",
                    points: 100,
                    criteria: {
                        type: "count",
                        threshold: 20,
                        action: "auction_won",
                    },
                    tier: 3,
                },

                // Selling achievements
                {
                    name: "First Listing",
                    description: "Create your first auction listing",
                    category: "selling",
                    icon: "📦",
                    points: 10,
                    criteria: {
                        type: "count",
                        threshold: 1,
                        action: "auction_created",
                    },
                    tier: 1,
                },
                {
                    name: "Seller Novice",
                    description: "Create 5 auction listings",
                    category: "selling",
                    icon: "🏪",
                    points: 30,
                    criteria: {
                        type: "count",
                        threshold: 5,
                        action: "auction_created",
                    },
                    tier: 1,
                },
                {
                    name: "Seller Pro",
                    description: "Create 20 auction listings",
                    category: "selling",
                    icon: "💼",
                    points: 75,
                    criteria: {
                        type: "count",
                        threshold: 20,
                        action: "auction_created",
                    },
                    tier: 2,
                },
                {
                    name: "Auction Tycoon",
                    description: "Create 50 auction listings",
                    category: "selling",
                    icon: "🏭",
                    points: 150,
                    criteria: {
                        type: "count",
                        threshold: 50,
                        action: "auction_created",
                    },
                    tier: 3,
                },

                // First sale achievement
                {
                    name: "First Sale",
                    description: "Complete your first auction sale",
                    category: "selling",
                    icon: "💵",
                    points: 20,
                    criteria: {
                        type: "count",
                        threshold: 1,
                        action: "auction_sold",
                    },
                    tier: 1,
                },

                // Account achievements
                {
                    name: "Profile Perfectionist",
                    description: "Complete your profile with an avatar",
                    category: "account",
                    icon: "👤",
                    points: 15,
                    criteria: {
                        type: "count",
                        threshold: 1,
                        action: "profile_completed",
                    },
                    tier: 1,
                },
                {
                    name: "Watchlist Collector",
                    description: "Add 10 items to your watchlist",
                    category: "account",
                    icon: "👁️",
                    points: 20,
                    criteria: {
                        type: "count",
                        threshold: 10,
                        action: "watchlist_items",
                    },
                    tier: 1,
                },

                // Streak achievements
                {
                    name: "Week Streak",
                    description: "Log in for 7 consecutive days",
                    category: "account",
                    icon: "📅",
                    points: 30,
                    criteria: {
                        type: "streak",
                        threshold: 7,
                        action: "consecutive_days",
                    },
                    tier: 1,
                },
                {
                    name: "Month Streak",
                    description: "Log in for 30 consecutive days",
                    category: "account",
                    icon: "🗓️",
                    points: 100,
                    criteria: {
                        type: "streak",
                        threshold: 30,
                        action: "consecutive_days",
                    },
                    tier: 2,
                },

                // Outbid recovery
                {
                    name: "Comeback Bidder",
                    description: "Place a new bid after being outbid",
                    category: "bidding",
                    icon: "🔄",
                    points: 15,
                    criteria: {
                        type: "count",
                        threshold: 1,
                        action: "outbid_recovery",
                    },
                    tier: 1,
                },
                {
                    name: "Persistent Bidder",
                    description: "Place 10 new bids after being outbid",
                    category: "bidding",
                    icon: "⚡",
                    points: 50,
                    criteria: {
                        type: "count",
                        threshold: 10,
                        action: "outbid_recovery",
                    },
                    tier: 2,
                },

                // Veteran achievement
                {
                    name: "Auction Veteran",
                    description: "Be a member for 30 days",
                    category: "account",
                    icon: "🎖️",
                    points: 50,
                    criteria: {
                        type: "count",
                        threshold: 30,
                        action: "days_active",
                    },
                    tier: 2,
                },
            ]

            // Check if achievements already exist
            const existingCount = await Achievement.countDocuments()

            if (existingCount === 0) {
                // Insert all achievements
                await Achievement.insertMany(defaultAchievements)
                console.log(
                    `Initialized ${defaultAchievements.length} default achievements`
                )
            }

            return true
        } catch (error) {
            console.error("Initialize default achievements error:", error)
            throw error
        }
    }

    // Initialize default badges
    async initializeDefaultBadges() {
        try {
            // First, get achievement IDs for badge requirements
            const firstBidAchievement = await Achievement.findOne({
                name: "First Bid",
            })
            const biddingMasterAchievement = await Achievement.findOne({
                name: "Bidding Master",
            })
            const firstWinAchievement = await Achievement.findOne({
                name: "First Win",
            })
            const auctionChampionAchievement = await Achievement.findOne({
                name: "Auction Champion",
            })
            const firstListingAchievement = await Achievement.findOne({
                name: "First Listing",
            })
            const auctionTycoonAchievement = await Achievement.findOne({
                name: "Auction Tycoon",
            })
            const weekStreakAchievement = await Achievement.findOne({
                name: "Week Streak",
            })
            const monthStreakAchievement = await Achievement.findOne({
                name: "Month Streak",
            })

            const defaultBadges = [
                // Bidding badges
                {
                    name: "Bidding Beginner",
                    description: "Place your first bid in an auction",
                    icon: "🎯",
                    category: "bidding",
                    rarity: "common",
                    requirements: {
                        achievements: firstBidAchievement
                            ? [firstBidAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: ["Access to bidding tutorials"],
                },
                {
                    name: "Bidding Legend",
                    description: "Become a master bidder with 100+ bids",
                    icon: "🏆",
                    category: "bidding",
                    rarity: "epic",
                    requirements: {
                        achievements: biddingMasterAchievement
                            ? [biddingMasterAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: ["5% discount on listing fees"],
                },

                // Winning badges
                {
                    name: "Auction Winner",
                    description: "Win your first auction",
                    icon: "🥇",
                    category: "bidding",
                    rarity: "uncommon",
                    requirements: {
                        achievements: firstWinAchievement
                            ? [firstWinAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: ["Special winner profile frame"],
                },
                {
                    name: "Champion Collector",
                    description: "Win 20 or more auctions",
                    icon: "👑",
                    category: "bidding",
                    rarity: "legendary",
                    requirements: {
                        achievements: auctionChampionAchievement
                            ? [auctionChampionAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: [
                        "VIP bidding status",
                        "Early access to featured auctions",
                    ],
                },

                // Selling badges
                {
                    name: "Seller Initiate",
                    description: "Create your first auction listing",
                    icon: "📦",
                    category: "selling",
                    rarity: "common",
                    requirements: {
                        achievements: firstListingAchievement
                            ? [firstListingAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: ["Access to seller tutorials"],
                },
                {
                    name: "Master Merchant",
                    description: "Create 50 or more auction listings",
                    icon: "🏭",
                    category: "selling",
                    rarity: "epic",
                    requirements: {
                        achievements: auctionTycoonAchievement
                            ? [auctionTycoonAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: ["Featured seller status", "Reduced fees"],
                },

                // Streak badges
                {
                    name: "Weekly Devotee",
                    description: "Log in for 7 consecutive days",
                    icon: "📅",
                    category: "account",
                    rarity: "uncommon",
                    requirements: {
                        achievements: weekStreakAchievement
                            ? [weekStreakAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: ["Daily bonus coins"],
                },
                {
                    name: "Monthly Loyalist",
                    description: "Log in for 30 consecutive days",
                    icon: "🗓️",
                    category: "account",
                    rarity: "rare",
                    requirements: {
                        achievements: monthStreakAchievement
                            ? [monthStreakAchievement._id]
                            : [],
                        level: 0,
                    },
                    benefits: ["Exclusive monthly rewards"],
                },

                // Level-based badges
                {
                    name: "Rising Star",
                    description: "Reach level 5",
                    icon: "⭐",
                    category: "account",
                    rarity: "uncommon",
                    requirements: {
                        achievements: [],
                        level: 5,
                    },
                    benefits: ["Special profile indicator"],
                },
                {
                    name: "Auction Elite",
                    description: "Reach level 10",
                    icon: "💫",
                    category: "account",
                    rarity: "rare",
                    requirements: {
                        achievements: [],
                        level: 10,
                    },
                    benefits: ["Elite profile badge", "Bonus coins on wins"],
                },
                {
                    name: "Auction Royalty",
                    description: "Reach level 20",
                    icon: "👑",
                    category: "account",
                    rarity: "legendary",
                    requirements: {
                        achievements: [],
                        level: 20,
                    },
                    benefits: [
                        "Royal profile theme",
                        "VIP status",
                        "Special auction access",
                    ],
                },
            ]

            // Check if badges already exist
            const existingCount = await Badge.countDocuments()

            if (existingCount === 0) {
                // Insert all badges
                await Badge.insertMany(defaultBadges)
                console.log(
                    `Initialized ${defaultBadges.length} default badges`
                )
            }

            return true
        } catch (error) {
            console.error("Initialize default badges error:", error)
            throw error
        }
    }
}

export default new GamificationService()
