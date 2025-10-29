import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import { Checkbox } from "@/components/rocket/components/ui/Checkbox";
import Select, {
  type SelectOption,
} from "@/components/rocket/components/ui/Select";
import Input from "@/components/rocket/components/ui/Input";

interface Project {
  id: string;
  name: string;
  // Add other project properties as needed
}

interface ExportConfig {
  format: string;
  includeReports: boolean;
  includePhotos: boolean;
  includeTimeline: boolean;
  includeAnalytics: boolean;
  dateRange: { start: string; end: string };
  reportTypes: string[];
  compression: string;
}

interface ExportData {
  projects: Project[];
  config: ExportConfig;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjects: Project[];
  onExport: (data: ExportData) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  selectedProjects,
  onExport,
}) => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: "pdf",
    includeReports: true,
    includePhotos: false,
    includeTimeline: true,
    includeAnalytics: true,
    dateRange: { start: "", end: "" },
    reportTypes: [],
    compression: "medium",
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const formatOptions: SelectOption[] = [
    { value: "pdf", label: "PDF Document" },
    { value: "excel", label: "Excel Spreadsheet" },
    { value: "zip", label: "ZIP Archive" },
    { value: "json", label: "JSON Data" },
  ];

  const compressionOptions: SelectOption[] = [
    { value: "low", label: "Low (Best Quality)" },
    { value: "medium", label: "Medium (Balanced)" },
    { value: "high", label: "High (Smallest Size)" },
  ];

  const reportTypeOptions: SelectOption[] = [
    { value: "daily", label: "Daily Reports" },
    { value: "weekly", label: "Weekly Summaries" },
    { value: "monthly", label: "Monthly Reports" },
    { value: "final", label: "Final Reports" },
  ];

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    onExport({
      projects: selectedProjects,
      config: exportConfig,
    });

    setIsExporting(false);
    onClose();
  };

  const getEstimatedSize = (): number => {
    const baseSize = selectedProjects.length * 2; // 2MB per project base
    const photosSize = exportConfig.includePhotos
      ? selectedProjects.length * 10
      : 0; // 10MB per project for photos
    const reportsSize = exportConfig.includeReports
      ? selectedProjects.length * 1
      : 0; // 1MB per project for reports

    const totalSize = baseSize + photosSize + reportsSize;
    const compressionFactor =
      exportConfig.compression === "high"
        ? 0.3
        : exportConfig.compression === "medium"
          ? 0.6
          : 1;

    return Math.round(totalSize * compressionFactor);
  };

  const handleReportTypeChange = (value: string): void => {
    // Convert single select to array handling for report types
    const currentTypes = exportConfig.reportTypes;
    const newTypes = currentTypes.includes(value)
      ? currentTypes.filter((type) => type !== value)
      : [...currentTypes, value];

    setExportConfig((prev) => ({ ...prev, reportTypes: newTypes }));
  };

  return (
    <div className="fixed inset-0 z-500 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="bg-background elevation-3 absolute inset-4 mx-auto flex max-w-2xl flex-col rounded-lg md:inset-x-1/4 md:inset-y-8">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-6">
          <div>
            <h1 className="text-text-primary text-xl font-bold">
              Export Projects
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              {selectedProjects.length} project
              {selectedProjects.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-auto p-6">
          {/* Export Format */}
          <div>
            <h3 className="text-text-primary mb-3 text-lg font-semibold">
              Export Format
            </h3>
            <Select
              options={formatOptions}
              value={exportConfig.format}
              onChange={(value: string) =>
                setExportConfig((prev) => ({ ...prev, format: value }))
              }
              placeholder="Select format"
            />
          </div>

          {/* Content Options */}
          <div>
            <h3 className="text-text-primary mb-3 text-lg font-semibold">
              Include Content
            </h3>
            <div className="space-y-3">
              <Checkbox
                label="Project Reports"
                description="Include all submitted daily and final reports"
                checked={exportConfig.includeReports}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExportConfig((prev) => ({
                    ...prev,
                    includeReports: e.target.checked,
                  }))
                }
              />

              <Checkbox
                label="Photo Gallery"
                description="Include all project photos (increases file size significantly)"
                checked={exportConfig.includePhotos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExportConfig((prev) => ({
                    ...prev,
                    includePhotos: e.target.checked,
                  }))
                }
              />

              <Checkbox
                label="Project Timeline"
                description="Include milestone and progress timeline data"
                checked={exportConfig.includeTimeline}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExportConfig((prev) => ({
                    ...prev,
                    includeTimeline: e.target.checked,
                  }))
                }
              />

              <Checkbox
                label="Analytics & Metrics"
                description="Include performance analytics and completion metrics"
                checked={exportConfig.includeAnalytics}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExportConfig((prev) => ({
                    ...prev,
                    includeAnalytics: e.target.checked,
                  }))
                }
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="text-text-primary mb-3 text-lg font-semibold">
              Date Range (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={exportConfig.dateRange.start}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  End Date
                </label>
                <Input
                  type="date"
                  value={exportConfig.dateRange.end}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Report Types Filter */}
          {exportConfig.includeReports && (
            <div>
              <h3 className="text-text-primary mb-3 text-lg font-semibold">
                Report Types
              </h3>
              <p className="text-text-secondary mb-3 text-sm">
                Select report types to include (all will be included if none
                selected)
              </p>
              <div className="space-y-2">
                {reportTypeOptions.map((option) => (
                  <Checkbox
                    key={option.value}
                    label={option.label}
                    checked={exportConfig.reportTypes.includes(option.value)}
                    onChange={() => handleReportTypeChange(option.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Compression Settings */}
          {exportConfig.includePhotos && (
            <div>
              <h3 className="text-text-primary mb-3 text-lg font-semibold">
                Compression
              </h3>
              <Select
                options={compressionOptions}
                value={exportConfig.compression}
                onChange={(value: string) =>
                  setExportConfig((prev) => ({ ...prev, compression: value }))
                }
                placeholder="Select compression level"
              />
            </div>
          )}

          {/* Export Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-text-primary mb-2 font-medium">
              Export Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Projects:</span>
                <span className="font-medium">{selectedProjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Format:</span>
                <span className="font-medium uppercase">
                  {exportConfig.format}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Estimated Size:</span>
                <span className="font-medium">{getEstimatedSize()} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Processing Time:</span>
                <span className="font-medium">
                  ~{Math.ceil(getEstimatedSize() / 10)} minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-between border-t p-6">
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <Icon name="Info" size={16} />
            <span>Export will be downloaded to your device</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              loading={isExporting}
              iconName="Download"
              iconPosition="left"
            >
              {isExporting ? "Exporting..." : "Export Projects"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
