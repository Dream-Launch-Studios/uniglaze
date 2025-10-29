import React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Type definitions for checkbox sizes
type CheckboxSize = "sm" | "default" | "lg";

// Checkbox component props interface
interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  className?: string;
  id?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  error?: string;
  size?: CheckboxSize;
}

// CheckboxGroup component props interface
interface CheckboxGroupProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  className?: string;
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      id,
      checked,
      indeterminate = false,
      disabled = false,
      required = false,
      label,
      description,
      error,
      size = "default",
      ...props
    },
    ref,
  ) => {
    // Generate unique ID if not provided
    const checkboxId =
      id ?? `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Size variants
    const sizeClasses: Record<CheckboxSize, string> = {
      sm: "h-4 w-4",
      default: "h-4 w-4",
      lg: "h-5 w-5",
    };

    return (
      <div className={cn("flex items-start space-x-2", className)}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            required={required}
            className="sr-only"
            {...props}
          />

          <label
            htmlFor={checkboxId}
            className={cn(
              "peer border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground shrink-0 cursor-pointer rounded-sm border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[size],
              checked && "bg-primary text-primary-foreground border-primary",
              indeterminate &&
                "bg-primary text-primary-foreground border-primary",
              error && "border-destructive",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {checked && !indeterminate && (
              <Check className="flex h-3 w-3 items-center justify-center text-current" />
            )}
            {indeterminate && (
              <Minus className="flex h-3 w-3 items-center justify-center text-current" />
            )}
          </label>
        </div>

        {(label ?? description ?? error) && (
          <div className="flex-1 space-y-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  error ? "text-destructive" : "text-foreground",
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </label>
            )}

            {description && !error && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

// Checkbox Group component
const CheckboxGroup = React.forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  (
    {
      className,
      children,
      label,
      description,
      error,
      required = false,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    return (
      <fieldset
        ref={ref}
        disabled={disabled}
        className={cn("space-y-3", className)}
        {...props}
      >
        {label && (
          <legend
            className={cn(
              "text-sm font-medium",
              error ? "text-destructive" : "text-foreground",
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </legend>
        )}

        {description && !error && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}

        <div className="space-y-2">{children}</div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </fieldset>
    );
  },
);

CheckboxGroup.displayName = "CheckboxGroup";

export { Checkbox, CheckboxGroup };
export type { CheckboxProps, CheckboxGroupProps };
