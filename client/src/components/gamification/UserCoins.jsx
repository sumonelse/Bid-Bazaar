import { useGamification } from "../../context/GamificationContext"
import { CurrencyDollarIcon } from "@heroicons/react/24/outline"

const UserCoins = ({ className = "" }) => {
    const { profile, loading } = useGamification()

    if (loading || !profile) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className="animate-pulse bg-gray-200 rounded-full h-6 w-6"></div>
                <div className="animate-pulse bg-gray-200 rounded h-4 w-16 ml-2"></div>
            </div>
        )
    }

    return (
        <div className={`flex items-center ${className}`}>
            <div className="flex items-center justify-center bg-yellow-100 text-yellow-800 rounded-full p-1">
                <CurrencyDollarIcon className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
                {profile.coins.toLocaleString()} Coins
            </span>
        </div>
    )
}

export default UserCoins
