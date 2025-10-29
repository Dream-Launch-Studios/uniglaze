import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";

interface ReportActionBarProps {
  onSaveDraft: () => void;
  onPreviewReport: () => void;
  onSubmitForApproval: () => void;
  hasUnsavedChanges: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  userRole?: "PM" | "HOP" | "MD";
}

const ReportActionBar: React.FC<ReportActionBarProps> = ({
  onSaveDraft,
  onPreviewReport,
  onSubmitForApproval,
  hasUnsavedChanges,
  isSubmitting,
  canSubmit,
  userRole = "PM",
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const handleSubmitClick = (): void => {
    if (canSubmit) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = (): void => {
    onSubmitForApproval();
    setShowConfirmDialog(false);
  };

  const getSubmitButtonText = (): string => {
    if (isSubmitting) return "Submitting...";
    if (userRole === "MD") return "Approve & Finalize";
    if (userRole === "HOP") return "Review & Approve";
    return "Submit for Approval";
  };

  const getSubmitButtonIcon = () => {
    if (isSubmitting) return "Loader";
    if (userRole === "MD" || userRole === "HOP") return "CheckCircle";
    return "Send";
  };

  return (
    <>
      <div className="bg-surface border-border fixed right-0 bottom-0 left-0 z-50 border-t p-4 md:left-60">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left side - Status indicators */}
          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <div className="text-warning flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
            )}

            <div className="text-text-secondary hidden items-center space-x-2 md:flex">
              <Icon name="Clock" size={16} />
              <span className="text-sm">
                Last saved: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Save Draft Button */}
            <Button
              variant="outline"
              iconName="Save"
              iconPosition="left"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="hidden md:flex"
            >
              Save Draft
            </Button>

            {/* Preview Button */}
            <Button
              variant="secondary"
              iconName="Eye"
              iconPosition="left"
              onClick={onPreviewReport}
              disabled={isSubmitting}
            >
              <span className="hidden md:inline">Preview Report</span>
              <span className="md:hidden">Preview</span>
            </Button>

            {/* Submit Button */}
            <Button
              variant={userRole === "PM" ? "default" : "success"}
              iconName={getSubmitButtonIcon()}
              iconPosition="left"
              onClick={handleSubmitClick}
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
            >
              <span className="hidden md:inline">{getSubmitButtonText()}</span>
              <span className="md:hidden">
                {isSubmitting ? "Submitting..." : "Submit"}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile-only save draft button */}
        <div className="border-border mt-3 border-t pt-3 md:hidden">
          <Button
            variant="ghost"
            iconName="Save"
            iconPosition="left"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            fullWidth
          >
            Save Draft
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/50"
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <div className="bg-surface border-border elevation-3 w-full max-w-md rounded-lg border p-6">
              <div className="mb-4 flex items-center space-x-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon name="Send" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 className="text-text-primary text-lg font-semibold">
                    Confirm Submission
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {userRole === "PM"
                      ? "Submit this report for approval?"
                      : "Approve and finalize this report?"}
                  </p>
                </div>
              </div>

              <div className="bg-muted mb-6 rounded-lg p-4">
                <h4 className="text-text-primary mb-2 text-sm font-medium">
                  Report Summary:
                </h4>
                <ul className="text-text-secondary space-y-1 text-sm">
                  <li>• Work items updated with progress data</li>
                  <li>• Photos uploaded and documented</li>
                  <li>• All required fields completed</li>
                  {userRole === "PM" && (
                    <li>• Report will be sent to HOP for review</li>
                  )}
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant={userRole === "PM" ? "default" : "success"}
                  iconName={getSubmitButtonIcon()}
                  iconPosition="left"
                  onClick={handleConfirmSubmit}
                  fullWidth
                >
                  {userRole === "PM" ? "Submit" : "Approve"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Validation Messages */}
      {/* {!canSubmit && (
        <div className="bg-warning/10 border-warning fixed right-4 bottom-20 left-4 z-40 rounded-lg border p-3 md:right-4 md:left-64">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
            <div>
              <p className="text-warning text-sm font-medium">
                Cannot submit report
              </p>
              <p className="text-warning/80 text-xs">
                Please complete all required fields and upload at least one
                photo per work item.
              </p>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default ReportActionBar;
