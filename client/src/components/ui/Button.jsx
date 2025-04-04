import React from "react"
import { Link } from "react-router-dom"

const Button = ({
    children,
    variant = "primary",
    size = "md",
    className = "",
    to,
    href,
    disabled = false,
    fullWidth = false,
    type = "button",
    onClick,
    ...props
}) => {
    // Base classes
    const baseClasses =
        "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

    // Size classes
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    }

    // Variant classes
    const variantClasses = {
        primary:
            "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow",
        secondary:
            "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-sm hover:shadow",
        accent: "bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 shadow-sm hover:shadow",
        success:
            "bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-sm hover:shadow",
        danger: "bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 shadow-sm hover:shadow",
        outline:
            "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    }

    // Disabled classes
    const disabledClasses = disabled
        ? "opacity-50 cursor-not-allowed pointer-events-none"
        : ""

    // Full width class
    const widthClass = fullWidth ? "w-full" : ""

    // Combine all classes
    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${widthClass} ${className}`

    // Render as Link if 'to' prop is provided
    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        )
    }

    // Render as anchor if 'href' prop is provided
    if (href) {
        return (
            <a href={href} className={classes} {...props}>
                {children}
            </a>
        )
    }

    // Otherwise render as button
    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
