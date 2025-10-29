import React from "react";
import Icon from "@/components/rocket/components/AppIcon";
import type { IconName } from "@/components/rocket/components/AppIcon";

interface WorkflowStep {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  completed: boolean;
}

interface WorkflowSidebarProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepChange: (index: number) => void;
  canProgressToStep: (index: number) => boolean;
}

const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({
  steps,
  currentStep,
  onStepChange,
  canProgressToStep,
}) => {
  return (
    <div className="bg-surface border-border rounded-lg border p-6">
      <h3 className="text-text-primary mb-6 text-lg font-semibold">
        Workflow Progress
      </h3>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.completed;
          const canAccess = canProgressToStep(index);

          return (
            <button
              key={step.id}
              onClick={() => canAccess && onStepChange(index)}
              disabled={!canAccess}
              className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : isCompleted
                    ? "border-success bg-success/5 text-success hover:bg-success/10"
                    : canAccess
                      ? "border-border bg-background text-text-secondary hover:bg-muted/50"
                      : "border-border bg-muted/30 text-text-disabled cursor-not-allowed"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-primary text-white"
                      : isCompleted
                        ? "bg-success text-white"
                        : canAccess
                          ? "bg-muted text-text-secondary"
                          : "bg-muted/50 text-text-disabled"
                  }`}
                >
                  {isCompleted ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    <Icon name={step.icon} size={16} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="mb-1 text-sm font-medium">{step.label}</h4>
                  <p className="line-clamp-2 text-xs opacity-80">
                    {step.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Summary */}
      {/* <div className="border-border mt-6 border-t pt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-text-secondary text-sm">Overall Progress</span>
          <span className="text-text-primary text-sm font-medium">
            {+(((currentStep + 1) / steps.length) * 100).toFixed(2)}%
          </span>
        </div>
        <div className="bg-muted h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div> */}
    </div>
  );
};

export default WorkflowSidebar;
