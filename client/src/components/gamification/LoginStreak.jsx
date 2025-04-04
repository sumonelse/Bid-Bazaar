import { useGamification } from "../../context/GamificationContext"
import { FireIcon } from "@heroicons/react/24/solid"

const LoginStreak = ({ className = "" }) => {
    const { profile, loading } = useGamification()

    if (loading || !profile) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className="animate-pulse bg-gray-200 rounded-full h-6 w-6"></div>
                <div className="animate-pulse bg-gray-200 rounded h-4 w-16 ml-2"></div>
            </div>
        )
    }

    const { streak } = profile

    return (
        <div className={`flex items-center ${className}`}>
            <div className="flex items-center justify-center bg-red-100 text-red-800 rounded-full p-1">
                <FireIcon className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
                {streak.count} Day{streak.count !== 1 ? "s" : ""} Streak
            </span>
        </div>
    )
}

export default LoginStreak
