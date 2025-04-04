import { useState, useEffect } from "react"

/**
 * Custom hook for using localStorage with React state
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist in localStorage
 * @returns {Array} [storedValue, setValue] - State and setter function
 */
const useLocalStorage = (key, initialValue) => {
    // Get initial value from localStorage or use provided initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error)
            return initialValue
        }
    })

    // Update localStorage when state changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue))
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }, [key, storedValue])

    return [storedValue, setStoredValue]
}

export default useLocalStorage
