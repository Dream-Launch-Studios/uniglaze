import React, { useState, useEffect } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select, {
  type SelectOption,
} from "@/components/rocket/components/ui/Select";

// Define proper types for work items
interface WorkItem {
  id: string | number;
  name: string;
  description: string;
  unit: string;
  location: string;
  total_quantity: number;
  completed_quantity: number;
  progress_percentage?: number;
  status: "not_started" | "in_progress" | "completed" | "on_hold" | "blocked";
}

interface DataEntryPanelProps {
  workItems: WorkItem[];
  onUpdateItem: (itemId: string | number, updates: Partial<WorkItem>) => void;
  onSaveDraft: () => void;
  isTimeRestricted: boolean;
  selectedDate: string;
}

type LocalUpdates = Record<string | number, Partial<WorkItem>>;

const DataEntryPanel: React.FC<DataEntryPanelProps> = ({
  workItems,
  onUpdateItem,
  onSaveDraft,
  isTimeRestricted,
  selectedDate,
}) => {
  const [editingItem, setEditingItem] = useState<string | number | null>(null);
  const [localUpdates, setLocalUpdates] = useState<LocalUpdates>({});

  const statusOptions: SelectOption[] = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "blocked", label: "Blocked" },
  ];

  const handleInlineEdit = (
    itemId: string | number,
    field: keyof WorkItem,
    value: string | number,
  ) => {
    const updatedItem = workItems.find((item) => item.id === itemId);

    if (!updatedItem) return;

    // Validate progress values
    if (field === "completed_quantity" || field === "progress_percentage") {
      const maxValue =
        field === "progress_percentage" ? 100 : updatedItem.total_quantity;
      if (typeof value === "number" && value > maxValue) {
        return;
      }
    }

    setLocalUpdates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));

    onUpdateItem(itemId, { [field]: value } as Partial<WorkItem>);
  };

  const handleStatusChange = (itemId: string | number, status: string) => {
    onUpdateItem(itemId, { status: status as WorkItem["status"] });
    setEditingItem(null);
  };

  const getStatusColor = (status: WorkItem["status"]): string => {
    const colors: Record<WorkItem["status"], string> = {
      not_started: "text-gray-500",
      in_progress: "text-blue-600",
      completed: "text-green-600",
      on_hold: "text-yellow-600",
      blocked: "text-red-600",
    };
    return colors[status] ?? "text-gray-500";
  };

  const calculateProgress = (completed: number, total: number): number => {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const isEditingAllowed = (): boolean => {
    if (isTimeRestricted) {
      const now = new Date();
      const currentHour = now.getHours();
      return currentHour >= 10 && currentHour < 11;
    }
    return true;
  };

  return (
    <div className="bg-surface border-border rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-xl font-semibold">
            Work Items Progress
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Update quantities and status for {selectedDate}
          </p>
        </div>

        {!isEditingAllowed() && (
          <div className="bg-warning/10 text-warning flex items-center space-x-2 rounded-md px-3 py-2">
            <Icon name="Clock" size={16} />
            <span className="text-sm font-medium">
              Entry allowed 10-11 AM only
            </span>
          </div>
        )}
      </div>

      {/* Table Header */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="bg-muted border-border text-text-secondary grid grid-cols-12 gap-4 rounded-t-lg border-b p-4 text-sm font-medium">
            <div className="col-span-3">Work Item</div>
            <div className="col-span-2">Total Qty</div>
            <div className="col-span-2">Completed</div>
            <div className="col-span-2">Progress %</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Body */}
          <div className="space-y-2">
            {workItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface border-border hover:bg-muted/50 transition-smooth grid grid-cols-12 gap-4 rounded-lg border p-4"
              >
                {/* Work Item Name */}
                <div className="col-span-3">
                  <div className="text-text-primary font-medium">
                    {item.name}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {item.description}
                  </div>
                  <div className="text-text-secondary mt-1 text-xs">
                    Unit: {item.unit} | Location: {item.location}
                  </div>
                </div>

                {/* Total Quantity */}
                <div className="col-span-2 flex items-center">
                  <span className="text-text-primary font-medium">
                    {item.total_quantity} {item.unit}
                  </span>
                </div>

                {/* Completed Quantity */}
                <div className="col-span-2">
                  {isEditingAllowed() ? (
                    <Input
                      type="number"
                      value={String(
                        localUpdates[item.id]?.completed_quantity ??
                          item.completed_quantity,
                      )}
                      onChange={(e) =>
                        handleInlineEdit(
                          item.id,
                          "completed_quantity",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full"
                      min="0"
                      max={item.total_quantity}
                      step="0.1"
                    />
                  ) : (
                    <span className="text-text-primary font-medium">
                      {item.completed_quantity} {item.unit}
                    </span>
                  )}
                </div>

                {/* Progress Percentage */}
                <div className="col-span-2 flex items-center">
                  <div className="w-full">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-text-primary text-sm font-medium">
                        {calculateProgress(
                          item.completed_quantity,
                          item.total_quantity,
                        )}
                        %
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateProgress(item.completed_quantity, item.total_quantity)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  {isEditingAllowed() ? (
                    <Select
                      options={statusOptions}
                      value={item.status}
                      onChange={(value) => handleStatusChange(item.id, value)}
                      className="w-full"
                    />
                  ) : (
                    <span
                      className={`text-sm font-medium ${getStatusColor(item.status)}`}
                    >
                      {statusOptions.find((opt) => opt.value === item.status)
                        ?.label ?? "Unknown"}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="MoreVertical"
                    iconSize={16}
                    onClick={() =>
                      setEditingItem(editingItem === item.id ? null : item.id)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="text-text-secondary text-sm">Total Items</div>
          <div className="text-text-primary text-2xl font-semibold">
            {workItems.length}
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="text-text-secondary text-sm">Completed</div>
          <div className="text-success text-2xl font-semibold">
            {workItems.filter((item) => item.status === "completed").length}
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="text-text-secondary text-sm">In Progress</div>
          <div className="text-primary text-2xl font-semibold">
            {workItems.filter((item) => item.status === "in_progress").length}
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="text-text-secondary text-sm">Blocked</div>
          <div className="text-error text-2xl font-semibold">
            {workItems.filter((item) => item.status === "blocked").length}
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-text-secondary flex items-center space-x-2 text-sm">
          <Icon name="Save" size={16} />
          <span>Auto-saving changes...</span>
        </div>

        <Button
          variant="outline"
          iconName="Save"
          iconPosition="left"
          onClick={onSaveDraft}
          disabled={!isEditingAllowed()}
        >
          Save Draft
        </Button>
      </div>
    </div>
  );
};

export default DataEntryPanel;
