import { useGamification } from "../../context/GamificationContext"
import AchievementNotification from "./AchievementNotification"
import BadgeNotification from "./BadgeNotification"
import LevelUpNotification from "./LevelUpNotification"

const GamificationNotifications = () => {
    const {
        recentAchievements,
        recentBadges,
        showLevelUp,
        levelUpData,
        clearRecentAchievements,
        clearRecentBadges,
        dismissLevelUp,
    } = useGamification()

    return (
        <>
            {/* Achievement Notifications */}
            {recentAchievements.length > 0 && (
                <AchievementNotification
                    achievement={recentAchievements[0]}
                    onClose={clearRecentAchievements}
                    coins={recentAchievements[0].points * 5}
                />
            )}

            {/* Badge Notifications */}
            {recentBadges.length > 0 && (
                <BadgeNotification
                    badge={recentBadges[0]}
                    onClose={clearRecentBadges}
                    coins={recentBadges[0].coins}
                />
            )}

            {/* Level Up Notification */}
            {showLevelUp && levelUpData && (
                <LevelUpNotification
                    level={levelUpData.level}
                    coins={levelUpData.coins}
                    title={levelUpData.title}
                    onClose={dismissLevelUp}
                />
            )}
        </>
    )
}

export default GamificationNotifications
