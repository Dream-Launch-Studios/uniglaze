import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type * as LucideIcons from "lucide-react";

import Icon from "../AppIcon";

const buttonVariants = cva("btn-clean", {
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      outline:
        "border border-border bg-transparent hover:bg-muted hover:text-text-primary",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
      ghost: "hover:bg-muted hover:text-text-primary",
      link: "text-primary underline-offset-4 hover:underline",
      success:
        "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
      warning:
        "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm",
      danger: "bg-error text-error-foreground hover:bg-error/90 shadow-sm",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 py-1.5 text-sm",
      lg: "h-11 px-6 py-2.5 text-base",
      icon: "h-10 w-10",
      xs: "h-7 px-2.5 py-1 text-xs",
      xl: "h-12 px-8 py-3 text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  iconName?: keyof typeof LucideIcons | null;
  iconPosition?: "left" | "right";
  iconSize?: number | null;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      loading = false,
      iconName = null,
      iconPosition = "left",
      iconSize = null,
      fullWidth = false,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    // Icon size mapping based on button size
    const iconSizeMap: Record<NonNullable<typeof size>, number> = {
      xs: 12,
      sm: 14,
      default: 16,
      lg: 18,
      xl: 20,
      icon: 16,
    };

    const calculatedIconSize = iconSize ?? iconSizeMap[size ?? "default"] ?? 16;

    // Loading spinner
    const LoadingSpinner = () => (
      <svg
        className="mr-2 -ml-1 h-4 w-4 animate-spin"
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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Icon rendering
    const renderIcon = () => {
      if (!iconName) return null;

      return (
        <Icon
          name={iconName}
          size={calculatedIconSize}
          className={cn(
            children && iconPosition === "left" && "mr-2",
            children && iconPosition === "right" && "ml-2",
          )}
        />
      );
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {iconName && iconPosition === "left" && renderIcon()}
        {children}
        {iconName && iconPosition === "right" && renderIcon()}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export default Button;
