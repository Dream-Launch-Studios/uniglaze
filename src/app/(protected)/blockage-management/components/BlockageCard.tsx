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
  severity: "critical" | "high" | "medium" | "low";
  category: "client" | "internal" | "supplier" | "weather";
  status?: "OPEN" | "CLOSED";
  createdAt: string;
  assignedTo: string;
  priority: boolean;
  photos?: BlockagePhoto[];
  closureDate?: string;
  closureRemarks?: string;
  closedByName?: string;
}

interface BlockageCardProps {
  blockage: Blockage;
  onViewDetails: (blockage: Blockage) => void;
  onStatusChange: (id: string | number, status: string) => void;
  onEdit: (blockage: Blockage) => void;
  onClose?: () => void;
}

const BlockageCard: React.FC<BlockageCardProps> = ({
  blockage,
  onViewDetails,
  onStatusChange,
  onEdit,
  onClose,
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

  const getStatusColor = (status?: "OPEN" | "CLOSED"): string => {
    switch (status) {
      case "OPEN":
        return "text-error bg-error/10 border-error/20";
      case "CLOSED":
        return "text-success bg-success/10 border-success/20";
      default:
        return "text-text-secondary bg-muted border-border";
    }
  };

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
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(blockage.status)}`}
          >
            {blockage.status ?? "OPEN"}
          </span>
          <div className="text-text-secondary flex items-center text-sm">
            <Icon name="Calendar" size={14} className="mr-1" />
            {formatDate(blockage.createdAt)}
          </div>
          {blockage.status === "OPEN" && (
            <div className="text-text-secondary flex items-center text-sm">
              <Icon name="Clock" size={14} className="mr-1" />
              {getDaysOutstanding(blockage.createdAt)} days
            </div>
          )}
          {blockage.status === "CLOSED" && blockage.closureDate && (
            <div className="text-text-secondary flex items-center text-sm">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Closed {formatDate(blockage.closureDate)}
            </div>
          )}
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

      {/* Closure Information */}
      {blockage.status === "CLOSED" && (
        <div className="bg-muted border-border mb-4 rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-text-secondary text-xs font-medium">
              Closed by: {blockage.closedByName ?? "Unknown"}
            </span>
            {blockage.closureDate && (
              <span className="text-text-secondary text-xs">
                {formatDate(blockage.closureDate)}
              </span>
            )}
          </div>
          {blockage.closureRemarks && (
            <p className="text-text-primary text-sm">
              {blockage.closureRemarks}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {blockage.status === "OPEN" && onClose && (
        <div className="border-border flex items-center justify-end border-t pt-4">
          <Button
            variant="default"
            size="sm"
            iconName="XCircle"
            iconPosition="left"
            iconSize={14}
            onClick={onClose}
            className="bg-warning hover:bg-warning/90"
          >
            Close Blockage
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlockageCard;
