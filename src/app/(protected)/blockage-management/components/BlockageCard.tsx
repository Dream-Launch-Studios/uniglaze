import React from "react";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Image from "@/components/rocket/components/AppImage";

interface BlockagePhoto {
  url: string;
  description?: string;
}

interface Blockage {
  id: string | number;
  title: string;
  description: string;
  project: string;
  // location: string; //
  severity: "critical" | "high" | "medium" | "low";
  category: "client" | "internal" | "supplier" | "weather";
  // status: "open" | "in-progress" | "pending-approval" | "resolved" | "closed"; //
  createdAt: string;
  // clientVisible: boolean; //
  assignedTo: string;
  priority: boolean;
  // commentsCount?: number; //
  photos?: BlockagePhoto[];
}

interface BlockageCardProps {
  blockage: Blockage;
  onViewDetails: (blockage: Blockage) => void;
  onStatusChange: (id: string | number, status: string) => void;
  onEdit: (blockage: Blockage) => void;
}

const BlockageCard: React.FC<BlockageCardProps> = ({
  blockage,
  onViewDetails,
  onStatusChange,
  onEdit,
}) => {
  const getSeverityColor = (severity: Blockage["severity"]): string => {
    switch (severity) {
      case "critical":
        return "text-error bg-error/10 border-error/20";
      case "high":
        return "text-warning bg-warning/10 border-warning/20";
      case "medium":
        return "text-accent bg-accent/10 border-accent/20";
      case "low":
        return "text-success bg-success/10 border-success/20";
      default:
        return "text-text-secondary bg-muted border-border";
    }
  };

  // const getStatusColor = (status: Blockage["status"]): string => {
  //   switch (status) {
  //     case "open":
  //       return "text-error bg-error/10";
  //     case "in-progress":
  //       return "text-accent bg-accent/10";
  //     case "pending-approval":
  //       return "text-warning bg-warning/10";
  //     case "resolved":
  //       return "text-success bg-success/10";
  //     case "closed":
  //       return "text-text-secondary bg-muted";
  //     default:
  //       return "text-text-secondary bg-muted";
  //   }
  // };

  const getCategoryIcon = (category: Blockage["category"]): IconName => {
    switch (category) {
      case "client":
        return "Users";
      case "internal":
        return "Building";
      case "supplier":
        return "Truck";
      case "weather":
        return "Cloud";
      default:
        return "AlertTriangle";
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString();
  };

  const getDaysOutstanding = (createdDate: string): number => {
    const today = new Date();
    const created = new Date(createdDate);
    const diffTime = Math.abs(today.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-card border-border hover:elevation-2 transition-smooth rounded-lg border p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div
            className={`rounded-lg p-2 ${getSeverityColor(blockage.severity)}`}
          >
            <Icon name={getCategoryIcon(blockage.category)} size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary mb-1 text-lg font-semibold">
              {blockage.title}
            </h3>
            {/* <p className="text-text-secondary text-sm">
              {blockage.project} • {blockage.location}
            </p> */}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(blockage.severity)}`}
          >
            {blockage.severity.charAt(0).toUpperCase() +
              blockage.severity.slice(1)}
          </span>
          {/* <Button
            variant="ghost"
            size="sm"
            iconName="MoreVertical"
            iconSize={16}
            onClick={() => onEdit(blockage)}
          /> */}
        </div>
      </div>

      {/* Description */}
      <p className="text-text-primary mb-4 line-clamp-2">
        {blockage.description}
      </p>

      {/* Photos Preview */}
      {blockage.photos && blockage.photos.length > 0 && (
        <div className="mb-4 flex space-x-2">
          {blockage.photos.slice(0, 3).map((photo, index) => (
            <div key={index} className="h-16 w-16 overflow-hidden rounded-lg">
              <Image
                src={photo.url}
                alt={photo.description ?? "Blockage photo"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {blockage.photos.length > 3 && (
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-lg">
              <span className="text-text-secondary text-xs font-medium">
                +{blockage.photos.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status and Metadata */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(blockage.status)}`}
          >
            {blockage.status
              .replace("-", " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span> */}
          <div className="text-text-secondary flex items-center text-sm">
            <Icon name="Calendar" size={14} className="mr-1" />
            {formatDate(blockage.createdAt)}
          </div>
          <div className="text-text-secondary flex items-center text-sm">
            <Icon name="Clock" size={14} className="mr-1" />
            {getDaysOutstanding(blockage.createdAt)} days
          </div>
        </div>

        {/* {blockage.clientVisible && (
          <div className="text-primary flex items-center text-xs">
            <Icon name="Eye" size={12} className="mr-1" />
            Client Visible
          </div>
        )} */}
      </div>

      {/* Assigned To */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
            <Icon name="User" size={12} color="white" />
          </div>
          <span className="text-text-secondary text-sm">
            Assigned to:{" "}
            <span className="text-text-primary font-medium">
              {blockage.assignedTo}
            </span>
          </span>
        </div>

        {blockage.priority && (
          <div className="text-warning flex items-center text-xs">
            <Icon name="Flag" size={12} className="mr-1" />
            High Priority
          </div>
        )}
      </div>

      {/* Actions */}
      {/* <div className="border-border flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconPosition="left"
            iconSize={14}
            onClick={() => onViewDetails(blockage)}
          >
            View Details
          </Button>

          {blockage.status !== "closed" && (
            <Button
              variant="ghost"
              size="sm"
              iconName="MessageSquare"
              iconSize={14}
              onClick={() => onViewDetails(blockage)}
            >
              {blockage.commentsCount ?? 0}
            </Button>
          )}
        </div>

        {blockage.status !== "closed" && (
          <div className="flex items-center space-x-2">
            {blockage.status === "open" && (
              <Button
                variant="default"
                size="sm"
                iconName="Play"
                iconPosition="left"
                iconSize={14}
                onClick={() => onStatusChange(blockage.id, "in-progress")}
              >
                Start Work
              </Button>
            )}

            {blockage.status === "in-progress" && (
              <Button
                variant="success"
                size="sm"
                iconName="Check"
                iconPosition="left"
                iconSize={14}
                onClick={() => onStatusChange(blockage.id, "resolved")}
              >
                Mark Resolved
              </Button>
            )}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default BlockageCard;
