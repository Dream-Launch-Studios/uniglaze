// components/ui/Select.tsx - Shadcn style Select
import React, { useState, useRef, useEffect } from "react";
import Icon from "../AppIcon";
import { cn } from "@/lib/utils";

type SelectSize = "sm" | "default" | "lg";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "size" | "onChange"
  > {
  className?: string;
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | boolean;
  success?: string | boolean;
  fullWidth?: boolean;
  size?: SelectSize;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      options = [],
      value,
      onChange,
      placeholder = "Select an option",
      disabled = false,
      error = false,
      success = false,
      fullWidth = false,
      size = "default",
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
      null,
    );
    const selectRef = useRef<HTMLDivElement>(null);

    const selectSizes: Record<SelectSize, string> = {
      sm: "h-8 px-3 text-sm",
      default: "h-10 px-3",
      lg: "h-12 px-4 text-base",
    };

    useEffect(() => {
      if (value) {
        const option = options.find((opt) => opt.value === value);
        setSelectedOption(option ?? null);
      } else {
        setSelectedOption(null);
      }
    }, [value, options]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: SelectOption) => {
      setSelectedOption(option);
      setIsOpen(false);
      if (onChange) {
        onChange(option.value);
      }
    };

    const getSelectStyles = (): string[] => {
      const styles = [
        "flex w-full items-center justify-between rounded-lg border bg-input text-input-foreground transition-smooth cursor-pointer",
        "focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selectSizes[size],
        ...(fullWidth ? ["w-full"] : []),
      ];

      if (error) {
        styles.push("border-error focus:border-error focus:ring-error/20");
      } else if (success) {
        styles.push(
          "border-success focus:border-success focus:ring-success/20",
        );
      } else {
        styles.push("border-border focus:border-ring");
      }

      return styles;
    };

    return (
      <div className={cn("relative", fullWidth && "w-full")} ref={selectRef}>
        <button
          type="button"
          className={cn(getSelectStyles(), className)}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              "truncate",
              !selectedOption && "text-muted-foreground",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <Icon
            name={isOpen ? "ChevronUp" : "ChevronDown"}
            size={16}
            color="var(--color-text-secondary)"
            className={cn(
              "transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {isOpen && (
          <div className="bg-popover border-border elevation-3 absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "transition-smooth hover:bg-muted w-full px-3 py-2 text-left text-sm",
                  "focus:bg-muted focus-ring",
                  selectedOption?.value === option.value &&
                    "bg-primary/10 text-primary font-medium",
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            ))}
            {options.length === 0 && (
              <div className="text-text-secondary px-3 py-2 text-sm">
                No options available
              </div>
            )}
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

Select.displayName = "Select";

export default Select;
export type { SelectProps, SelectOption, SelectSize };
