import { useEffect, useState } from "react"
import { CheckCircleIcon } from "@heroicons/react/24/outline"

const AchievementNotification = ({ achievement, onClose, coins }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 100)

        // Auto close after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 500) // Wait for animation to complete
        }, 5000)

        return () => clearTimeout(timer)
    }, [onClose])

    const getTierColor = (tier) => {
        switch (tier) {
            case 1:
                return "bg-amber-100 text-amber-800"
            case 2:
                return "bg-gray-100 text-gray-800"
            case 3:
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-blue-100 text-blue-800"
        }
    }

    return (
        <div
            className={`fixed top-20 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-green-200 transform transition-all duration-500 ${
                isVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
            }`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            Achievement Unlocked!
                        </p>
                        <div className="mt-2 flex items-center">
                            <div
                                className={`p-2 rounded-full ${getTierColor(
                                    achievement.tier
                                )}`}
                            >
                                <span className="text-xl">
                                    {achievement.icon}
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {achievement.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {achievement.description}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                            <p className="text-xs text-green-600">
                                +{achievement.points} XP
                            </p>
                            {coins && (
                                <p className="text-xs text-amber-600">
                                    +{coins} Coins
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={() => {
                                setIsVisible(false)
                                setTimeout(onClose, 500)
                            }}
                        >
                            <span className="sr-only">Close</span>
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AchievementNotification
