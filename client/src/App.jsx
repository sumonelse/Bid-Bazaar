import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { BidProvider } from "./context/BidContext"
import MainLayout from "./components/layout/MainLayout"
import ProtectedRoute from "./components/auth/ProtectedRoute"

// Pages
import HomePage from "./pages/HomePage"
import AuctionsPage from "./pages/AuctionsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import CreateListingPage from "./pages/CreateListingPage"
import NotificationsPage from "./pages/NotificationsPage"
import ProfilePage from "./pages/ProfilePage"
import AboutPage from "./pages/AboutPage"
import NotFoundPage from "./pages/NotFoundPage"

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <BidProvider>
                        <Routes>
                            {/* Auth routes */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/register"
                                element={<RegisterPage />}
                            />

                            {/* Main layout routes */}
                            <Route element={<MainLayout />}>
                                <Route path="/" element={<HomePage />} />
                                <Route
                                    path="/auctions"
                                    element={<AuctionsPage />}
                                />
                                <Route
                                    path="/product/:id"
                                    element={<ProductDetailPage />}
                                />
                                <Route path="/about" element={<AboutPage />} />

                                {/* Protected routes */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/create-listing"
                                    element={
                                        <ProtectedRoute>
                                            <CreateListingPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/notifications"
                                    element={
                                        <ProtectedRoute>
                                            <NotificationsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <ProfilePage />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* 404 route */}
                                <Route path="*" element={<NotFoundPage />} />
                            </Route>
                        </Routes>
                    </BidProvider>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
