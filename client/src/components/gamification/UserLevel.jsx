import { useGamification } from "../../context/GamificationContext"

const UserLevel = ({
    className = "",
    showTitle = true,
    showProgress = true,
    compact = false,
}) => {
    const { profile, loading } = useGamification()

    if (loading || !profile) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
                {showTitle && (
                    <div className="animate-pulse bg-gray-200 rounded h-4 w-24 ml-2"></div>
                )}
            </div>
        )
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center">
                <div className="relative">
                    <div className="flex items-center justify-center bg-primary-100 text-primary-800 rounded-full h-8 w-8 font-bold text-sm">
                        {profile.level}
                    </div>
                </div>

                {showTitle && (
                    <div className="ml-2 text-sm font-medium text-gray-700">
                        {profile.preferences.displayTitle}
                    </div>
                )}
            </div>

            {showProgress && !compact && (
                <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div
                            className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${profile.progressToNextLevel}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{profile.experience} XP</span>
                        <span>{profile.nextLevelThreshold} XP</span>
                    </div>
                </div>
            )}

            {showProgress && compact && (
                <div className="mt-1 flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div
                            className="bg-primary-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${profile.progressToNextLevel}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                        {profile.progressToNextLevel}%
                    </span>
                </div>
            )}
        </div>
    )
}

export default UserLevel
