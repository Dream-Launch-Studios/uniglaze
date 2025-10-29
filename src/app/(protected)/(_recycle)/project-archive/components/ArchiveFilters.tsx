import React, { useState } from "react";

import Input from "@/components/rocket/components/ui/Input";
import Select, {
  type SelectOption,
} from "@/components/rocket/components/ui/Select";
import Button from "@/components/rocket/components/ui/Button";

interface DateRange {
  start: string;
  end: string;
}

interface CompletionPercentage {
  min: string;
  max: string;
}

interface CostRange {
  min: string;
  max: string;
}

interface FiltersState {
  searchQuery: string;
  dateRange: DateRange;
  projectStatus: string;
  teamMembers: string;
  documentTypes: string;
  completionPercentage: CompletionPercentage;
  costRange: CostRange;
}

interface ArchiveFiltersProps {
  onFiltersChange: (filters: FiltersState) => void;
  onClearFilters: () => void;
}

const ArchiveFilters: React.FC<ArchiveFiltersProps> = ({
  onFiltersChange,
  onClearFilters,
}) => {
  const [filters, setFilters] = useState<FiltersState>({
    searchQuery: "",
    dateRange: { start: "", end: "" },
    projectStatus: "",
    teamMembers: "",
    documentTypes: "",
    completionPercentage: { min: "", max: "" },
    costRange: { min: "", max: "" },
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const projectStatusOptions: SelectOption[] = [
    { value: "", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "on-hold", label: "On Hold" },
    { value: "archived", label: "Archived" },
  ];

  const teamMemberOptions: SelectOption[] = [
    { value: "aditya", label: "Aditya (MD)" },
    { value: "vamsi", label: "Mr. Vamsi (HOP)" },
    { value: "rajesh", label: "Rajesh Kumar (PM)" },
    { value: "priya", label: "Priya Singh (PM)" },
    { value: "amit", label: "Amit Sharma (PM)" },
    { value: "neha", label: "Neha Patel (PM)" },
  ];

  const documentTypeOptions: SelectOption[] = [
    { value: "daily-reports", label: "Daily Reports" },
    { value: "photos", label: "Photos" },
    { value: "approvals", label: "Approvals" },
    { value: "blockages", label: "Blockages" },
    { value: "invoices", label: "Invoices" },
    { value: "contracts", label: "Contracts" },
  ];

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (type: keyof DateRange, value: string) => {
    const newDateRange = { ...filters.dateRange, [type]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRangeChange = (
    rangeType: "completionPercentage" | "costRange",
    type: "min" | "max",
    value: string,
  ) => {
    const newRange = { ...filters[rangeType], [type]: value };
    const newFilters = { ...filters, [rangeType]: newRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: FiltersState = {
      searchQuery: "",
      dateRange: { start: "", end: "" },
      projectStatus: "",
      teamMembers: "",
      documentTypes: "",
      completionPercentage: { min: "", max: "" },
      costRange: { min: "", max: "" },
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.projectStatus) count++;
    if (filters.teamMembers) count++;
    if (filters.documentTypes) count++;
    if (filters.completionPercentage.min || filters.completionPercentage.max)
      count++;
    if (filters.costRange.min || filters.costRange.max) count++;
    return count;
  };

  return (
    <div className="bg-card border-border mb-6 rounded-lg border p-4">
      {/* Search and Quick Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search projects, reports, or documents..."
              value={filters.searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange("searchQuery", e.target.value)
              }
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
            >
              Advanced Filters
              {getActiveFilterCount() > 0 && (
                <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Date Range Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                today.getDate(),
              );
              handleDateRangeChange(
                "start",
                lastMonth.toISOString().split("T")[0] ?? "",
              );
              handleDateRangeChange(
                "end",
                today.toISOString().split("T")[0] ?? "",
              );
            }}
          >
            Last Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastQuarter = new Date(
                today.getFullYear(),
                today.getMonth() - 3,
                today.getDate(),
              );
              handleDateRangeChange(
                "start",
                lastQuarter.toISOString().split("T")[0] ?? "",
              );
              handleDateRangeChange(
                "end",
                today.toISOString().split("T")[0] ?? "",
              );
            }}
          >
            Last Quarter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastYear = new Date(
                today.getFullYear() - 1,
                today.getMonth(),
                today.getDate(),
              );
              handleDateRangeChange(
                "start",
                lastYear.toISOString().split("T")[0] ?? "",
              );
              handleDateRangeChange(
                "end",
                today.toISOString().split("T")[0] ?? "",
              );
            }}
          >
            Last Year
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-border mt-6 border-t pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Date Range */}
            <div className="space-y-3">
              <h4 className="text-text-primary text-sm font-medium">
                Date Range
              </h4>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-text-secondary text-xs font-medium">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleDateRangeChange("start", e.target.value || "")
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary text-xs font-medium">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleDateRangeChange("end", e.target.value || "")
                    }
                  />
                </div>
              </div>
            </div>

            {/* Project Status */}
            <div className="space-y-3">
              <h4 className="text-text-primary text-sm font-medium">
                Project Status
              </h4>
              <Select
                options={projectStatusOptions}
                value={filters.projectStatus}
                onChange={(value: string) =>
                  handleFilterChange("projectStatus", value)
                }
                placeholder="Select status"
              />
            </div>

            {/* Team Members */}
            <div className="space-y-3">
              <h4 className="text-text-primary text-sm font-medium">
                Team Members
              </h4>
              <Select
                options={teamMemberOptions}
                value={filters.teamMembers}
                onChange={(value: string) =>
                  handleFilterChange("teamMembers", value)
                }
                placeholder="Select team member"
              />
            </div>

            {/* Document Types */}
            <div className="space-y-3">
              <h4 className="text-text-primary text-sm font-medium">
                Document Types
              </h4>
              <Select
                options={documentTypeOptions}
                value={filters.documentTypes}
                onChange={(value: string) =>
                  handleFilterChange("documentTypes", value)
                }
                placeholder="Select document type"
              />
            </div>

            {/* Completion Percentage */}
            <div className="space-y-3">
              <h4 className="text-text-primary text-sm font-medium">
                Completion %
              </h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  value={filters.completionPercentage.min}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleRangeChange(
                      "completionPercentage",
                      "min",
                      e.target.value || "",
                    )
                  }
                  min="0"
                  max="100"
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  value={filters.completionPercentage.max}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleRangeChange(
                      "completionPercentage",
                      "max",
                      e.target.value || "",
                    )
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Cost Range */}
            <div className="space-y-3">
              <h4 className="text-text-primary text-sm font-medium">
                Cost Range (₹)
              </h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters.costRange.min}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleRangeChange("costRange", "min", e.target.value || "")
                  }
                />
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters.costRange.max}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleRangeChange("costRange", "max", e.target.value || "")
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveFilters;
