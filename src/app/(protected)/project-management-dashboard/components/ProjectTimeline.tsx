import React from "react";
import Icon from "@/components/rocket/components/AppIcon";

interface TimelineItem {
  id: number;
  phase: string;
  description: string;
  date: string;
  status: "completed" | "in-progress" | "pending";
  progress: number;
}

interface ProjectTimelineProps {
  timeline: TimelineItem[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ timeline }) => {
  const getStatusIcon = (status: TimelineItem["status"]) => {
    switch (status) {
      case "completed":
        return { name: "CheckCircle" as const, color: "var(--color-success)" };
      case "in-progress":
        return { name: "Clock" as const, color: "var(--color-warning)" };
      case "pending":
        return {
          name: "Circle" as const,
          color: "var(--color-text-secondary)",
        };
      default:
        return {
          name: "Circle" as const,
          color: "var(--color-text-secondary)",
        };
    }
  };

  return (
    <div className="bg-card border-border rounded-lg border p-4">
      <div className="mb-4 flex items-center space-x-2">
        <Icon name="Calendar" size={20} color="var(--color-primary)" />
        <h3 className="text-text-primary text-lg font-semibold">
          Project Timeline
        </h3>
      </div>

      <div className="space-y-4">
        {timeline.map((item, index) => {
          const statusIcon = getStatusIcon(item.status);
          return (
            <div key={item.id} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <Icon
                  name={statusIcon.name}
                  size={16}
                  color={statusIcon.color}
                />
                {index < timeline.length - 1 && (
                  <div className="bg-border mt-2 h-8 w-px"></div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-text-primary truncate text-sm font-medium">
                    {item.phase}
                  </h4>
                  <span className="text-text-secondary ml-2 text-xs whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
                <p className="text-text-secondary mt-1 text-xs">
                  {item.description}
                </p>
                {item.progress && (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-primary font-medium">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 w-full rounded-full">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTimeline;
