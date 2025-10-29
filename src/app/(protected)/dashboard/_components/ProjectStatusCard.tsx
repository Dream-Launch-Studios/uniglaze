"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../../components/rocket/components/AppIcon";
import Button from "../../../../components/rocket/components/ui/Button";
import { PriorityLevel, Role, type ProjectStatus } from "@prisma/client";
import type { Session } from "@/server/auth";
import { useSession } from "@/lib/auth-client";

interface Project {
  name: string;
  client: string;
  priority: PriorityLevel;
  status: ProjectStatus;
  progress: number;
  supplyProgress: number;
  installationProgress: number;
  dueDate: string;
  // teamSize: number;
  daysRemaining: number;
}

interface ProjectStatusCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({
  project,
  onClick,
}) => {
  const router = useRouter();

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-success";
      case "on hold":
        return "text-warning";
      case "delayed":
        return "text-error";
      case "completed":
        return "text-primary";
      default:
        return "text-text-secondary";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case PriorityLevel.HIGH_PRIORITY:
        return "bg-error/10 text-error border-error/20";
      case PriorityLevel.MEDIUM_PRIORITY:
        return "bg-warning/10 text-warning border-warning/20";
      case PriorityLevel.LOW_PRIORITY:
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-text-secondary border-border";
    }
  };

  const getDaysRemainingColor = (days: number): string => {
    if (days < 0) return "text-error";
    if (days <= 7) return "text-warning";
    return "text-success";
  };

  const formatProgress = (progress: number): number => {
    return Math.round(progress);
  };

  const { data: session } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  return (
    <div
      className="card transition-smooth hover:elevation-2 p-6"
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-text-primary mb-1 truncate text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
          <p className="text-text-secondary text-sm font-medium">
            {project.client}
          </p>
        </div>
        <div className="ml-4 flex items-center space-x-2">
          <span
            className={`rounded-full border px-2 py-1 text-xs font-semibold ${getPriorityColor(project.priority.toString())}`}
          >
            {project.priority}
          </span>
          <span
            className={`bg-muted text-text-secondary border-border rounded-full border px-2 py-1 text-xs font-semibold`}
          >
            {project.status}
          </span>
        </div>
        {session?.user?.customRole !== Role.PROJECT_MANAGER && (
          <div className="ml-2 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-primary space-x-2 text-sm font-medium text-white"
            >
              <Icon name="Edit" size={14} />
              <span className="text-sm font-medium">Edit</span>
            </Button>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm font-medium">
            Overall Progress
          </span>
          <span className="text-text-primary text-lg font-bold">
            {formatProgress(project.progress)}%
          </span>
        </div>
        <div className="bg-muted h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-text-secondary text-xs font-medium">
                Supply
              </span>
              <span className="text-text-primary text-sm font-semibold">
                {formatProgress(project.supplyProgress)}%
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full rounded-full">
              <div
                className="bg-success h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${project.supplyProgress}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-text-secondary text-xs font-medium">
                Installation
              </span>
              <span className="text-text-primary text-sm font-semibold">
                {formatProgress(project.installationProgress)}%
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full rounded-full">
              <div
                className="bg-accent h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${project.installationProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-border flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Icon
              name="Calendar"
              size={14}
              color="var(--color-text-secondary)"
            />
            <span className="text-text-secondary">Due: {project.dueDate}</span>
          </div>
          {/* <div className="flex items-center space-x-1">
            <Icon name="Users" size={14} color="var(--color-text-secondary)" />
            <span className="text-text-secondary">
              {project.teamSize} members
            </span>
          </div> */}
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-xs font-semibold ${getDaysRemainingColor(project.daysRemaining)}`}
          >
            {project.daysRemaining >= 0
              ? `${project.daysRemaining} days left`
              : `${Math.abs(project.daysRemaining)} days overdue`}
          </span>
          {/* <Button
            variant="ghost"
            size="xs"
            iconName="ArrowRight"
            iconSize={14}
            onClick={() => router.push("/project-management-dashboard")}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusCard;
