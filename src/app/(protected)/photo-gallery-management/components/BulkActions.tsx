import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";

interface BulkActionsProps {
  selectedPhotos: (string | number)[];
  onBulkDelete: (photoIds: (string | number)[]) => void;
  onBulkEdit: (photoIds: (string | number)[]) => void;
  onBulkDownload: (photoIds: (string | number)[]) => void;
  onBulkAddToReport: (photoIds: (string | number)[]) => void;
  onClearSelection: () => void;
}

type BulkActionType = "download" | "add-to-report" | "edit-metadata" | "delete";

interface BulkActionOption {
  value: BulkActionType;
  label: string;
  icon: "Download" | "FileText" | "Edit" | "Trash2";
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedPhotos,
  onBulkDelete,
  onBulkEdit,
  onBulkDownload,
  onBulkAddToReport,
  onClearSelection,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);

  if (selectedPhotos.length === 0) {
    return null;
  }

  const bulkActionOptions: BulkActionOption[] = [
    { value: "download", label: "Download Selected", icon: "Download" },
    { value: "add-to-report", label: "Add to Report", icon: "FileText" },
    { value: "edit-metadata", label: "Edit Metadata", icon: "Edit" },
    { value: "delete", label: "Delete Selected", icon: "Trash2" },
  ];

  const handleBulkAction = (action: BulkActionType): void => {
    switch (action) {
      case "download":
        onBulkDownload(selectedPhotos);
        break;
      case "add-to-report":
        onBulkAddToReport(selectedPhotos);
        break;
      case "edit-metadata":
        onBulkEdit(selectedPhotos);
        break;
      case "delete":
        onBulkDelete(selectedPhotos);
        break;
      default:
        break;
    }
    setIsActionsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-300 -translate-x-1/2">
      <div className="bg-card border-border elevation-3 rounded-lg border p-4">
        <div className="flex items-center space-x-4">
          {/* Selection Info */}
          <div className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
              <Icon name="Check" size={16} color="white" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">
                {selectedPhotos.length} photo
                {selectedPhotos.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              onClick={() => onBulkDownload(selectedPhotos)}
            >
              Download
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="FileText"
              onClick={() => onBulkAddToReport(selectedPhotos)}
            >
              Add to Report
            </Button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="MoreVertical"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
              />

              {isActionsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-400"
                    onClick={() => setIsActionsOpen(false)}
                  />
                  <div className="bg-popover border-border elevation-3 absolute right-0 bottom-full z-500 mb-2 w-48 rounded-md border">
                    <div className="py-2">
                      {bulkActionOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleBulkAction(option.value)}
                          className={`transition-smooth hover:bg-muted flex w-full items-center px-4 py-2 text-sm ${
                            option.value === "delete"
                              ? "text-error hover:text-error"
                              : "text-text-primary"
                          }`}
                        >
                          <Icon name={option.icon} size={16} className="mr-3" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClearSelection}
              className="text-text-secondary"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
