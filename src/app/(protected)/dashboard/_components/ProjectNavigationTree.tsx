"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../../components/rocket/components/AppIcon";
import Button from "../../../../components/rocket/components/ui/Button";
import Input from "../../../../components/rocket/components/ui/Input";
import type * as LucideIcons from "lucide-react";
import { ProjectStatus, Role } from "@prisma/client";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
interface Project {
  id: number;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
}

interface ProjectNavigationTreeProps {
  projects: Project[];
}

interface ProjectAction {
  label: string;
  icon: keyof typeof LucideIcons;
  route: string;
}

interface StatusIcon {
  name: keyof typeof LucideIcons;
  color: string;
}

const ProjectNavigationTree: React.FC<ProjectNavigationTreeProps> = ({
  projects,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    new Set(),
  );
  const router = useRouter();
  const { data: session } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };
  const userRole = session?.user?.customRole;

  const filteredProjects = projects.filter(
    (project: Project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleProjectExpansion = (projectId: number): void => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getStatusIcon = (status: Project["status"]): StatusIcon => {
    return { name: status === ProjectStatus.ACTIVE ? "Play" : status === ProjectStatus.ON_HOLD ? "Pause" : status === ProjectStatus.COMPLETED ? "CheckCircle" : "Circle", color: "var(--color-primary)" };
  };

  const projectActions: ProjectAction[] = [
    // {
    //   label: "Daily Report",
    //   icon: "FileText",
    //   route: "/daily-progress-report",
    // },
    {
      label: "Photo Gallery",
      icon: "Camera",
      route: "/photo-gallery-management",
    },
    {
      label: "Blockages",
      icon: "AlertTriangle",
      route: "/blockage-management",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-card border-border rounded-lg border">
      <div className="border-border border-b p-4">
        <h2 className="text-text-primary mb-4 text-lg font-semibold">
          Project Navigation
        </h2>
        <Input
          type="search"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={handleInputChange}
          className="mb-4"
        />
        {userRole !== Role.PROJECT_MANAGER && (
        <Button
          variant="default"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
          onClick={() => router.push("/project-creation")}
          className="w-full"
        >
          Create New Project
        </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="p-6 text-center">
            <Icon
              name="Search"
              size={48}
              color="var(--color-text-secondary)"
              className="mx-auto mb-3"
            />
            <p className="text-text-secondary">
              {searchTerm ? "No projects found" : "No projects available"}
            </p>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {filteredProjects.map((project: Project) => {
              const statusIcon = getStatusIcon(project.status);
              const isExpanded = expandedProjects.has(project.id);

              return (
                <div key={project.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      onClick={() => toggleProjectExpansion(project.id)}
                      className="hover:bg-muted/50 transition-smooth -m-2 flex min-w-0 flex-1 items-center space-x-3 rounded-md p-2 text-left"
                    >
                      <Icon
                        name={isExpanded ? "ChevronDown" : "ChevronRight"}
                        size={16}
                        color="var(--color-text-secondary)"
                      />
                      <Icon
                        name={statusIcon.name}
                        size={16}
                        color={statusIcon.color}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-text-primary truncate text-sm font-medium">
                          {project.name}
                        </p>
                        <p className="text-text-secondary truncate text-xs">
                          {project.client}
                        </p>
                      </div>
                    </button>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      iconName="ExternalLink"
                      iconSize={14}
                      onClick={() =>
                        router.push("/project-management-dashboard")
                      }
                    /> */}
                  </div>

                  {isExpanded && (
                    <div className="ml-8 space-y-2">
                      <div className="text-text-secondary mb-3 text-xs">
                        <div className="flex justify-between">
                          <span>Progress: {project.progress}%</span>
                          <span>Due: {project.dueDate}</span>
                        </div>
                        <div className="bg-muted mt-1 h-1 w-full rounded-full">
                          <div
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        {projectActions.map((action: ProjectAction) => (
                          <button
                            key={action.label}
                            onClick={() => router.push(action.route)}
                            className="text-text-secondary hover:text-text-primary hover:bg-muted transition-smooth flex w-full items-center space-x-2 rounded-md px-3 py-2 text-xs"
                          >
                            <Icon name={action.icon} size={14} />
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectNavigationTree;
