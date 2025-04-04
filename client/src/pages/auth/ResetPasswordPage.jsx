import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ShoppingBagIcon } from "@heroicons/react/24/outline"
import { resetPassword } from "../../api/authService"

const ResetPasswordPage = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [apiError, setApiError] = useState("")
    const { token } = useParams()
    const navigate = useNavigate()

    const password = watch("newPassword", "")

    const onSubmit = async (data) => {
        setApiError("")
        setIsSubmitting(true)

        try {
            await resetPassword(token, data.newPassword)
            setSuccess(true)

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login")
            }, 3000)
        } catch (error) {
            console.error("Password reset error:", error)
            setApiError(
                error.message || "Failed to reset password. Please try again."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <ShoppingBagIcon className="h-12 w-12 text-primary-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create new password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your new password below
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {success ? (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">
                                        Your password has been reset
                                        successfully!
                                    </p>
                                    <p className="mt-2 text-sm text-green-700">
                                        You will be redirected to the login page
                                        in a few seconds.
                                    </p>
                                    <p className="mt-4">
                                        <Link
                                            to="/login"
                                            className="font-medium text-primary-600 hover:text-primary-500"
                                        >
                                            Go to login
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {apiError && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                {apiError}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form
                                className="space-y-6"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        New Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="newPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            className={`appearance-none block w-full px-3 py-2 border ${
                                                errors.newPassword
                                                    ? "border-red-300"
                                                    : "border-gray-300"
                                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                            {...register("newPassword", {
                                                required:
                                                    "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message:
                                                        "Password must be at least 6 characters",
                                                },
                                            })}
                                        />
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.newPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            className={`appearance-none block w-full px-3 py-2 border ${
                                                errors.confirmPassword
                                                    ? "border-red-300"
                                                    : "border-gray-300"
                                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                            {...register("confirmPassword", {
                                                required:
                                                    "Please confirm your password",
                                                validate: (value) =>
                                                    value === password ||
                                                    "Passwords do not match",
                                            })}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Resetting...
                                            </span>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
