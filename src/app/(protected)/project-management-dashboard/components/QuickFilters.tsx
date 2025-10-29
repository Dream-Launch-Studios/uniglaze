import React from "react";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";

interface FilterOption {
  id: string;
  label: string;
  icon: IconName;
  count: number;
}

interface StatusFilter {
  id: string;
  label: string;
  color: "error" | "warning" | "success";
}

interface ActiveFilters {
  status?: string;
  priority?: string;
  dateRange?: string;
}

interface QuickFiltersProps {
  activeFilters: ActiveFilters;
  onFilterChange: (
    type: "status" | "priority" | "dateRange" | "clear",
    value?: string,
  ) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilters,
  onFilterChange,
}) => {
  const filterOptions: FilterOption[] = [
    { id: "all", label: "All Items", icon: "List", count: 45 },
    { id: "pending", label: "Pending Supply", icon: "Clock", count: 12 },
    { id: "in-progress", label: "In Progress", icon: "Play", count: 18 },
    { id: "completed", label: "Completed", icon: "CheckCircle", count: 15 },
    { id: "blocked", label: "Blocked", icon: "AlertTriangle", count: 3 },
    { id: "client-visible", label: "Client Visible", icon: "Eye", count: 32 },
    { id: "internal-only", label: "Internal Only", icon: "EyeOff", count: 13 },
  ];

  const statusFilters: StatusFilter[] = [
    { id: "high-priority", label: "High Priority", color: "error" },
    { id: "medium-priority", label: "Medium Priority", color: "warning" },
    { id: "low-priority", label: "Low Priority", color: "success" },
  ];

  return (
    <div className="bg-card border-border rounded-lg border p-4">
      <div className="mb-4 flex items-center space-x-2">
        <Icon name="Filter" size={20} color="var(--color-primary)" />
        <h3 className="text-text-primary text-lg font-semibold">
          Quick Filters
        </h3>
      </div>

      <div className="space-y-4">
        {/* Main Filters */}
        <div>
          <h4 className="text-text-secondary mb-2 text-sm font-medium">
            Status
          </h4>
          <div className="space-y-1">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange("status", filter.id)}
                className={`transition-smooth flex w-full items-center justify-between rounded-md p-2 text-sm ${
                  activeFilters.status === filter.id
                    ? "bg-primary/10 text-primary border-primary/20 border"
                    : "text-text-primary hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon name={filter.icon} size={16} />
                  <span>{filter.label}</span>
                </div>
                <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filters */}
        <div>
          <h4 className="text-text-secondary mb-2 text-sm font-medium">
            Priority
          </h4>
          <div className="space-y-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange("priority", filter.id)}
                className={`transition-smooth flex w-full items-center space-x-2 rounded-md p-2 text-sm ${
                  activeFilters.priority === filter.id
                    ? `bg-${filter.color}/10 text-${filter.color} border border-${filter.color}/20`
                    : "text-text-primary hover:bg-muted"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full bg-${filter.color}`}
                ></div>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h4 className="text-text-secondary mb-2 text-sm font-medium">
            Date Range
          </h4>
          <div className="space-y-2">
            <Button
              variant={
                activeFilters.dateRange === "today" ? "default" : "ghost"
              }
              size="sm"
              fullWidth
              onClick={() => onFilterChange("dateRange", "today")}
            >
              Today
            </Button>
            <Button
              variant={activeFilters.dateRange === "week" ? "default" : "ghost"}
              size="sm"
              fullWidth
              onClick={() => onFilterChange("dateRange", "week")}
            >
              This Week
            </Button>
            <Button
              variant={
                activeFilters.dateRange === "month" ? "default" : "ghost"
              }
              size="sm"
              fullWidth
              onClick={() => onFilterChange("dateRange", "month")}
            >
              This Month
            </Button>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="border-border border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="X"
            iconPosition="left"
            onClick={() => onFilterChange("clear")}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;
