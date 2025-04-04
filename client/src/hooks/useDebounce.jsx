import { useState, useEffect } from "react"

/**
 * Custom hook for debouncing a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        // Update debounced value after specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Cancel the timeout if value changes or component unmounts
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export default useDebounce
