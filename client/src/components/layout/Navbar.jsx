import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useNotifications } from "../../context/NotificationContext"
import NotificationDropdown from "../notifications/NotificationDropdown"
import {
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    UserCircleIcon,
    ShoppingBagIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const { isAuthenticated, currentUser, logout } = useAuth()
    const { unreadCount } = useNotifications()
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery("")
        }
    }

    const handleLogout = () => {
        logout()
        navigate("/")
        setIsMenuOpen(false)
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and main navigation */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center">
                                <ShoppingBagIcon className="h-8 w-8 text-primary-600" />
                                <span className="ml-2 text-xl font-heading font-bold text-gray-900">
                                    BidBazaar
                                </span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-primary-500 hover:text-gray-700"
                            >
                                Home
                            </Link>
                            <Link
                                to="/categories"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-primary-500 hover:text-gray-700"
                            >
                                Categories
                            </Link>
                            <Link
                                to="/auctions"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-primary-500 hover:text-gray-700"
                            >
                                Auctions
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-primary-500 hover:text-gray-700"
                            >
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
                        <div className="max-w-lg w-full lg:max-w-xs">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </form>
                        </div>
                    </div>

                    {/* Right navigation */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications Dropdown */}
                                <NotificationDropdown />

                                {/* User dropdown */}
                                <div className="ml-3 relative group">
                                    <div>
                                        <button
                                            type="button"
                                            className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            id="user-menu-button"
                                        >
                                            <span className="sr-only">
                                                Open user menu
                                            </span>
                                            {currentUser?.profileImage ? (
                                                <img
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    src={
                                                        currentUser.profileImage
                                                    }
                                                    alt={currentUser.name}
                                                />
                                            ) : (
                                                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            to="/my-bids"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            My Bids
                                        </Link>
                                        <Link
                                            to="/my-listings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            My Listings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Sign in
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">
                                {isMenuOpen ? "Close menu" : "Open menu"}
                            </span>
                            {isMenuOpen ? (
                                <XMarkIcon
                                    className="block h-6 w-6"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Bars3Icon
                                    className="block h-6 w-6"
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/categories"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Categories
                        </Link>
                        <Link
                            to="/auctions"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Auctions
                        </Link>
                        <Link
                            to="/about"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                    </div>

                    {isAuthenticated ? (
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    {currentUser?.profileImage ? (
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={currentUser.profileImage}
                                            alt={currentUser.name}
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">
                                        {currentUser?.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500">
                                        {currentUser?.email}
                                    </div>
                                </div>
                                <Link
                                    to="/notifications"
                                    className="ml-auto flex-shrink-0 relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <BellIcon
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                    />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center transform -translate-y-1/2 translate-x-1/2 animate-pulse">
                                            {unreadCount > 9
                                                ? "9+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                            <div className="mt-3 space-y-1">
                                <Link
                                    to="/dashboard"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/my-bids"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Bids
                                </Link>
                                <Link
                                    to="/my-listings"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Listings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex items-center justify-around">
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-700 px-4 py-2 text-base font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar
