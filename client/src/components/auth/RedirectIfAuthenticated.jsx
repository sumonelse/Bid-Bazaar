import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const RedirectIfAuthenticated = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // Redirect to home if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    // Render children if not authenticated
    return children
}

export default RedirectIfAuthenticated
