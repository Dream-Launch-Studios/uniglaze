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
    return {
      name: type === "approval" ? "CheckCircle" : type === "alert" ? "AlertTriangle" : type === "info" ? "Info" : type === "report" ? "FileText" : "Bell",
      color: "var(--color-primary)",
      bg: "bg-primary/5",
    };
  };

  const getPriorityColor = (priority: string): string => {
    return "border-l-primary/20";
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
    <div className="bg-card border-border rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-text-primary text-lg font-semibold tracking-tight">
            Notifications
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification: Notification, index) => {
          const icon = getNotificationIcon(notification.type);

          return (
            <div
              key={index}
              className={`transition-smooth hover:bg-muted/50 rounded-lg border-l-2 p-3 ${getPriorityColor(notification.priority)}`}
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
                    <span className="text-text-secondary ml-2 flex-shrink-0 text-xs">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>

                  <p className="text-text-secondary mb-2 text-sm leading-relaxed">
                    {notification.message}
                  </p>

                  {notification.projectName && (
                    <div className="mb-2">
                      <span className="bg-primary/5 text-primary rounded-md px-2 py-1 text-xs font-medium">
                        {notification.projectName}
                      </span>
                    </div>
                  )}
                </div>
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
    </div>
  );
};

export default NotificationPanel;
