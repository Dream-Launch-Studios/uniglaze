import React from "react";
import { cn } from "@/lib/utils";

type InputSize = "sm" | "default" | "lg";
type IconPosition = "left" | "right";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string | boolean;
  success?: string | boolean;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  size?: InputSize;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      error = false,
      success = false,
      icon = null,
      iconPosition = "left",
      fullWidth = false,
      size = "default",
      ...props
    },
    ref,
  ) => {
    const inputSizes: Record<InputSize, string> = {
      sm: "h-8 px-3 text-sm",
      default: "h-10 px-3",
      lg: "h-12 px-4 text-base",
    };

    const iconSizes: Record<InputSize, number> = {
      sm: 16,
      default: 18,
      lg: 20,
    };

    const getInputStyles = (): string[] => {
      const styles: string[] = [
        "flex w-full rounded-lg border bg-input text-input-foreground transition-smooth",
        "placeholder:text-muted-foreground",
        "focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        inputSizes[size],
        fullWidth && "w-full",
      ].filter(Boolean) as string[];

      if (error) {
        styles.push("border-error focus:border-error focus:ring-error/20");
      } else if (success) {
        styles.push(
          "border-success focus:border-success focus:ring-success/20",
        );
      } else {
        styles.push("border-border focus:border-ring");
      }

      if (icon) {
        if (iconPosition === "left") {
          styles.push("pl-10");
        } else {
          styles.push("pr-10");
        }
      }

      return styles;
    };

    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {icon && iconPosition === "left" && (
          <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform">
            {icon}
          </div>
        )}

        <input
          type={type}
          className={cn(getInputStyles(), className)}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          ref={ref}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform">
            {icon}
          </div>
        )}

        {error && typeof error === "string" && (
          <p className="text-error mt-1 text-xs font-medium">{error}</p>
        )}

        {success && typeof success === "string" && (
          <p className="text-success mt-1 text-xs font-medium">{success}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
export type { InputProps };
