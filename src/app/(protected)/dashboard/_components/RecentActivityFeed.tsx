import React from "react";
import type * as LucideIcons from "lucide-react";
import Icon from "@/components/rocket/components/AppIcon";

type ActivityType =
  | "report_submitted"
  | "photo_uploaded"
  | "approval_pending"
  | "blockage_reported"
  | "project_created";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  project: string;
  timestamp: Date;
}

interface ActivityIconConfig {
  name: keyof typeof LucideIcons;
  color: string;
  bg: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
}) => {
  const getActivityIcon = (type: ActivityType): ActivityIconConfig => {
    return {
      name: type === "report_submitted" ? "FileText" : type === "photo_uploaded" ? "Camera" : type === "approval_pending" ? "Clock" : type === "blockage_reported" ? "AlertTriangle" : "Plus",
      color: "var(--color-primary)",
      bg: "bg-primary/5",
    };
  };

  const formatTimeAgo = (timestamp: Date): string => {
    // Ensure timestamp is a Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="bg-card border-border rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-semibold tracking-tight">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const icon = getActivityIcon(activity.type);

          return (
            <div
              key={activity.id.toString() + index.toString()}
              className="group flex items-start space-x-3"
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${icon.bg}`}
              >
                <Icon name={icon.name} size={16} color={icon.color} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between">
                  <h4 className="text-text-primary truncate text-sm font-semibold">
                    {activity.title}
                  </h4>
                  <span className="text-text-secondary ml-2 flex-shrink-0 text-xs">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>

                <p className="text-text-secondary mb-1 text-sm leading-relaxed">
                  {activity.description}
                </p>

                <div className="flex items-center space-x-2">
                  <span className="bg-primary/5 text-primary rounded-md px-2 py-1 text-xs font-medium">
                    {activity.project}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="py-8 text-center">
          <Icon
            name="Inbox"
            size={48}
            color="var(--color-text-secondary)"
            className="mx-auto mb-3 opacity-50"
          />
          <p className="text-text-secondary text-sm">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
