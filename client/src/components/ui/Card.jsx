import React from "react"

const Card = ({
    children,
    className = "",
    hover = false,
    shadow = "md",
    padding = "md",
    rounded = "lg",
    border = true,
    ...props
}) => {
    // Base classes
    const baseClasses = "bg-white overflow-hidden"

    // Shadow classes
    const shadowClasses = {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
    }

    // Padding classes
    const paddingClasses = {
        none: "p-0",
        sm: "p-3",
        md: "p-4 sm:p-6",
        lg: "p-6 sm:p-8",
    }

    // Rounded classes
    const roundedClasses = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
    }

    // Border class
    const borderClass = border ? "border border-gray-100" : ""

    // Hover class
    const hoverClass = hover
        ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        : ""

    // Combine all classes
    const classes = `${baseClasses} ${shadowClasses[shadow]} ${paddingClasses[padding]} ${roundedClasses[rounded]} ${borderClass} ${hoverClass} ${className}`

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    )
}

export default Card
