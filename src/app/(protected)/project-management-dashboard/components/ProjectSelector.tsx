import React, { useState } from "react";
import Select from "@/components/rocket/components/ui/Select";
import Icon from "@/components/rocket/components/AppIcon";

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  status: string;
  overallProgress: number;
  dueDate: string;
  assignedPM: string;
  revenue: string;
  // cost: string;
  priority: string;
}

interface ProjectSelectorProps {
  selectedProject: string | number;
  onProjectChange: (projectId: string) => void;
  projects: Project[];
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  onProjectChange,
  projects,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const projectOptions = projects.map((project) => ({
    value: String(project.id),
    label: `${project.name} - ${project.client}`,
  }));

  const currentProject = projects.find((p) => p.id === selectedProject);

  return (
    <div className="bg-card border-border mb-6 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Icon name="Building2" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-text-primary text-lg font-semibold">
              {currentProject?.name ?? "Select Project"}
            </h2>
            {currentProject && (
              <p className="text-text-secondary text-sm">
                {currentProject.client} • {currentProject.location}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:bg-muted transition-smooth rounded-md p-2"
        >
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            size={20}
            color="var(--color-text-secondary)"
          />
        </button>
      </div>

      {isExpanded && (
        <div className="border-border mt-4 border-t pt-4">
          <div className="mb-4">
            <label className="text-text-primary mb-2 block text-sm font-medium">
              Switch Project
            </label>
            <Select
              options={projectOptions}
              value={String(selectedProject)}
              onChange={onProjectChange}
              placeholder="Search projects..."
              className="mb-4"
            />
          </div>

          {currentProject && (
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Status:</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                    currentProject.status === "Active"
                      ? "bg-success/10 text-success"
                      : currentProject.status === "On Hold"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-text-secondary"
                  }`}
                >
                  {currentProject.status}
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Progress:</span>
                <span className="text-text-primary ml-2 font-medium">
                  {currentProject.overallProgress}%
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Due Date:</span>
                <span className="text-text-primary ml-2 font-medium">
                  {currentProject.dueDate}
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Assigned PM:</span>
                <span className="text-text-primary ml-2 font-medium">
                  {currentProject.assignedPM}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
