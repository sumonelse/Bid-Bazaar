import { useState } from "react"
import { useGamification } from "../../context/GamificationContext"

const BadgeCard = ({ badge }) => {
    const [showDetails, setShowDetails] = useState(false)
    const { equipBadge } = useGamification()

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case "common":
                return "bg-gray-100 text-gray-800 border-gray-300"
            case "uncommon":
                return "bg-green-100 text-green-800 border-green-300"
            case "rare":
                return "bg-blue-100 text-blue-800 border-blue-300"
            case "epic":
                return "bg-purple-100 text-purple-800 border-purple-300"
            case "legendary":
                return "bg-amber-100 text-amber-800 border-amber-300"
            default:
                return "bg-gray-100 text-gray-800 border-gray-300"
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

    const handleEquipBadge = (e) => {
        e.stopPropagation()
        equipBadge(badge._id)
    }

    return (
        <div
            className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
                badge.isEquipped
                    ? "border-blue-400 shadow-md"
                    : `border-gray-200 ${getRarityColor(badge.rarity)}`
            }`}
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex items-start">
                    <div
                        className={`flex-shrink-0 p-3 rounded-full ${getRarityColor(
                            badge.rarity
                        )}`}
                    >
                        <span className="text-2xl">{badge.icon}</span>
                    </div>

                    <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                                {badge.name}
                            </h3>
                            <span
                                className={`text-xs font-medium ${getCategoryColor(
                                    badge.category
                                )}`}
                            >
                                {badge.rarity.charAt(0).toUpperCase() +
                                    badge.rarity.slice(1)}
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                            {badge.description}
                        </p>

                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                Unlocked{" "}
                                {new Date(
                                    badge.unlockedAt
                                ).toLocaleDateString()}
                            </span>

                            <button
                                onClick={handleEquipBadge}
                                className={`text-xs px-2 py-1 rounded ${
                                    badge.isEquipped
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {badge.isEquipped ? "Equipped" : "Equip"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">
                        Benefits:
                    </h4>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                        {badge.benefits &&
                            badge.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        {(!badge.benefits || badge.benefits.length === 0) && (
                            <li>No special benefits</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default BadgeCard
