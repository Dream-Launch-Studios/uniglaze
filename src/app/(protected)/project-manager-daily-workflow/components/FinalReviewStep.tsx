/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import { useProjectStore } from "@/store/project.store";

interface FinalReviewStepProps {
  onComplete: () => void;
  onPrevious: () => void;
}

interface CompletionStatus {
  progress: boolean;
  blockages: boolean;
}

const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  onComplete,
  onPrevious,
}) => {
  const selectedProject = useProjectStore.getState();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    onComplete();
    setIsSubmitting(false);
  };

  const getTotalPhotos = (): number => {
    return Object.values(
      selectedProject?.latestProjectVersion?.sheet1?.flatMap(
        (item) => item.blockages,
      ) ?? {},
    ).reduce((total: number, item) => total + (item?.blockagePhotos?.length ?? 0), 0);
  };

  const getTotalBlockages = (): number => {
    return Object.values(
      selectedProject?.latestProjectVersion?.sheet1?.flatMap(
        (item) => item.blockages,
      ) ?? {},
    ).length;
  };

  const calculateOverallProgress = (): number => {
    if (!selectedProject?.latestProjectVersion?.sheet1) return 0;

    const totalProgress =
      selectedProject.latestProjectVersion.sheet1.reduce(
        (sum: number, item) => {
          const itemProgress =
            ((item.sheet2?.reduce(
              (acc, curr) => acc + curr.percentInstalled,
              0,
            ) ?? 0) *
              100) /
            item.sheet2?.length;
          return sum + itemProgress;
        },
        0,
      ) / selectedProject.latestProjectVersion.sheet1.length;

    return Math.round(totalProgress);
  };

  const getCompletionStatus = (): CompletionStatus => {
    const hasProgressData =
      Object.keys(selectedProject?.latestProjectVersion?.sheet1 ?? []).length >
      0;

    return {
      progress: hasProgressData,
      blockages: true, // Always optional
    };
  };

  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    progress: false,
    blockages: false,
  });

  const isHydrated = useProjectStore?.persist?.hasHydrated();

  useEffect(() => {
    if (isHydrated) {
      setCompletionStatus(getCompletionStatus());
    }
  }, [isHydrated]);

  if (!isHydrated) return null;

  if (!selectedProject) {
    return (
      <div className="p-6 text-center">
        <Icon name="AlertCircle" size={48} color="var(--color-error)" />
        <p className="text-text-secondary mt-4">No project data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Final Review
        </h2>
        <p className="text-text-secondary mb-4">
          Review all entered data before submitting your daily workflow
        </p>
      </div>

      {/* Project Summary */}
      <div className="bg-surface border-border mb-6 rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Project Summary
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-text-primary mb-2 font-medium">
              {selectedProject.latestProjectVersion?.projectName}
            </h4>
            <div className="text-text-secondary space-y-1 text-sm">
              <p>
                <span className="font-medium">Client:</span>{" "}
                {selectedProject.latestProjectVersion?.client?.clientName}
              </p>
              <p>
                <span className="font-medium">Location:</span>{" "}
                {selectedProject.latestProjectVersion?.siteLocation?.city}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedProject.latestProjectVersion?.projectStatus}
              </p>
              <p>
                <span className="font-medium">Total Items:</span>{" "}
                {selectedProject.latestProjectVersion?.sheet1?.length ?? 0}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-text-primary mb-2 font-medium">
              Overall Current Progress(Today)
            </h4>
            <div className="flex items-center space-x-3">
              <div className="bg-muted h-3 w-full rounded-full">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calculateOverallProgress()}%` }}
                />
              </div>
              <span className="text-text-primary text-sm font-medium">
                {calculateOverallProgress()}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Completion Status */}
      <div className="bg-surface border-border mb-6 rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Workflow Completion
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className={`flex items-center space-x-3 rounded-lg p-3 ${
              completionStatus.progress
                ? "bg-success/10 border-success/20 border"
                : "bg-error/10 border-error/20 border"
            }`}
          >
            <Icon
              name={completionStatus.progress ? "CheckCircle" : "XCircle"}
              size={20}
              color={
                completionStatus.progress
                  ? "var(--color-success)"
                  : "var(--color-error)"
              }
            />
            <div>
              <p className="text-sm font-medium">Yesterday&apos;s Progress</p>
              <p className="text-text-secondary text-xs">
                {completionStatus.progress
                  ? "Completed"
                  : "Required - Missing data"}
              </p>
            </div>
          </div>

          <div className="bg-info/10 border-info/20 flex items-center space-x-3 rounded-lg border p-3">
            <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
            <div>
              <p className="text-sm font-medium">Blockage Reporting</p>
              <p className="text-text-secondary text-xs">
                {getTotalBlockages() > 0
                  ? `${getTotalBlockages()} blockages reported`
                  : "No blockages reported"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-surface border-border rounded-lg border p-4">
          <div className="mb-2 flex items-center space-x-3">
            <Icon name="Package" size={20} color="var(--color-success)" />
            <h4 className="text-text-primary font-medium">Supply & Install</h4>
          </div>
          <p className="text-text-secondary text-sm">
            Data entered for{" "}
            {
              Object.keys(selectedProject?.latestProjectVersion?.sheet1 ?? [])
                .length
            }{" "}
            of {selectedProject.latestProjectVersion?.sheet1?.length ?? 0}
            items
          </p>
        </div>

        <div className="bg-surface border-border rounded-lg border p-4">
          <div className="mb-2 flex items-center space-x-3">
            <Icon name="Camera" size={20} color="var(--color-success)" />
            <h4 className="text-text-primary font-medium">Photos</h4>
          </div>
          <p className="text-text-secondary text-sm">
            {getTotalPhotos()} number of blockage photos uploaded
          </p>
        </div>

        <div className="bg-surface border-border rounded-lg border p-4">
          <div className="mb-2 flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
            <h4 className="text-text-primary font-medium">Blockages</h4>
          </div>
          <p className="text-text-secondary text-sm">
            {getTotalBlockages()} active blockages requiring attention
          </p>
        </div>
      </div>

      {/* Ready to Submit Notification */}
      {completionStatus.progress ? (
        <div className="bg-success/10 border-success/20 mb-6 rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} color="var(--color-success)" />
            <div>
              <p className="text-success font-medium">Ready to Submit</p>
              <p className="text-success/80 text-sm">
                All required data has been entered. You can now proceed to the
                final report preview.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-error/10 border-error/20 mb-6 rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Icon name="XCircle" size={20} color="var(--color-error)" />
            <div>
              <p className="text-error font-medium">Incomplete Workflow</p>
              <p className="text-error/80 text-sm">
                Please complete all required sections before proceeding to the
                final report.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <p className="text-text-secondary mt-6 text-xs">
        Check quantities and blockages before submitting. Once submitted, the report goes for approval.
      </p>
      <div className="border-border mt-8 flex justify-between border-t pt-6">
        {/* <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={isSubmitting}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Yesterday&apos;s Progress
        </Button> */}

        <Button
          variant="default"
          size="lg"
          onClick={handleSubmit}
          disabled={!completionStatus.progress || isSubmitting}
          loading={isSubmitting}
          iconName="FileText"
          iconPosition="left"
          className="ml-auto"
        >
          {isSubmitting ? "Processing..." : "Save Final Report"}
        </Button>
      </div>
    </div>
  );
};

export default FinalReviewStep;
