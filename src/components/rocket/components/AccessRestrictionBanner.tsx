import React from "react";
import Icon from "./AppIcon";
import type * as LucideIcons from "lucide-react";

interface AccessRestrictionBannerProps {
  title?: string;
  message?: string;
  type?: "error" | "warning" | "info" | "default";
  showIcon?: boolean;
}

interface BannerStyles {
  container: string;
  icon: keyof typeof LucideIcons;
  iconColor: string;
}

const AccessRestrictionBanner: React.FC<AccessRestrictionBannerProps> = ({
  title = "Access Restricted",
  message = "You don't have permission to access this feature.",
  type = "warning",
  showIcon = true,
}) => {
  const getBannerStyles = (): BannerStyles => {
    switch (type) {
      case "error":
        return {
          container: "bg-error/10 border-error/20 text-error",
          icon: "AlertCircle",
          iconColor: "text-error",
        };
      case "warning":
        return {
          container: "bg-warning/10 border-warning/20 text-warning",
          icon: "AlertTriangle",
          iconColor: "text-warning",
        };
      case "info":
        return {
          container: "bg-info/10 border-info/20 text-info",
          icon: "Info",
          iconColor: "text-info",
        };
      default:
        return {
          container: "bg-muted border-border text-text-secondary",
          icon: "Lock",
          iconColor: "text-text-secondary",
        };
    }
  };

  const styles = getBannerStyles();

  return (
    <div className={`rounded-lg border p-4 ${styles.container}`}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <Icon
            name={styles.icon}
            size={20}
            className={`mt-0.5 ${styles.iconColor}`}
          />
        )}
        <div className="flex-1">
          <h3 className="mb-1 font-medium">{title}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AccessRestrictionBanner;
