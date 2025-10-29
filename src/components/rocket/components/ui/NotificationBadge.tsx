import React from "react";

type Variant = "default" | "success" | "warning" | "error" | "primary";
type Size = "sm" | "default" | "lg";

interface NotificationBadgeProps {
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  maxCount = 99,
  showZero = false,
  variant = "default",
  size = "default",
  className = "",
}) => {
  if (!showZero && count === 0) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const variantClasses: Record<Variant, string> = {
    default: "bg-accent text-accent-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    error: "bg-error text-error-foreground",
    primary: "bg-primary text-primary-foreground",
  };

  const sizeClasses: Record<Size, string> = {
    sm: "text-xs px-1.5 py-0.5 min-w-[16px] h-4",
    default: "text-xs px-2 py-0.5 min-w-[20px] h-5",
    lg: "text-sm px-2.5 py-1 min-w-[24px] h-6",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${className} `}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;
