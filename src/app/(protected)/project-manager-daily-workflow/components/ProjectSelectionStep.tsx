import React, { useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import type * as LucideIcons from "lucide-react";
import type { projectSchema } from "@/validators/prisma-schmea.validator";
import type z from "zod";
import { useProjectStore } from "@/store/project.store";

// Type definitions
export interface ProjectItem {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  location: string;
  progress: number;
  items?: ProjectItem[];
}

export interface ProjectSelectionStepProps {
  assignedProjects: z.infer<typeof projectSchema>[];
  onNext: () => void;
}

const ProjectSelectionStep: React.FC<ProjectSelectionStepProps> = ({
  assignedProjects,
  onNext,
}) => {
  const [hoveredProjectId, setHoveredProjectId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  // const selectedProjectId =
  //   useProjectStore.getState().latestProjectVersion?.projectId;

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Active":
        return "success";
      case "On Hold":
        return "warning";
      case "Delayed":
        return "error";
      default:
        return "muted";
    }
  };

  const getStatusIcon = (status: string): keyof typeof LucideIcons => {
    switch (status) {
      case "Active":
        return "Play";
      case "On Hold":
        return "Pause";
      case "Delayed":
        return "AlertTriangle";
      default:
        return "Circle";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Select Project
        </h2>
        <p className="text-text-secondary">
          Choose from your assigned projects to begin the daily workflow
        </p>
      </div>

      {assignedProjects?.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-muted mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
            <Icon
              name="FolderX"
              size={32}
              color="var(--color-text-secondary)"
            />
          </div>
          <h3 className="text-text-primary mb-4 text-xl font-semibold">
            No Projects Assigned
          </h3>
          <p className="text-text-secondary mx-auto max-w-md">
            You don&apos;t have any projects assigned to you. Please contact
            your Head Of Planning for project assignments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedProjects?.map((project: z.infer<typeof projectSchema>) => {
            const isSelected =
              selectedProjectId === project.latestProjectVersion.projectId;
            const isHovered =
              hoveredProjectId === project.latestProjectVersion.projectId;

            return (
              <div
                key={project.latestProjectVersion.projectId}
                className={`relative cursor-pointer rounded-lg border p-6 transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                    : "border-border bg-background hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => {
                  useProjectStore.getState().setProject(project);
                  setSelectedProjectId(
                    project.latestProjectVersion.projectId ?? -1,
                  );
                  useProjectStore.getState().resetProgressPhotos();
                }}
                onMouseEnter={() =>
                  setHoveredProjectId(
                    project.latestProjectVersion.projectId ?? -1,
                  )
                }
                onMouseLeave={() => setHoveredProjectId(null)}
              >
                {/* Selection Indicator */}
                <div
                  className={`absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {isSelected && <Icon name="Check" size={14} color="white" />}
                </div>

                <div className="pr-10">
                  {/* Project Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-text-primary mb-1 text-lg font-semibold">
                        {project.latestProjectVersion.projectName}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {project.latestProjectVersion.client.clientName}
                      </p>
                    </div>
                    <div
                      className={`flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium bg-${getStatusColor(
                        project.latestProjectVersion.projectStatus,
                      )}/10 text-${getStatusColor(
                        project.latestProjectVersion.projectStatus,
                      )}`}
                    >
                      <Icon
                        name={getStatusIcon(
                          project.latestProjectVersion.projectStatus,
                        )}
                        size={12}
                      />
                      <span>{project.latestProjectVersion.projectStatus}</span>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="text-text-secondary flex items-center space-x-2 text-sm">
                      <Icon name="MapPin" size={16} />
                      <span>
                        {project.latestProjectVersion.siteLocation.city}
                      </span>
                    </div>
                    <div className="text-text-secondary flex items-center space-x-2 text-sm">
                      <Icon name="Package" size={16} />
                      <span>
                        {project.latestProjectVersion.sheet1?.length ?? 0} Items
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-text-primary text-sm font-medium">
                        Overall Progress
                      </span>
                      {project.latestProjectVersion.sheet1 && (
                        <span className="text-text-secondary text-sm">
                          {Math.min(
                            Math.round(
                              +project.latestProjectVersion.sheet1?.reduce(
                                (acc, item) => acc + item.percentInstalled,
                                0,
                              ) /
                                (project.latestProjectVersion.sheet1?.length ??
                                  1),
                            ),
                            100,
                          )}
                          %
                        </span>
                      )}
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            Math.round(
                              project?.latestProjectVersion?.sheet1!.reduce(
                                (acc, item) => acc + item.percentSupplied,
                                0,
                              ) /
                                (project?.latestProjectVersion?.sheet1
                                  ?.length ?? 1),
                            ),
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Item Preview */}
                  {project.latestProjectVersion.sheet1 &&
                    project.latestProjectVersion.sheet1.length > 0 && (
                      <div
                        className={`transition-all duration-200 ${isHovered || isSelected ? "opacity-100" : "opacity-60"}`}
                      >
                        <h4 className="text-text-primary mb-2 text-sm font-medium">
                          Project Items:
                        </h4>
                        <div className="space-y-1">
                          {project.latestProjectVersion.sheet1
                            .slice(0, 3)
                            .map((item) => (
                              <div
                                key={item.itemName}
                                className="text-text-secondary flex items-center space-x-2 text-xs"
                              >
                                <div className="bg-primary h-1 w-1 rounded-full"></div>
                                <span>{item.itemName}</span>
                              </div>
                            ))}
                          {project.latestProjectVersion.sheet1.length > 3 && (
                            <div className="text-text-secondary flex items-center space-x-2 text-xs">
                              <div className="bg-text-disabled h-1 w-1 rounded-full"></div>
                              <span>
                                +
                                {project.latestProjectVersion.sheet1.length - 3}{" "}
                                more items
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-border mt-8 flex justify-end border-t pt-6">
        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          disabled={!selectedProjectId}
          iconName="ArrowRight"
          iconPosition="right"
        >
          continue
        </Button>
      </div>
    </div>
  );
};

export default ProjectSelectionStep;
