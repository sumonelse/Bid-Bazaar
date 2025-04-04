import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { BidProvider } from "./context/BidContext"
import { GamificationProvider } from "./context/GamificationContext"
import MainLayout from "./components/layout/MainLayout"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import RedirectIfAuthenticated from "./components/auth/RedirectIfAuthenticated"
import GamificationNotifications from "./components/gamification/GamificationNotifications"

// Pages
import HomePage from "./pages/HomePage"
import AuctionsPage from "./pages/AuctionsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import CreateListingPage from "./pages/CreateListingPage"
import NotificationsPage from "./pages/NotificationsPage"
import ProfilePage from "./pages/ProfilePage"
import GamificationProfilePage from "./pages/GamificationProfilePage"
import AboutPage from "./pages/AboutPage"
import NotFoundPage from "./pages/NotFoundPage"

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <BidProvider>
                        <GamificationProvider>
                            <GamificationNotifications />
                            <Routes>
                                {/* Auth routes - redirect if already logged in */}
                                <Route
                                    path="/login"
                                    element={
                                        <RedirectIfAuthenticated>
                                            <LoginPage />
                                        </RedirectIfAuthenticated>
                                    }
                                />
                                <Route
                                    path="/register"
                                    element={
                                        <RedirectIfAuthenticated>
                                            <RegisterPage />
                                        </RedirectIfAuthenticated>
                                    }
                                />
                                <Route
                                    path="/forgot-password"
                                    element={
                                        <RedirectIfAuthenticated>
                                            <ForgotPasswordPage />
                                        </RedirectIfAuthenticated>
                                    }
                                />
                                <Route
                                    path="/reset-password/:token"
                                    element={
                                        <RedirectIfAuthenticated>
                                            <ResetPasswordPage />
                                        </RedirectIfAuthenticated>
                                    }
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
                                    <Route
                                        path="/about"
                                        element={<AboutPage />}
                                    />

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
                                    <Route
                                        path="/achievements"
                                        element={
                                            <ProtectedRoute>
                                                <GamificationProfilePage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* 404 route */}
                                    <Route
                                        path="*"
                                        element={<NotFoundPage />}
                                    />
                                </Route>
                            </Routes>
                        </GamificationProvider>
                    </BidProvider>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
