import React from "react";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";

interface ArchiveStatsData {
  totalProjects: number;
  completedProjects: number;
  totalValue: number;
  avgCompletion: number;
  totalReports: number;
  totalPhotos: number;
}

interface ArchiveStatsProps {
  stats: ArchiveStatsData;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: IconName;
  color: string;
  bgColor: string;
  change: string;
  changeType: "positive" | "negative";
}

const ArchiveStats: React.FC<ArchiveStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards: StatCard[] = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: "FolderOpen",
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      icon: "CheckCircle",
      color: "text-success",
      bgColor: "bg-success/10",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Total Value",
      value: formatCurrency(stats.totalValue),
      icon: "IndianRupee",
      color: "text-accent",
      bgColor: "bg-accent/10",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Avg. Completion",
      value: `${stats.avgCompletion}%`,
      icon: "TrendingUp",
      color: "text-warning",
      bgColor: "bg-warning/10",
      change: "+3%",
      changeType: "positive",
    },
    {
      title: "Total Reports",
      value: stats.totalReports,
      icon: "FileText",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      change: "+25%",
      changeType: "positive",
    },
    {
      title: "Photos Archived",
      value: stats.totalPhotos,
      icon: "Camera",
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+18%",
      changeType: "positive",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-card border-border hover:elevation-1 transition-smooth rounded-lg border p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div
              className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
            >
              <Icon name={stat.icon} size={20} className={stat.color} />
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                stat.changeType === "positive"
                  ? "text-success bg-success/10"
                  : "text-error bg-error/10"
              }`}
            >
              {stat.change}
            </span>
          </div>

          <div>
            <p className="text-text-primary mb-1 text-2xl font-bold">
              {stat.value}
            </p>
            <p className="text-text-secondary text-sm">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArchiveStats;
