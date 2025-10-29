"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../../components/rocket/components/AppIcon";
import Button from "../../../../components/rocket/components/ui/Button";
import type * as LucideIcons from "lucide-react";

type ActionType = "primary" | "success" | "warning" | "accent";

interface ActionBadge {
  count: number;
  label: string;
}

interface QuickAction {
  type: ActionType;
  icon: keyof typeof LucideIcons;
  title: string;
  description: string;
  badge?: ActionBadge;
  route: string;
  buttonText: string;
}

interface QuickActionCardProps {
  action: QuickAction;
}

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "success"
  | "warning"
  | "danger";

const QuickActionCard: React.FC<QuickActionCardProps> = ({ action }) => {
  const router = useRouter();

  const getTypeColor = (type: ActionType): string => {
    switch (type) {
      case "primary":
        return "border-primary/20 bg-primary/5";
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "accent":
        return "border-accent/20 bg-accent/5";
      default:
        return "border-border bg-muted";
    }
  };

  const getTypeButtonVariant = (type: ActionType): ButtonVariant => {
    switch (type) {
      case "primary":
        return "default";
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "accent":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div
      className={`card border-2 ${getTypeColor(action.type)} transition-smooth hover:elevation-2 p-6`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              action.type === "primary"
                ? "bg-primary/10"
                : action.type === "success"
                  ? "bg-success/10"
                  : action.type === "warning"
                    ? "bg-warning/10"
                    : action.type === "accent"
                      ? "bg-accent/10"
                      : "bg-muted"
            }`}
          >
            <Icon
              name={action.icon}
              size={20}
              color={`var(--color-${action.type === "accent" ? "accent" : action.type})`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary mb-1 text-lg font-semibold tracking-tight">
              {action.title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>
        {action.badge && (
          <div className="flex items-center space-x-1">
            <span className="bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs font-semibold shadow-sm">
              {action.badge.count}
            </span>
            <span className="text-text-secondary text-xs font-medium">
              {action.badge.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant={getTypeButtonVariant(action.type)}
          size="sm"
          onClick={() => router.push(action.route)}
          className="transition-smooth"
        >
          {action.buttonText}
        </Button>

        {/* <div className="flex items-center space-x-2">
          <span className="text-text-secondary text-xs font-medium">
            Quick access
          </span>
          <Icon
            name="ArrowRight"
            size={14}
            color="var(--color-text-secondary)"
          />
        </div> */}
      </div>
    </div>
  );
};

export default QuickActionCard;
