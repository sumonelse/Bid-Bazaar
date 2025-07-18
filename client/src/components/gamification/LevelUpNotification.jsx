import { useEffect, useState } from "react"
import confetti from "canvas-confetti"

const LevelUpNotification = ({ level, coins, title, onClose }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Animate in
        setTimeout(() => {
            setIsVisible(true)

            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            })
        }, 100)

        // Auto close after 7 seconds
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 500) // Wait for animation to complete
        }, 7000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${
                        isVisible ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                ></div>

                <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                >
                    &#8203;
                </span>

                <div
                    className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                        isVisible
                            ? "opacity-100 translate-y-0 sm:scale-100"
                            : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    }`}
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 sm:mx-0 sm:h-12 sm:w-12">
                                <span className="text-2xl">🎉</span>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3
                                    className="text-lg leading-6 font-medium text-gray-900"
                                    id="modal-title"
                                >
                                    Level Up!
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Congratulations! You've reached{" "}
                                        <span className="font-bold text-blue-600">
                                            Level {level}
                                        </span>
                                    </p>

                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    New Title:
                                                </p>
                                                <p className="text-sm text-blue-600">
                                                    {title}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Bonus:
                                                </p>
                                                <p className="text-sm text-amber-600">
                                                    +{coins} Coins
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm text-gray-500">
                                        Keep up the good work! New achievements
                                        and badges are waiting for you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => {
                                setIsVisible(false)
                                setTimeout(onClose, 500)
                            }}
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LevelUpNotification
