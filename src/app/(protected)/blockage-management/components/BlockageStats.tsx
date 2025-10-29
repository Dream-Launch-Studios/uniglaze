import React from "react";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";

interface Blockage {
  id: string | number;
  title: string;
  description: string;
  project: string;
  location: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "client" | "internal" | "supplier" | "weather";
  status: "open" | "in-progress" | "pending-approval" | "resolved" | "closed";
  createdAt: string | Date;
  clientVisible: boolean;
  assignedTo: string;
  priority: boolean;
  commentsCount?: number;
}

interface BlockageStatsProps {
  blockages: Blockage[];
}

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  overdue: number;
}

interface StatCard {
  label: string;
  value: number;
  icon: IconName;
  color: string;
  bgColor: string;
}

const BlockageStats: React.FC<BlockageStatsProps> = ({ blockages }) => {
  const calculateStats = (): Stats => {
    const total = blockages.length;
    const open = blockages.filter((b) => b.status === "open").length;
    const inProgress = blockages.filter(
      (b) => b.status === "in-progress",
    ).length;
    const resolved = blockages.filter((b) => b.status === "resolved").length;
    const critical = blockages.filter((b) => b.severity === "critical").length;
    const overdue = blockages.filter((b) => {
      const createdDate =
        b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      const days = Math.ceil(
        (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return days > 7 && b.status !== "resolved" && b.status !== "closed";
    }).length;

    return { total, open, inProgress, resolved, critical, overdue };
  };

  const stats = calculateStats();

  const statCards: StatCard[] = [
    {
      label: "Total Active",
      value: stats.total,
      icon: "AlertTriangle",
      color: "text-text-primary",
      bgColor: "bg-muted",
    },
    {
      label: "Open",
      value: stats.open,
      icon: "Circle",
      color: "text-error",
      bgColor: "bg-error/10",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: "Clock",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: "CheckCircle",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Critical",
      value: stats.critical,
      icon: "AlertCircle",
      color: "text-error",
      bgColor: "bg-error/10",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: "Clock",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-card border-border rounded-lg border p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <Icon name={stat.icon} size={16} className={stat.color} />
            </div>
            <span className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
          <p className="text-text-secondary text-sm font-medium">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BlockageStats;
