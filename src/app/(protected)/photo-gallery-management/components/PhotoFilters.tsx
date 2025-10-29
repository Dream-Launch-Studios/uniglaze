/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select from "@/components/rocket/components/ui/Select";
import { api } from "@/trpc/react";

interface PhotoFilters {
  dateFrom?: string;
  dateTo?: string;
  workCategory?: string;
  orientation?: string;
  status?: string;
  teamMember?: string;
  searchQuery?: string;
}

interface PhotoFiltersProps {
  filters: PhotoFilters;
  onFiltersChange: (filters: PhotoFilters) => void;
  onClearFilters: () => void;
  totalPhotos: number;
  filteredPhotos: number;
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

const PhotoFilters: React.FC<PhotoFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalPhotos,
  filteredPhotos,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: projects, isLoading: isProjectsLoading } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  const { data: projectManagers } =
    api.project.getProjectManagersNameWithId.useQuery(undefined, {});

  // const workCategoryOptions = [
  //   { value: "all", label: "All Categories" },
  //   { value: "glazing", label: "Glazing Work" },
  //   { value: "structural", label: "Structural Work" },
  //   { value: "finishing", label: "Finishing Work" },
  //   { value: "installation", label: "Installation" },
  //   { value: "inspection", label: "Quality Inspection" },
  //   { value: "safety", label: "Safety Compliance" },
  // ];

  // const orientationOptions = [
  //   { value: "all", label: "All Orientations" },
  //   { value: "landscape", label: "Landscape" },
  //   { value: "portrait", label: "Portrait" },
  //   { value: "square", label: "Square" },
  // ];

  // const statusOptions = [
  //   { value: "all", label: "All Status" },
  //   { value: "uploaded", label: "Uploaded" },
  //   { value: "uploading", label: "Uploading" },
  //   { value: "failed", label: "Failed" },
  // ];

  // const teamMemberOptions = [
  //   { value: "all", label: "All Team Members" },
  //   { value: "rajesh-kumar", label: "Rajesh Kumar" },
  //   { value: "priya-sharma", label: "Priya Sharma" },
  //   { value: "amit-patel", label: "Amit Patel" },
  //   { value: "sunita-rao", label: "Sunita Rao" },
  //   { value: "vikram-singh", label: "Vikram Singh" },
  // ];

  const teamMemberOptions = [
    { value: "all", label: "All Team Members" },
    ...(projectManagers?.data?.map((project) => ({
      value: project.name?.toLowerCase().replace(" ", "-"),
      label: project.name,
    })) ?? []),
  ];

  const handleFilterChange = (key: keyof PhotoFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = (): boolean => {
    return !!(
      filters.dateFrom ??
      filters.dateTo ??
      (filters.workCategory && filters.workCategory !== "all") ??
      (filters.orientation && filters.orientation !== "all") ??
      (filters.status && filters.status !== "all") ??
      (filters.teamMember && filters.teamMember !== "all") ??
      filters.searchQuery
    );
  };

  return (
    <div className="bg-card border-border rounded-lg border">
      {/* Filter Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} color="var(--color-text-primary)" />
          <div>
            <h3 className="text-text-primary font-medium">Filters</h3>
            <p className="text-text-secondary text-sm">
              {filteredPhotos} of {totalPhotos} photos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClearFilters}
              className="text-text-secondary"
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconName={isCollapsed ? "ChevronDown" : "ChevronUp"}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
      </div>

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="space-y-4 p-4">
          {/* Search */}
          <div>
            <Input
              type="search"
              placeholder="Search photos by description, work item..."
              value={filters.searchQuery ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange("searchQuery", e.target.value)
              }
              className="w-full"
            />
          </div>

          {/* Date Range */}
          {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                From Date
              </label>
              <Input
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange("dateFrom", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                To Date
              </label>
              <Input
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange("dateTo", e.target.value)
                }
              />
            </div>
          </div> */}

          {/* Work Category */}
          {/* <SelectWithLabel
            label="Work Category"
            options={workCategoryOptions}
            value={filters.workCategory ?? "all"}
            onChange={(value: string) =>
              handleFilterChange("workCategory", value)
            }
          /> */}

          {/* Orientation */}
          {/* <SelectWithLabel
            label="Photo Orientation"
            options={orientationOptions}
            value={filters.orientation ?? "all"}
            onChange={(value: string) =>
              handleFilterChange("orientation", value)
            }
          /> */}

          {/* Upload Status */}
          {/* <SelectWithLabel
            label="Upload Status"
            options={statusOptions}
            value={filters.status ?? "all"}
            onChange={(value: string) => handleFilterChange("status", value)}
          /> */}

          {/* Team Member */}
          <SelectWithLabel
            label="Uploaded By"
            options={teamMemberOptions}
            value={filters.teamMember ?? "all"}
            onChange={(value: string) =>
              handleFilterChange("teamMember", value)
            }
          />

          {/* Quick Date Filters */}
          {/* <div>
            <label className="text-text-primary mb-2 block text-sm font-medium">
              Quick Filters
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0]!;
                  handleFilterChange("dateFrom", today);
                  handleFilterChange("dateTo", today);
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(
                    today.getTime() - 7 * 24 * 60 * 60 * 1000,
                  );
                  handleFilterChange(
                    "dateFrom",
                    weekAgo.toISOString().split("T")[0]!,
                  );
                  handleFilterChange(
                    "dateTo",
                    today.toISOString().split("T")[0]!,
                  );
                }}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    today.getDate(),
                  );
                  handleFilterChange(
                    "dateFrom",
                    monthAgo.toISOString().split("T")[0]!,
                  );
                  handleFilterChange(
                    "dateTo",
                    today.toISOString().split("T")[0]!,
                  );
                }}
              >
                Last Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleFilterChange("status", "failed");
                }}
              >
                Failed Uploads
              </Button>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default PhotoFilters;
export type { PhotoFilters, PhotoFiltersProps };
