import React from "react";
import Icon from "../../../../components/rocket/components/AppIcon";
import type * as LucideIcons from "lucide-react";
interface Notification {
  id: string | number;
  type: string;
  priority: string;
  title: string;
  message: string;
  timestamp: Date;
  projectName?: string;
  // read: boolean;
  // actionRequired?: boolean;
  // actionText?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "approval":
        return {
          name: "CheckCircle",
          color: "var(--color-warning)",
          bg: "bg-warning/10",
        };
      case "alert":
        return {
          name: "AlertTriangle",
          color: "var(--color-error)",
          bg: "bg-error/10",
        };
      case "info":
        return {
          name: "Info",
          color: "var(--color-primary)",
          bg: "bg-primary/10",
        };
      case "report":
        return {
          name: "FileText",
          color: "var(--color-success)",
          bg: "bg-success/10",
        };
      default:
        return {
          name: "Bell",
          color: "var(--color-text-secondary)",
          bg: "bg-muted",
        };
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "border-l-error";
      case "medium":
        return "border-l-warning";
      case "low":
        return "border-l-success";
      default:
        return "border-l-border";
    }
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  };

  // const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-text-primary text-lg font-semibold tracking-tight">
            Notifications
          </h3>
          {/* {unreadCount > 0 && (
            <span className="bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs font-semibold shadow-sm">
              {unreadCount}
            </span>
          )} */}
        </div>
        {/* <button className="text-primary hover:text-primary/80 transition-smooth text-sm font-medium">
          Mark all read
          View All
        </button> */}
      </div>

      <div className="space-y-3">
        {notifications.map((notification: Notification, index) => {
          const icon = getNotificationIcon(notification.type);

          return (
            <div
              key={index}
              // className={`transition-smooth hover:elevation-1 rounded-lg border-l-4 p-3 ${
              className={`transition-smooth hover:elevation-1 rounded-lg p-3 ${
                // notification.read ? "bg-muted/30" : "bg-surface"
                "bg-surface"
              } ${getPriorityColor(notification.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${icon.bg}`}
                >
                  <Icon
                    name={icon.name as keyof typeof LucideIcons}
                    size={16}
                    color={icon.color}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="text-text-primary truncate text-sm font-semibold">
                      {notification.title}
                    </h4>
                    <span className="text-text-secondary ml-2 flex-shrink-0 text-xs font-medium">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>

                  <p className="text-text-secondary mb-2 text-sm leading-relaxed">
                    {notification.message}
                  </p>

                  {/* Project name badge */}
                  {notification.projectName && (
                    <div className="mb-2">
                      <span className="text-primary bg-primary/10 rounded-full px-2 py-1 text-xs font-medium">
                        📋 {notification.projectName}
                      </span>
                    </div>
                  )}

                  {/* {notification.actionRequired && notification.actionText && (
                    <Button variant="outline" size="xs" className="mt-2">
                      {notification.actionText}
                    </Button>
                  )} */}
                </div>

                {/* {!notification.read && (
                  <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                )} */}
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="py-8 text-center">
          <Icon
            name="Bell"
            size={48}
            color="var(--color-text-secondary)"
            className="mx-auto mb-3 opacity-50"
          />
          <p className="text-text-secondary text-sm">No notifications</p>
        </div>
      )}

      {/* {notifications.length > 0 && (
        <div className="border-border mt-4 border-t pt-4">
          <Button variant="ghost" size="sm" className="w-full">
            View All Notifications
          </Button>
        </div>
      )} */}
    </div>
  );
};

export default NotificationPanel;
