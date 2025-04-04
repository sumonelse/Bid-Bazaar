import { useState, useEffect } from "react"
import { useGamification } from "../../context/GamificationContext"
import { useAuth } from "../../context/AuthContext"

const Leaderboard = () => {
    const { fetchLeaderboard, leaderboard } = useGamification()
    const { user } = useAuth()
    const [category, setCategory] = useState("level")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true)
            await fetchLeaderboard(category)
            setLoading(false)
        }

        loadLeaderboard()
    }, [category, fetchLeaderboard])

    const getCategoryLabel = (cat) => {
        switch (cat) {
            case "level":
                return "Level"
            case "bids":
                return "Bids Placed"
            case "wins":
                return "Auctions Won"
            case "sales":
                return "Items Sold"
            case "streak":
                return "Login Streak"
            default:
                return "Level"
        }
    }

    const getMedalEmoji = (rank) => {
        switch (rank) {
            case 1:
                return "🥇"
            case 2:
                return "🥈"
            case 3:
                return "🥉"
            default:
                return ""
        }
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                    Leaderboard
                </h2>

                <div className="mt-2 flex flex-wrap gap-2">
                    {["level", "bids", "wins", "sales", "streak"].map((cat) => (
                        <button
                            key={cat}
                            className={`px-3 py-1 text-sm rounded-full ${
                                category === cat
                                    ? "bg-blue-100 text-blue-800 font-medium"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setCategory(cat)}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Rank
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                User
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {getCategoryLabel(category)}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading
                            ? Array(5)
                                  .fill(0)
                                  .map((_, index) => (
                                      <tr key={index}>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="flex items-center">
                                                  <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>
                                                  <div className="ml-4">
                                                      <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
                                                      <div className="animate-pulse h-3 w-16 bg-gray-200 rounded mt-1"></div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="animate-pulse h-4 w-8 bg-gray-200 rounded"></div>
                                          </td>
                                      </tr>
                                  ))
                            : leaderboard.map((item) => (
                                  <tr
                                      key={item._id}
                                      className={
                                          user && item._id === user._id
                                              ? "bg-blue-50"
                                              : ""
                                      }
                                  >
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                              <span className="text-sm text-gray-900">
                                                  {item.rank}
                                              </span>
                                              <span className="ml-1">
                                                  {getMedalEmoji(item.rank)}
                                              </span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                              <div className="flex-shrink-0 h-8 w-8">
                                                  <img
                                                      className="h-8 w-8 rounded-full"
                                                      src={
                                                          item.avatar ||
                                                          "https://via.placeholder.com/40"
                                                      }
                                                      alt=""
                                                  />
                                              </div>
                                              <div className="ml-4">
                                                  <div className="text-sm font-medium text-gray-900">
                                                      {item.name}
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                      {item.title}
                                                  </div>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <span className="text-sm text-gray-900">
                                              {item.value}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Leaderboard
