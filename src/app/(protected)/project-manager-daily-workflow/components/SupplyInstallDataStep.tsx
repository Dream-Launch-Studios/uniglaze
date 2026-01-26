import React, { useState, useEffect } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Icon from "@/components/rocket/components/AppIcon";

// Type definitions
export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  totalQuantity: number;
  unit: string;
  currentSupplied?: number;
  currentInstalled?: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  location: string;
  progress: number;
  items?: ProjectItem[];
}

export interface SupplyInstallItemData {
  suppliedTillNow: number;
  installedTillNow: number;
}

export type SupplyInstallFormData = Record<string, SupplyInstallItemData>;

export interface SupplyInstallDataStepProps {
  selectedProject: Project | null;
  supplyInstallData: SupplyInstallFormData | null;
  onDataUpdate: (data: SupplyInstallFormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SupplyInstallDataStep: React.FC<SupplyInstallDataStepProps> = ({
  selectedProject,
  supplyInstallData,
  onDataUpdate,
  onNext,
  onPrevious,
}) => {
  const [formData, setFormData] = useState<SupplyInstallFormData>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (supplyInstallData) {
      setFormData(supplyInstallData);
    }
  }, [supplyInstallData]);

  useEffect(() => {
    // Validate that all items have supply and install data
    const isValidForm = selectedProject?.items?.every((item: ProjectItem) => {
      const itemData = formData[item.id];
      return (
        itemData &&
        typeof itemData.suppliedTillNow === "number" &&
        typeof itemData.installedTillNow === "number" &&
        itemData.suppliedTillNow >= 0 &&
        itemData.installedTillNow >= 0 &&
        itemData.installedTillNow <= itemData.suppliedTillNow
      );
    });
    setIsValid(isValidForm ?? false);
  }, [formData, selectedProject]);

  const handleInputChange = (
    itemId: string,
    field: keyof SupplyInstallItemData,
    value: string,
  ) => {
    const numericValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [itemId]: {
        suppliedTillNow: 0,
        installedTillNow: 0,
        ...prev[itemId],
        [field]: numericValue,
      },
    }));
  };

  const handleSave = () => {
    onDataUpdate(formData);
    onNext();
  };

  const calculateProgress = (current: number, total: number): number => {
    return total > 0 ? +((current / total) * 100).toFixed(2) : 0;
  };

  if (!selectedProject) {
    return (
      <div className="p-6 text-center">
        <Icon name="AlertCircle" size={48} color="var(--color-error)" />
        <p className="text-text-secondary mt-4">No project selected</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Supply & Install Data
        </h2>
        <p className="text-text-secondary mb-4">
          Enter the current supply and installation quantities for each project
          item
        </p>
        <div className="bg-info/10 border-info/20 rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={16} color="var(--color-info)" />
            <p className="text-info text-sm">
              <span className="font-medium">Project:</span>{" "}
              {selectedProject.name} - {selectedProject.client}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {selectedProject.items?.map((item: ProjectItem, index: number) => {
          const itemData = formData[item.id] ?? {
            suppliedTillNow: 0,
            installedTillNow: 0,
          };
          const suppliedTillNow =
            itemData.suppliedTillNow ?? item.currentSupplied ?? 0;
          const installedTillNow =
            itemData.installedTillNow ?? item.currentInstalled ?? 0;

          const supplyProgress = calculateProgress(
            suppliedTillNow,
            item.totalQuantity,
          );
          const installProgress = calculateProgress(
            installedTillNow,
            item.totalQuantity,
          );
          const remainingToSupply = Math.max(
            0,
            item.totalQuantity - suppliedTillNow,
          );
          const remainingToInstall = Math.max(
            0,
            suppliedTillNow - installedTillNow,
          );

          const hasError = installedTillNow > suppliedTillNow;

          return (
            <div
              key={item.id}
              className={`rounded-lg border p-6 ${hasError ? "border-error bg-error/5" : "border-border bg-background"}`}
            >
              {/* Item Header */}
              <div className="mb-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-text-primary text-lg font-semibold">
                    {item.name}
                  </h3>
                  <span className="text-text-secondary bg-muted rounded px-2 py-1 text-sm">
                    Item {index + 1} of {selectedProject.items?.length ?? 0}
                  </span>
                </div>
                <p className="text-text-secondary mb-2 text-sm">
                  {item.description}
                </p>
                <div className="text-text-secondary flex items-center space-x-4 text-sm">
                  <span>
                    Total Quantity:{" "}
                    <strong>
                      {item.totalQuantity?.toLocaleString()} {item.unit}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Supplied Till Now ({item.unit})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={item.totalQuantity}
                    value={suppliedTillNow.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        item.id,
                        "suppliedTillNow",
                        e.target.value,
                      )
                    }
                    placeholder="Enter supplied quantity"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Installed Till Now ({item.unit})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={suppliedTillNow}
                    value={installedTillNow.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        item.id,
                        "installedTillNow",
                        e.target.value,
                      )
                    }
                    placeholder="Enter installed quantity"
                    error={hasError ? "Cannot exceed supplied quantity" : false}
                    required
                  />
                </div>
              </div>
              <p className="text-text-secondary mb-4 text-xs">
                Whole numbers only. Supplied cannot exceed total quantity; installed cannot exceed supplied.
              </p>

              {/* Progress Visualization */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Supply Progress */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-text-primary text-sm font-medium">
                      Supply Progress
                    </span>
                    <span className="text-text-secondary text-sm">
                      {supplyProgress}%
                    </span>
                  </div>
                  <div className="bg-muted mb-2 h-3 w-full rounded-full">
                    <div
                      className="bg-info h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(supplyProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-text-secondary text-xs">
                    Remaining: {remainingToSupply.toLocaleString()} {item.unit}
                  </p>
                </div>

                {/* Install Progress */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-text-primary text-sm font-medium">
                      Install Progress
                    </span>
                    <span className="text-text-secondary text-sm">
                      {installProgress}%
                    </span>
                  </div>
                  <div className="bg-muted mb-2 h-3 w-full rounded-full">
                    <div
                      className="bg-success h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(installProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-text-secondary text-xs">
                    Ready to Install: {remainingToInstall.toLocaleString()}{" "}
                    {item.unit}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="border-border mt-8 flex justify-between border-t pt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Project Selection
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={handleSave}
          disabled={!isValid}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Yesterday&apos;s Progress
        </Button>
      </div>
    </div>
  );
};

export default SupplyInstallDataStep;
