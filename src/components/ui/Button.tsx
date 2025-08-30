import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon: Icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 active:scale-95";

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-500/50 shadow-lg hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 focus:ring-gray-500/50 shadow-md hover:shadow-lg",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white focus:ring-red-500/50 shadow-lg hover:shadow-xl",
    ghost: "bg-transparent hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-gray-700 hover:text-blue-600 focus:ring-gray-500/50",
    outline:
      "border-2 border-gray-300 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600 focus:ring-gray-500/50 shadow-sm hover:shadow-md",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed transform-none hover:scale-100" : ""
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
      ) : Icon ? (
        <Icon className="h-5 w-5 mr-2" />
      ) : null}
      {children}
    </button>
  );
}
