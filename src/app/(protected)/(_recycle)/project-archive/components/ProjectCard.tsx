import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";
import Button from "@/components/rocket/components/ui/Button";

interface ArchivedProject {
  id: string;
  name: string;
  clientName: string;
  status: "completed" | "cancelled" | "on-hold";
  completionPercentage: number;
  finalCost: number;
  startDate: string;
  endDate: string;
  archivedDate: string;
  projectManager: string;
  location: string;
  teamSize: number;
  totalReports: number;
  totalPhotos: number;
  totalBlockages: number;
  resolvedBlockages: number;
  timelineAdherence: number;
  budgetAdherence: number;
  qualityScore: number;
  thumbnail: string;
}

interface ProjectCardProps {
  project: ArchivedProject;
  onViewDetails: (project: ArchivedProject) => void;
  onExportProject: (project: ArchivedProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onExportProject,
}) => {
  const [imageError, setImageError] = useState<boolean>(false);

  const getStatusColor = (status: ArchivedProject["status"]): string => {
    switch (status) {
      case "completed":
        return "text-success bg-success/10";
      case "cancelled":
        return "text-error bg-error/10";
      case "on-hold":
        return "text-warning bg-warning/10";
      default:
        return "text-text-secondary bg-muted";
    }
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 70) return "text-warning";
    return "text-error";
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years}y ${remainingMonths}m`;
    }
  };

  return (
    <div className="bg-card border-border hover:elevation-2 transition-smooth overflow-hidden rounded-lg border">
      {/* Project Image */}
      <div className="bg-muted relative h-48 overflow-hidden">
        {!imageError ? (
          <Image
            src={project.thumbnail}
            alt={project.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="bg-muted flex h-full w-full items-center justify-center">
            <Icon
              name="Building2"
              size={48}
              color="var(--color-text-secondary)"
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(project.status)}`}
          >
            {project.status}
          </span>
        </div>

        {/* Completion Percentage */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-background/90 rounded-md px-2 py-1 backdrop-blur-sm">
            <span
              className={`text-sm font-semibold ${getCompletionColor(project.completionPercentage)}`}
            >
              {project.completionPercentage}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-text-primary mb-1 line-clamp-1 text-lg font-semibold">
            {project.name}
          </h3>
          <p className="text-text-secondary line-clamp-1 text-sm">
            {project.clientName}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-text-secondary mb-1 text-xs">Final Cost</p>
            <p className="text-text-primary text-sm font-semibold">
              {formatCurrency(project.finalCost)}
            </p>
          </div>
          <div>
            <p className="text-text-secondary mb-1 text-xs">Duration</p>
            <p className="text-text-primary text-sm font-semibold">
              {calculateDuration(project.startDate, project.endDate)}
            </p>
          </div>
          <div>
            <p className="text-text-secondary mb-1 text-xs">Team Size</p>
            <p className="text-text-primary text-sm font-semibold">
              {project.teamSize} members
            </p>
          </div>
          <div>
            <p className="text-text-secondary mb-1 text-xs">Reports</p>
            <p className="text-text-primary text-sm font-semibold">
              {project.totalReports} submitted
            </p>
          </div>
        </div>

        {/* Timeline Adherence */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-text-secondary text-xs">
              Timeline Adherence
            </span>
            <span
              className={`text-xs font-medium ${
                project.timelineAdherence >= 90
                  ? "text-success"
                  : project.timelineAdherence >= 70
                    ? "text-warning"
                    : "text-error"
              }`}
            >
              {project.timelineAdherence}%
            </span>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                project.timelineAdherence >= 90
                  ? "bg-success"
                  : project.timelineAdherence >= 70
                    ? "bg-warning"
                    : "bg-error"
              }`}
              style={{ width: `${project.timelineAdherence}%` }}
            />
          </div>
        </div>

        {/* Project Dates */}
        <div className="text-text-secondary mb-4 flex items-center justify-between text-xs">
          <span>Started: {formatDate(project.startDate)}</span>
          <span>Completed: {formatDate(project.endDate)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewDetails(project)}
            iconName="Eye"
            iconPosition="left"
            iconSize={14}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportProject(project)}
            iconName="Download"
            iconSize={14}
          />
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-muted/50 border-border border-t px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Icon name="Camera" size={12} />
              {project.totalPhotos} photos
            </span>
            <span className="flex items-center gap-1">
              <Icon name="AlertTriangle" size={12} />
              {project.totalBlockages} blockages
            </span>
          </div>
          <span className="text-text-secondary">
            Archived {formatDate(project.archivedDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
