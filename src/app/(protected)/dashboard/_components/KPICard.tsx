import React from "react";
import Icon from "../../../../components/rocket/components/AppIcon";
import type * as LucideIcons from "lucide-react";

type TrendType = "up" | "down" | "neutral";

interface KPIData {
  title: string;
  value: string;
  trend: TrendType;
  change: string;
  icon: keyof typeof LucideIcons;
  progress: number | null;
  // target: string;
  period: string;
}

interface KPICardProps {
  kpi: KPIData;
}

const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const getTrendColor = (trend: TrendType): string => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-error";
      default:
        return "text-text-secondary";
    }
  };

  const getTrendIcon = (trend: TrendType): keyof typeof LucideIcons => {
    switch (trend) {
      case "up":
        return "TrendingUp";
      case "down":
        return "TrendingDown";
      default:
        return "Minus";
    }
  };

  return (
    <div className="card transition-smooth hover:elevation-2 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-text-secondary mb-1 text-sm font-medium">
            {kpi.title}
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-text-primary text-2xl font-bold tracking-tight">
              {kpi.value}
            </span>
            <span
              className={`flex items-center text-sm font-medium ${getTrendColor(kpi.trend)}`}
            >
              <Icon name={getTrendIcon(kpi.trend)} size={14} className="mr-1" />
              {kpi.change}
            </span>
          </div>
        </div>
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <Icon name={kpi.icon} size={20} color="var(--color-primary)" />
        </div>
      </div>

      {kpi.progress !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Progress</span>
            <span className="text-text-primary font-semibold">
              {kpi.progress}%
            </span>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${kpi.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            {/* <span className="text-text-secondary">Target: {kpi.target}</span> */}
            <span className="text-text-secondary">{kpi.period}</span>
          </div>
        </div>
      )}

      {kpi.progress === null && (
        <div className="flex items-center justify-between text-xs">
          {/* <span className="text-text-secondary font-medium">
            Target: {kpi.target}
          </span> */}
          <span className="text-text-secondary">{kpi.period}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
