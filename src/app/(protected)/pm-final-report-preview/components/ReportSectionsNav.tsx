import React from "react";
import Icon from "@/components/rocket/components/AppIcon";
import type { IconName } from "@/components/rocket/components/AppIcon";

interface ReportSection {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  completed: boolean;
  count?: number;
}

interface ReportSectionsNavProps {
  sections: ReportSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const ReportSectionsNav: React.FC<ReportSectionsNavProps> = ({
  sections,
  activeSection,
  onSectionChange,
}) => {
  return (
    <div className="bg-surface border-border rounded-lg border p-6">
      <h3 className="text-text-primary mb-4 text-lg font-semibold">
        Report Sections
      </h3>

      <div className="space-y-2">
        {sections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-text-secondary hover:bg-muted/50 hover:text-text-primary"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-primary text-white"
                      : section.completed
                        ? "bg-success text-white"
                        : "bg-muted text-text-secondary"
                  }`}
                >
                  {section.completed && !isActive ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    <Icon name={section.icon} size={16} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="text-sm font-medium">{section.label}</h4>
                    {section.count !== undefined && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-text-secondary"
                        }`}
                      >
                        {section.count}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs opacity-80">
                    {section.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="border-border mt-6 border-t pt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-text-secondary text-sm">Report Completion</span>
          <span className="text-text-primary text-sm font-medium">100%</span>
        </div>
        <div className="bg-muted h-2 w-full rounded-full">
          <div className="bg-success h-2 w-full rounded-full transition-all duration-300" />
        </div>
        <p className="text-text-secondary mt-2 text-xs">
          All sections completed and ready for distribution
        </p>
      </div>
    </div>
  );
};

export default ReportSectionsNav;
