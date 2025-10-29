import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select, {
  type SelectOption,
} from "@/components/rocket/components/ui/Select";

interface WorkItem {
  id: string | number;
  name: string;
  description: string;
  unit: string;
  location: string;
  category: string;
  total_quantity: number;
  completed_quantity: number;
  progress_percentage?: number;
  status: "not_started" | "in_progress" | "completed" | "on_hold" | "blocked";
}

interface Filters {
  status?: string;
  location?: string;
  category?: string;
}

interface WorkItemSelectorProps {
  workItems: WorkItem[];
  selectedItems: (string | number)[];
  onSelectionChange: (selection: (string | number)[]) => void;
  onFilterChange: (filters: Filters) => void;
  filters?: Filters;
}

const WorkItemSelector: React.FC<WorkItemSelectorProps> = ({
  workItems,
  selectedItems,
  onSelectionChange,
  onFilterChange,
  filters = {},
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const statusOptions: SelectOption[] = [
    { value: "", label: "All Status" },
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "blocked", label: "Blocked" },
  ];

  const locationOptions: SelectOption[] = [
    { value: "", label: "All Locations" },
    ...Array.from(
      new Set(workItems.map((item: WorkItem) => item.location)),
    ).map((location: string) => ({ value: location, label: location })),
  ];

  const categoryOptions: SelectOption[] = [
    { value: "", label: "All Categories" },
    ...Array.from(
      new Set(workItems.map((item: WorkItem) => item.category)),
    ).map((category: string) => ({ value: category, label: category })),
  ];

  const filteredItems = workItems.filter((item: WorkItem) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesLocation =
      !filters.location || item.location === filters.location;
    const matchesCategory =
      !filters.category || item.category === filters.category;

    return matchesSearch && matchesStatus && matchesLocation && matchesCategory;
  });

  const handleItemToggle = (itemId: string | number): void => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter((id: string | number) => id !== itemId)
      : [...selectedItems, itemId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = (): void => {
    const allFilteredIds = filteredItems.map((item: WorkItem) => item.id);
    onSelectionChange(allFilteredIds);
  };

  const handleDeselectAll = (): void => {
    onSelectionChange([]);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 50) return "text-warning";
    return "text-error";
  };

  const getStatusBadgeColor = (status: WorkItem["status"]): string => {
    const colors = {
      not_started: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      on_hold: "bg-yellow-100 text-yellow-800",
      blocked: "bg-red-100 text-red-800",
    };
    return colors[status] ?? "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-surface border-border rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-xl font-semibold">
            Select Work Items
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Choose items to update in today&apos;s progress report
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-text-secondary text-sm">
            {selectedItems.length} of {filteredItems.length} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconName="Filter"
            iconSize={16}
            onClick={() => setShowFilters(!showFilters)}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Input
          type="search"
          placeholder="Search work items..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="w-full"
        />

        {showFilters && (
          <div className="bg-muted grid grid-cols-1 gap-4 rounded-lg p-4 md:grid-cols-3">
            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Status
              </label>
              <Select
                options={statusOptions}
                value={filters.status ?? ""}
                onChange={(value: string) =>
                  onFilterChange({ ...filters, status: value })
                }
              />
            </div>

            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Location
              </label>
              <Select
                options={locationOptions}
                value={filters.location ?? ""}
                onChange={(value: string) =>
                  onFilterChange({ ...filters, location: value })
                }
              />
            </div>

            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Category
              </label>
              <Select
                options={categoryOptions}
                value={filters.category ?? ""}
                onChange={(value: string) =>
                  onFilterChange({ ...filters, category: value })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={filteredItems.length === 0}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={selectedItems.length === 0}
          >
            Deselect All
          </Button>
        </div>

        <div className="text-text-secondary text-sm">
          {filteredItems.length} items found
        </div>
      </div>

      {/* Work Items List */}
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {filteredItems.map((item: WorkItem) => {
          const isSelected = selectedItems.includes(item.id);
          const progress =
            Math.round((item.completed_quantity / item.total_quantity) * 100) ||
            0;

          return (
            <div
              key={item.id}
              className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              onClick={() => handleItemToggle(item.id)}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <div className="mt-1 flex-shrink-0">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border bg-surface"
                    }`}
                  >
                    {isSelected && (
                      <Icon name="Check" size={12} color="white" />
                    )}
                  </div>
                </div>

                {/* Item Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-text-primary font-medium">
                        {item.name}
                      </h3>
                      <p className="text-text-secondary mt-1 text-sm">
                        {item.description}
                      </p>

                      <div className="text-text-secondary mt-2 flex items-center space-x-4 text-xs">
                        <span>📍 {item.location}</span>
                        <span>📦 {item.category}</span>
                        <span>
                          📏 {item.total_quantity} {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {/* Status Badge */}
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(item.status)}`}
                      >
                        {item.status
                          .replace("_", " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>

                      {/* Progress */}
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${getProgressColor(progress)}`}
                        >
                          {progress}%
                        </div>
                        <div className="bg-muted mt-1 h-1 w-16 rounded-full">
                          <div
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Icon name="Search" size={24} color="var(--color-text-secondary)" />
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-medium">
            No items found
          </h3>
          <p className="text-text-secondary">
            Try adjusting your search terms or filters to find work items.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkItemSelector;
export type { WorkItem, WorkItemSelectorProps, Filters };
