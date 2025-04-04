import { useState, useEffect } from "react"

/**
 * Custom hook for countdown timer
 * @param {Date|string} targetDate - Target date to count down to
 * @param {Function} onComplete - Callback function to execute when countdown completes
 * @returns {Object} Countdown state with days, hours, minutes, seconds, and isComplete
 */
const useCountdown = (targetDate, onComplete) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date()

        if (difference <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isComplete: true,
            }
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            isComplete: false,
        }
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

    useEffect(() => {
        // Reset timer if target date changes
        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft()
            setTimeLeft(newTimeLeft)

            if (newTimeLeft.isComplete && onComplete) {
                onComplete()
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate, onComplete])

    return timeLeft
}

export default useCountdown
