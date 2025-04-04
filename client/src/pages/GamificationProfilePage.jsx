import { useState, useEffect } from "react"
import { useGamification } from "../context/GamificationContext"
import UserLevel from "../components/gamification/UserLevel"
import UserCoins from "../components/gamification/UserCoins"
import LoginStreak from "../components/gamification/LoginStreak"
import AchievementCard from "../components/gamification/AchievementCard"
import BadgeCard from "../components/gamification/BadgeCard"
import Leaderboard from "../components/gamification/Leaderboard"
import { Tab } from "@headlessui/react"
import { TrophyIcon, FireIcon, SparklesIcon } from "@heroicons/react/24/outline"

const GamificationProfilePage = () => {
    const {
        profile,
        achievements,
        badges,
        loading,
        fetchGamificationProfile,
        fetchAchievements,
        fetchBadges,
    } = useGamification()

    const [selectedTab, setSelectedTab] = useState(0)

    useEffect(() => {
        fetchGamificationProfile()
        fetchAchievements()
        fetchBadges()
    }, [fetchGamificationProfile, fetchAchievements, fetchBadges])

    // Filter achievements by completion status
    const completedAchievements = achievements.filter((a) => a.isCompleted)
    const inProgressAchievements = achievements.filter((a) => !a.isCompleted)

    // Group achievements by category
    const achievementsByCategory = achievements.reduce((acc, achievement) => {
        const category = achievement.category
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(achievement)
        return acc
    }, {})

    // Group badges by category
    const badgesByCategory = badges.reduce((acc, badge) => {
        const category = badge.category
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(badge)
        return acc
    }, {})

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Your Gamification Profile
            </h1>

            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Level & Experience
                            </h2>
                            <UserLevel className="mb-2" />
                            <p className="text-sm text-gray-500 mt-2">
                                Keep participating to earn XP and level up!
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Coins & Rewards
                            </h2>
                            <UserCoins className="mb-2" />
                            <p className="text-sm text-gray-500 mt-2">
                                Earn coins by completing achievements and
                                maintaining streaks.
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Activity Streak
                            </h2>
                            <LoginStreak className="mb-2" />
                            <p className="text-sm text-gray-500 mt-2">
                                Log in daily to maintain your streak and earn
                                bonus rewards!
                            </p>
                        </div>
                    </div>

                    {profile && profile.stats && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Your Stats
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">
                                        Bids Placed
                                    </p>
                                    <p className="text-xl font-semibold text-blue-700">
                                        {profile.stats.bidsPlaced}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">
                                        Auctions Won
                                    </p>
                                    <p className="text-xl font-semibold text-green-700">
                                        {profile.stats.auctionsWon}
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">
                                        Auctions Created
                                    </p>
                                    <p className="text-xl font-semibold text-purple-700">
                                        {profile.stats.auctionsCreated}
                                    </p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">
                                        Highest Bid
                                    </p>
                                    <p className="text-xl font-semibold text-amber-700">
                                        ${profile.stats.highestBid.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs for Achievements, Badges, and Leaderboard */}
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1 mb-6">
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                            ${
                                selected
                                    ? "bg-white text-blue-700 shadow"
                                    : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"
                            }`
                        }
                    >
                        <div className="flex items-center justify-center">
                            <TrophyIcon className="h-5 w-5 mr-2" />
                            Achievements
                        </div>
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                            ${
                                selected
                                    ? "bg-white text-blue-700 shadow"
                                    : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"
                            }`
                        }
                    >
                        <div className="flex items-center justify-center">
                            <SparklesIcon className="h-5 w-5 mr-2" />
                            Badges
                        </div>
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                            ${
                                selected
                                    ? "bg-white text-blue-700 shadow"
                                    : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"
                            }`
                        }
                    >
                        <div className="flex items-center justify-center">
                            <FireIcon className="h-5 w-5 mr-2" />
                            Leaderboard
                        </div>
                    </Tab>
                </Tab.List>

                <Tab.Panels>
                    {/* Achievements Panel */}
                    <Tab.Panel>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Your Achievements
                                    </h2>
                                    <div className="text-sm text-gray-500">
                                        {completedAchievements.length} /{" "}
                                        {achievements.length} Completed
                                    </div>
                                </div>

                                {/* Achievement Categories */}
                                <div className="mt-4">
                                    <Tab.Group>
                                        <Tab.List className="flex space-x-1 overflow-x-auto pb-2">
                                            <Tab
                                                className={({ selected }) =>
                                                    `px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap
                                                    ${
                                                        selected
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`
                                                }
                                            >
                                                All ({achievements.length})
                                            </Tab>
                                            <Tab
                                                className={({ selected }) =>
                                                    `px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap
                                                    ${
                                                        selected
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`
                                                }
                                            >
                                                Completed (
                                                {completedAchievements.length})
                                            </Tab>
                                            <Tab
                                                className={({ selected }) =>
                                                    `px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap
                                                    ${
                                                        selected
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`
                                                }
                                            >
                                                In Progress (
                                                {inProgressAchievements.length})
                                            </Tab>
                                            {Object.keys(
                                                achievementsByCategory
                                            ).map((category) => (
                                                <Tab
                                                    key={category}
                                                    className={({ selected }) =>
                                                        `px-3 py-1.5 text-sm font-medium rounded-full capitalize whitespace-nowrap
                                                        ${
                                                            selected
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`
                                                    }
                                                >
                                                    {category} (
                                                    {
                                                        achievementsByCategory[
                                                            category
                                                        ].length
                                                    }
                                                    )
                                                </Tab>
                                            ))}
                                        </Tab.List>

                                        <Tab.Panels className="mt-4">
                                            {/* All Achievements */}
                                            <Tab.Panel>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {loading
                                                        ? Array(6)
                                                              .fill(0)
                                                              .map(
                                                                  (
                                                                      _,
                                                                      index
                                                                  ) => (
                                                                      <div
                                                                          key={
                                                                              index
                                                                          }
                                                                          className="animate-pulse bg-gray-100 rounded-lg h-40"
                                                                      ></div>
                                                                  )
                                                              )
                                                        : achievements.map(
                                                              (achievement) => (
                                                                  <AchievementCard
                                                                      key={
                                                                          achievement._id
                                                                      }
                                                                      achievement={
                                                                          achievement
                                                                      }
                                                                  />
                                                              )
                                                          )}
                                                </div>
                                            </Tab.Panel>

                                            {/* Completed Achievements */}
                                            <Tab.Panel>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {loading ? (
                                                        Array(3)
                                                            .fill(0)
                                                            .map((_, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="animate-pulse bg-gray-100 rounded-lg h-40"
                                                                ></div>
                                                            ))
                                                    ) : completedAchievements.length >
                                                      0 ? (
                                                        completedAchievements.map(
                                                            (achievement) => (
                                                                <AchievementCard
                                                                    key={
                                                                        achievement._id
                                                                    }
                                                                    achievement={
                                                                        achievement
                                                                    }
                                                                />
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="col-span-full text-center py-8">
                                                            <p className="text-gray-500">
                                                                You haven't
                                                                completed any
                                                                achievements
                                                                yet. Keep
                                                                participating!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Panel>

                                            {/* In Progress Achievements */}
                                            <Tab.Panel>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {loading ? (
                                                        Array(3)
                                                            .fill(0)
                                                            .map((_, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="animate-pulse bg-gray-100 rounded-lg h-40"
                                                                ></div>
                                                            ))
                                                    ) : inProgressAchievements.length >
                                                      0 ? (
                                                        inProgressAchievements.map(
                                                            (achievement) => (
                                                                <AchievementCard
                                                                    key={
                                                                        achievement._id
                                                                    }
                                                                    achievement={
                                                                        achievement
                                                                    }
                                                                />
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="col-span-full text-center py-8">
                                                            <p className="text-gray-500">
                                                                You've completed
                                                                all available
                                                                achievements!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Panel>

                                            {/* Category Tabs */}
                                            {Object.keys(
                                                achievementsByCategory
                                            ).map((category) => (
                                                <Tab.Panel key={category}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {loading
                                                            ? Array(3)
                                                                  .fill(0)
                                                                  .map(
                                                                      (
                                                                          _,
                                                                          index
                                                                      ) => (
                                                                          <div
                                                                              key={
                                                                                  index
                                                                              }
                                                                              className="animate-pulse bg-gray-100 rounded-lg h-40"
                                                                          ></div>
                                                                      )
                                                                  )
                                                            : achievementsByCategory[
                                                                  category
                                                              ].map(
                                                                  (
                                                                      achievement
                                                                  ) => (
                                                                      <AchievementCard
                                                                          key={
                                                                              achievement._id
                                                                          }
                                                                          achievement={
                                                                              achievement
                                                                          }
                                                                      />
                                                                  )
                                                              )}
                                                    </div>
                                                </Tab.Panel>
                                            ))}
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* Badges Panel */}
                    <Tab.Panel>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Your Badges
                                    </h2>
                                    <div className="text-sm text-gray-500">
                                        {badges.length} Badges Earned
                                    </div>
                                </div>

                                {/* Badge Categories */}
                                <div className="mt-4">
                                    <Tab.Group>
                                        <Tab.List className="flex space-x-1 overflow-x-auto pb-2">
                                            <Tab
                                                className={({ selected }) =>
                                                    `px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap
                                                    ${
                                                        selected
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`
                                                }
                                            >
                                                All ({badges.length})
                                            </Tab>
                                            <Tab
                                                className={({ selected }) =>
                                                    `px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap
                                                    ${
                                                        selected
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`
                                                }
                                            >
                                                Equipped (
                                                {
                                                    badges.filter(
                                                        (b) => b.isEquipped
                                                    ).length
                                                }
                                                )
                                            </Tab>
                                            {Object.keys(badgesByCategory).map(
                                                (category) => (
                                                    <Tab
                                                        key={category}
                                                        className={({
                                                            selected,
                                                        }) =>
                                                            `px-3 py-1.5 text-sm font-medium rounded-full capitalize whitespace-nowrap
                                                        ${
                                                            selected
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`
                                                        }
                                                    >
                                                        {category} (
                                                        {
                                                            badgesByCategory[
                                                                category
                                                            ].length
                                                        }
                                                        )
                                                    </Tab>
                                                )
                                            )}
                                        </Tab.List>

                                        <Tab.Panels className="mt-4">
                                            {/* All Badges */}
                                            <Tab.Panel>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {loading ? (
                                                        Array(6)
                                                            .fill(0)
                                                            .map((_, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="animate-pulse bg-gray-100 rounded-lg h-40"
                                                                ></div>
                                                            ))
                                                    ) : badges.length > 0 ? (
                                                        badges.map((badge) => (
                                                            <BadgeCard
                                                                key={badge._id}
                                                                badge={badge}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full text-center py-8">
                                                            <p className="text-gray-500">
                                                                You haven't
                                                                earned any
                                                                badges yet.
                                                                Complete
                                                                achievements to
                                                                unlock badges!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Panel>

                                            {/* Equipped Badges */}
                                            <Tab.Panel>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {loading ? (
                                                        Array(3)
                                                            .fill(0)
                                                            .map((_, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="animate-pulse bg-gray-100 rounded-lg h-40"
                                                                ></div>
                                                            ))
                                                    ) : badges.filter(
                                                          (b) => b.isEquipped
                                                      ).length > 0 ? (
                                                        badges
                                                            .filter(
                                                                (b) =>
                                                                    b.isEquipped
                                                            )
                                                            .map((badge) => (
                                                                <BadgeCard
                                                                    key={
                                                                        badge._id
                                                                    }
                                                                    badge={
                                                                        badge
                                                                    }
                                                                />
                                                            ))
                                                    ) : (
                                                        <div className="col-span-full text-center py-8">
                                                            <p className="text-gray-500">
                                                                You haven't
                                                                equipped any
                                                                badges yet.
                                                                Equip badges to
                                                                display them on
                                                                your profile!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Panel>

                                            {/* Category Tabs */}
                                            {Object.keys(badgesByCategory).map(
                                                (category) => (
                                                    <Tab.Panel key={category}>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {loading
                                                                ? Array(3)
                                                                      .fill(0)
                                                                      .map(
                                                                          (
                                                                              _,
                                                                              index
                                                                          ) => (
                                                                              <div
                                                                                  key={
                                                                                      index
                                                                                  }
                                                                                  className="animate-pulse bg-gray-100 rounded-lg h-40"
                                                                              ></div>
                                                                          )
                                                                      )
                                                                : badgesByCategory[
                                                                      category
                                                                  ].map(
                                                                      (
                                                                          badge
                                                                      ) => (
                                                                          <BadgeCard
                                                                              key={
                                                                                  badge._id
                                                                              }
                                                                              badge={
                                                                                  badge
                                                                              }
                                                                          />
                                                                      )
                                                                  )}
                                                        </div>
                                                    </Tab.Panel>
                                                )
                                            )}
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* Leaderboard Panel */}
                    <Tab.Panel>
                        <Leaderboard />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}

export default GamificationProfilePage
