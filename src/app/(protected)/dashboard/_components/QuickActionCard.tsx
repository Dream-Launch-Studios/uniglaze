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
    return "border-border bg-card";
  };

  const getTypeButtonVariant = (type: ActionType): ButtonVariant => {
    return "default";
  };

  return (
    <div
      className={`bg-card border-border transition-smooth hover:border-primary/30 rounded-lg border p-6`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
            <Icon
              name={action.icon}
              size={20}
              color="var(--color-primary)"
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
            <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">
              {action.badge.count}
            </span>
            <span className="text-text-secondary text-xs">
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
      </div>
    </div>
  );
};

export default QuickActionCard;
