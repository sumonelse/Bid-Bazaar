import { useState } from "react"

const AchievementCard = ({ achievement }) => {
    const [showDetails, setShowDetails] = useState(false)

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

    const getCategoryColor = (category) => {
        switch (category) {
            case "bidding":
                return "text-blue-600"
            case "selling":
                return "text-green-600"
            case "account":
                return "text-purple-600"
            case "social":
                return "text-pink-600"
            case "special":
                return "text-amber-600"
            default:
                return "text-gray-600"
        }
    }

    const tierNames = {
        1: "Bronze",
        2: "Silver",
        3: "Gold",
    }

    const progress = achievement.isCompleted
        ? 100
        : Math.min(
              100,
              Math.floor((achievement.progress / achievement.threshold) * 100)
          )

    return (
        <div
            className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                achievement.isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white"
            }`}
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex items-start">
                    <div
                        className={`flex-shrink-0 p-2 rounded-full ${getTierColor(
                            achievement.tier
                        )}`}
                    >
                        <span className="text-xl">{achievement.icon}</span>
                    </div>

                    <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                                {achievement.name}
                            </h3>
                            <span
                                className={`text-xs font-medium ${getCategoryColor(
                                    achievement.category
                                )}`}
                            >
                                {tierNames[achievement.tier]}
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                            {achievement.description}
                        </p>

                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                                        achievement.isCompleted
                                            ? "bg-green-500"
                                            : "bg-blue-500"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">
                                    {achievement.progress} /{" "}
                                    {achievement.threshold}
                                </span>
                                <span className="text-xs font-medium text-gray-700">
                                    {achievement.points} XP
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDetails && achievement.isCompleted && (
                <div className="px-4 py-2 bg-green-100 border-t border-green-200">
                    <p className="text-xs text-green-800">
                        Unlocked{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(achievement.unlockedAt).toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    )
}

export default AchievementCard
