import React, { useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";

interface ActionToolbarProps {
  onGenerateReport: () => void;
  onUploadPhotos: () => void;
  onMarkBlockages: () => void;
  onExportData: (format: string) => Promise<void>;
  selectedItems?: unknown[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: IconName;
  action: () => void;
  color: "primary" | "secondary" | "success" | "warning";
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onGenerateReport,
  onUploadPhotos,
  onMarkBlockages,
  onExportData,
  selectedItems = [],
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showQuickActions, setShowQuickActions] = useState<boolean>(false);

  const handleExport = async (format: string): Promise<void> => {
    setIsExporting(true);
    try {
      await onExportData(format);
    } finally {
      setIsExporting(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: "add-task",
      label: "Add Task",
      icon: "Plus",
      action: () => console.log("Add task"),
      color: "primary",
    },
    {
      id: "bulk-update",
      label: "Bulk Update",
      icon: "Edit",
      action: () => console.log("Bulk update"),
      color: "secondary",
    },
    {
      id: "assign-team",
      label: "Assign Team",
      icon: "Users",
      action: () => console.log("Assign team"),
      color: "success",
    },
    {
      id: "set-priority",
      label: "Set Priority",
      icon: "Flag",
      action: () => console.log("Set priority"),
      color: "warning",
    },
  ];

  return (
    <div className="bg-card border-border mb-6 rounded-lg border p-4">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        {/* Primary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="default"
            iconName="FileText"
            iconPosition="left"
            onClick={onGenerateReport}
            className="flex-shrink-0"
          >
            Generate Report
          </Button>

          {/* <Button
            variant="outline"
            iconName="Camera"
            iconPosition="left"
            onClick={onUploadPhotos}
            className="flex-shrink-0"
          >
            Upload Photos
          </Button> */}

          <Button
            variant="outline"
            iconName="AlertTriangle"
            iconPosition="left"
            onClick={onMarkBlockages}
            className="flex-shrink-0"
          >
            Mark Blockages
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              loading={isExporting}
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex-shrink-0"
            >
              Export Data
            </Button>

            {showQuickActions && (
              <>
                <div
                  className="fixed inset-0 z-200"
                  onClick={() => setShowQuickActions(false)}
                />
                <div className="bg-popover border-border elevation-3 absolute top-full left-0 z-300 mt-2 w-48 rounded-md border">
                  <div className="py-2">
                    <button
                      onClick={() => handleExport("excel")}
                      className="text-text-primary hover:bg-muted transition-smooth flex w-full items-center px-4 py-2 text-sm"
                    >
                      <Icon name="FileSpreadsheet" size={16} className="mr-3" />
                      Export to Excel
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="text-text-primary hover:bg-muted transition-smooth flex w-full items-center px-4 py-2 text-sm"
                    >
                      <Icon name="FileText" size={16} className="mr-3" />
                      Export to PDF
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="text-text-primary hover:bg-muted transition-smooth flex w-full items-center px-4 py-2 text-sm"
                    >
                      <Icon name="File" size={16} className="mr-3" />
                      Export to CSV
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Secondary Actions & Info */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedItems.length > 0 && (
            <div className="bg-primary/10 text-primary flex items-center space-x-2 rounded-md px-3 py-1">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}{" "}
                selected
              </span>
            </div>
          )}

          {/* Quick Actions for Selected Items */}
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  iconName={action.icon}
                  onClick={action.action}
                  title={action.label}
                  className="flex-shrink-0"
                />
              ))}
            </div>
          )}

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            onClick={() => window.location.reload()}
            title="Refresh Data"
            className="flex-shrink-0"
          />

          {/* Settings */}
          {/* <Button
            variant="ghost"
            size="sm"
            iconName="Settings"
            title="Table Settings"
            className="flex-shrink-0"
          /> */}
        </div>
      </div>

      {/* Progress Summary Bar */}
      <div className="border-border mt-4 border-t pt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-text-secondary">Overall Project Progress</span>
          <span className="text-text-primary font-medium">67%</span>
        </div>
        <div className="bg-muted h-2 w-full rounded-full">
          <div
            className="from-primary to-accent h-2 rounded-full bg-gradient-to-r transition-all duration-500"
            style={{ width: "67%" }}
          ></div>
        </div>
        <div className="text-text-secondary mt-2 flex items-center justify-between text-xs">
          <span>Started: 15 Jan 2025</span>
          <span>Due: 30 Mar 2025</span>
        </div>
      </div>
    </div>
  );
};

export default ActionToolbar;
