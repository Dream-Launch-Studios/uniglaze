"use client";

import React, { useState } from "react";
import Icon from "../../../../components/rocket/components/AppIcon";
import Button from "../../../../components/rocket/components/ui/Button";
import { PriorityLevel, Role, type ProjectStatus } from "@prisma/client";
import type { Session } from "@/server/auth";
import { useSession } from "@/lib/auth-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  projectDocuments: {
    s3Key: string;
    fileName: string;
    fileType: string;
    url: string;
  }[];
}

interface ProjectStatusCardProps {
  project: Project;
  onClick: () => void;
  onDelete?: () => void;
}

const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({ project, onClick, onDelete }) => {
  const formatProgress = (progress: number): number => {
    return Math.round(progress);
  };

  const { data: session } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  const [isResourcesDialogOpen, setIsResourcesDialogOpen] =
    useState<boolean>(false);

  const hasResources = project.projectDocuments?.length > 0;

  const getFileIconName = (
    fileName: string,
  ):
    | "FileText"
    | "Image"
    | "FileImage"
    | "FileSpreadsheet"
    | "File" => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (!extension) return "File";

    if (["pdf"].includes(extension)) return "FileText";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "Image";
    if (["dwg", "dxf"].includes(extension)) return "FileImage";

    if (["xls", "xlsx", "csv"].includes(extension)) return "FileSpreadsheet";

    return "File";
  };

  return (
    <div className="bg-card border-border transition-smooth hover:border-primary/30 rounded-lg border p-6 cursor-pointer" onClick={onClick}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-text-primary mb-1 truncate text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
          <p className="text-text-secondary text-sm">
            {project.client}
          </p>
        </div>
        {session?.user?.customRole !== Role.PROJECT_MANAGER && (
          <div className="ml-4 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/5"
              onClick={(event) => {
                event.stopPropagation();
                onClick();
              }}
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
          <span className="text-text-secondary text-sm">
            Overall Progress
          </span>
          <span className="text-text-primary text-lg font-semibold">
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
              <span className="text-text-secondary text-xs">
                Supply
              </span>
              <span className="text-text-primary text-sm font-medium">
                {formatProgress(project.supplyProgress)}%
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full rounded-full">
              <div
                className="bg-primary/60 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${project.supplyProgress}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-text-secondary text-xs">
                Installation
              </span>
              <span className="text-text-primary text-sm font-medium">
                {formatProgress(project.installationProgress)}%
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full rounded-full">
              <div
                className="bg-primary/80 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${project.installationProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-border flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1.5">
            <Icon
              name="Calendar"
              size={14}
              color="var(--color-text-secondary)"
            />
            <span className="text-text-secondary">Due: {project.dueDate}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-text-secondary text-xs font-medium">
            {project.daysRemaining >= 0
              ? `${project.daysRemaining} days left`
              : `${Math.abs(project.daysRemaining)} days overdue`}
          </span>

          {hasResources && (
            <AlertDialog
              open={isResourcesDialogOpen}
              onOpenChange={setIsResourcesDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/5"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsResourcesDialogOpen(true);
                  }}
                >
                  <Icon name="FolderOpen" size={14} />
                  <span className="ml-1 text-xs font-medium">
                    View Resources
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                className="max-h-[70vh] overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Project Resources</AlertDialogTitle>
                  <AlertDialogDescription>
                    Files attached to this project by HOP/MD during creation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="mt-4 space-y-2">
                  {project.projectDocuments.map((doc) => (
                    <div
                      key={doc.s3Key}
                      className="bg-muted flex items-center justify-between rounded-md p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                          <Icon
                            name={getFileIconName(doc.fileName)}
                            size={16}
                            color="var(--color-primary)"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-text-primary truncate text-sm font-medium">
                            {doc.fileName}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {doc.fileType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/5"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.open(doc.url, "_blank");
                          }}
                        >
                          <Icon name="Download" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-text-secondary hover:bg-muted"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.open(doc.url, "_blank");
                          }}
                        >
                          <Icon name="ExternalLink" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => setIsResourcesDialogOpen(false)}
                  >
                    Done
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusCard;
