import React from "react";
import { Checkbox } from "@/components/rocket/components/ui/Checkbox";
import Select from "@/components/rocket/components/ui/Select";
import Button from "@/components/rocket/components/ui/Button";
import { api } from "@/trpc/react";

// Type definitions
interface FilterState {
  project: string;
  category: string;
  status: string;
  severity: string;
  dateRange: string;
  clientVisible: boolean;
  internalOnly: boolean;
  overdue: boolean;
}

interface BlockageFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | boolean) => void;
  onClearFilters: () => void;
  onAddBlockage: () => void;
}

// Select wrapper component with label support
const SelectWithLabel: React.FC<{
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ label, options, value, onChange, className }) => (
  <div className={className}>
    <label className="text-text-primary mb-2 block text-sm font-medium">
      {label}
    </label>
    <Select options={options} value={value} onChange={onChange} />
  </div>
);

const BlockageFilters: React.FC<BlockageFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onAddBlockage,
}) => {
  const { data: projects, isLoading: isProjectsLoading } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "client", label: "Client-side Issues" },
    { value: "internal", label: "Internal Issues" },
    { value: "supplier", label: "Supplier Issues" },
    { value: "weather", label: "Weather Related" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "pending-approval", label: "Pending Approval" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const severityOptions = [
    { value: "all", label: "All Severity" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const projectOptions = [
    { value: "all", label: "All Projects" },
    //   { value: "project-1", label: "Prestige Tech Park - Phase 2" },
    //   { value: "project-2", label: "Brigade Gateway Mall" },
    //   { value: "project-3", label: "Embassy Manyata" },
    //   { value: "project-4", label: "RMZ Ecospace" },
  ];

  projectOptions.push(
    ...(projects?.data?.map((project) => ({
      value: project.latestProjectVersion?.projectName.toLowerCase() ?? "",
      label: project.latestProjectVersion?.projectName ?? "",
    })) ?? []),
  );

  return (
    <div className="bg-card border-border h-fit rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="RotateCcw"
          iconSize={16}
          onClick={onClearFilters}
          className="text-text-secondary hover:text-text-primary"
        >
          Clear
        </Button>
      </div>

      <div className="space-y-6">
        {/* Quick Add Button */}
        {/* <Button
          variant="default"
          fullWidth
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
          onClick={onAddBlockage}
          className="mb-6"
        >
          Report New Blockage
        </Button> */}

        {/* Project Filter */}
        <div>
          <SelectWithLabel
            label="Project"
            options={projectOptions}
            value={filters.project}
            onChange={(value) => onFilterChange("project", value)}
            className="mb-4"
          />
        </div>

        {/* Category Filter */}
        {/* <div>
          <SelectWithLabel
            label="Category"
            options={categoryOptions}
            value={filters.category}
            onChange={(value) => onFilterChange("category", value)}
            className="mb-4"
          />
        </div> */}

        {/* Status Filter */}
        {/* <div>
          <SelectWithLabel
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            className="mb-4"
          />
        </div> */}

        {/* Severity Filter */}
        {/* <div>
          <SelectWithLabel
            label="Severity"
            options={severityOptions}
            value={filters.severity}
            onChange={(value) => onFilterChange("severity", value)}
            className="mb-4"
          />
        </div> */}

        {/* Date Range Filters */}
        {/* <div className="border-border border-t pt-4">
          <h4 className="text-text-primary mb-3 text-sm font-medium">
            Date Range
          </h4>
          <div className="space-y-3">
            <Checkbox
              label="Last 7 days"
              checked={filters.dateRange === "7days"}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFilterChange("dateRange", e.target.checked ? "7days" : "all")
              }
            />
            <Checkbox
              label="Last 30 days"
              checked={filters.dateRange === "30days"}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFilterChange("dateRange", e.target.checked ? "30days" : "all")
              }
            />
            <Checkbox
              label="This month"
              checked={filters.dateRange === "thisMonth"}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFilterChange(
                  "dateRange",
                  e.target.checked ? "thisMonth" : "all",
                )
              }
            />
          </div>
        </div> */}

        {/* Visibility Options */}
        {/* <div className="border-border border-t pt-4">
          <h4 className="text-text-primary mb-3 text-sm font-medium">
            Visibility
          </h4>
          <div className="space-y-3">
            <Checkbox
              label="Show client-visible only"
              checked={filters.clientVisible}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFilterChange("clientVisible", e.target.checked)
              }
            />
            <Checkbox
              label="Show internal only"
              checked={filters.internalOnly}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFilterChange("internalOnly", e.target.checked)
              }
            />
            <Checkbox
              label="Show overdue items"
              checked={filters.overdue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFilterChange("overdue", e.target.checked)
              }
            />
          </div>
        </div> */}

        {/* Statistics */}
        {/* <div className="border-border border-t pt-4">
          <h4 className="text-text-primary mb-3 text-sm font-medium">
            Quick Stats
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Active:</span>
              <span className="text-text-primary font-medium">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Critical:</span>
              <span className="text-error font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Overdue:</span>
              <span className="text-warning font-medium">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Resolved Today:</span>
              <span className="text-success font-medium">2</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default BlockageFilters;
export type { BlockageFiltersProps, FilterState };
