import React from "react";
import Icon from "@/components/rocket/components/AppIcon";

// Type definitions
interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  totalQuantity: number;
  unit: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  items?: ProjectItem[];
}

interface SupplyInstallData {
  suppliedTillNow?: number;
  installedTillNow?: number;
}

interface YesterdayProgressData {
  suppliedYesterday?: number;
  installedYesterday?: number;
  progressPercentage?: number;
  notes?: string;
}

interface WorkflowData {
  selectedProject?: Project;
  supplyInstallData?: Record<string, SupplyInstallData>;
  yesterdayProgress?: Record<string, YesterdayProgressData>;
}

interface ItemSummary extends ProjectItem {
  suppliedTillNow: number;
  installedTillNow: number;
  suppliedYesterday: number;
  installedYesterday: number;
  progressPercentage: number;
  supplyProgress: number;
  installProgress: number;
  remainingToSupply: number;
  remainingToInstall: number;
  notes: string;
}

interface Sheet2PreviewProps {
  workflowData: WorkflowData;
}

const Sheet2Preview: React.FC<Sheet2PreviewProps> = ({ workflowData }) => {
  const { selectedProject, supplyInstallData, yesterdayProgress } =
    workflowData;

  const getItemSummary = (item: ProjectItem): ItemSummary => {
    const supplyData = supplyInstallData?.[item.id] ?? {};
    const progressData = yesterdayProgress?.[item.id] ?? {};

    const suppliedTillNow = supplyData.suppliedTillNow ?? 0;
    const installedTillNow = supplyData.installedTillNow ?? 0;
    const suppliedYesterday = progressData.suppliedYesterday ?? 0;
    const installedYesterday = progressData.installedYesterday ?? 0;
    const progressPercentage = progressData.progressPercentage ?? 0;

    const supplyProgress = +Math.round(
      (suppliedTillNow / item.totalQuantity) * 100,
    ).toFixed(2);
    const installProgress = +Math.round(
      (installedTillNow / item.totalQuantity) * 100,
    ).toFixed(2);
    const remainingToSupply = Math.max(0, item.totalQuantity - suppliedTillNow);
    const remainingToInstall = Math.max(0, suppliedTillNow - installedTillNow);

    return {
      ...item,
      suppliedTillNow,
      installedTillNow,
      suppliedYesterday,
      installedYesterday,
      progressPercentage,
      supplyProgress,
      installProgress,
      remainingToSupply,
      remainingToInstall,
      notes: progressData.notes ?? "",
    };
  };

  const itemsSummary = selectedProject?.items?.map(getItemSummary) ?? [];

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="border-border border-b pb-6 text-center">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Daily Progress Report - Sheet 2
        </h2>
        <p className="text-text-secondary">Detailed Item-wise Breakdown</p>
        <div className="mt-4 flex justify-center">
          <div className="bg-primary/10 rounded-lg px-4 py-2">
            <p className="text-primary text-sm font-medium">
              Report Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-text-primary font-semibold">
          {selectedProject?.name}
        </h3>
        <p className="text-text-secondary text-sm">
          {selectedProject?.client} • {selectedProject?.location}
        </p>
      </div>

      {/* Detailed Items Table */}
      <div>
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Item-wise Progress Details
        </h3>
        <div className="space-y-6">
          {itemsSummary.map((item: ItemSummary, index: number) => (
            <div
              key={item.id}
              className="border-border overflow-hidden rounded-lg border"
            >
              {/* Item Header */}
              <div className="bg-muted/20 border-border border-b p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-text-primary mb-1 font-semibold">
                      {index + 1}. {item.name}
                    </h4>
                    <p className="text-text-secondary mb-2 text-sm">
                      {item.description}
                    </p>
                    <div className="text-text-secondary flex items-center space-x-4 text-xs">
                      <span>
                        Total:{" "}
                        <strong>
                          {item.totalQuantity?.toLocaleString()} {item.unit}
                        </strong>
                      </span>
                      <span>
                        Progress: <strong>{item.progressPercentage}%</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                      <span className="text-primary text-lg font-bold">
                        {item.progressPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="p-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Supply Details */}
                  <div>
                    <h5 className="text-text-primary mb-3 flex items-center space-x-2 font-medium">
                      <Icon
                        name="Package"
                        size={16}
                        color="var(--color-info)"
                      />
                      <span>Supply Status</span>
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Supplied Till Now:
                        </span>
                        <span className="font-medium">
                          {item.suppliedTillNow.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Remaining to Supply:
                        </span>
                        <span className="font-medium">
                          {item.remainingToSupply.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Supply Progress:
                        </span>
                        <span className="text-info font-medium">
                          {item.supplyProgress}%
                        </span>
                      </div>
                      <div className="bg-muted mt-2 h-2 w-full rounded-full">
                        <div
                          className="bg-info h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.supplyProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Installation Details */}
                  <div>
                    <h5 className="text-text-primary mb-3 flex items-center space-x-2 font-medium">
                      <Icon
                        name="Settings"
                        size={16}
                        color="var(--color-success)"
                      />
                      <span>Installation Status</span>
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Installed Till Now:
                        </span>
                        <span className="font-medium">
                          {item.installedTillNow.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Ready to Install:
                        </span>
                        <span className="font-medium">
                          {item.remainingToInstall.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Install Progress:
                        </span>
                        <span className="text-success font-medium">
                          {item.installProgress}%
                        </span>
                      </div>
                      <div className="bg-muted mt-2 h-2 w-full rounded-full">
                        <div
                          className="bg-success h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.installProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yesterday's Work */}
                <div className="border-border mt-6 border-t pt-4">
                  <h5 className="text-text-primary mb-3 flex items-center space-x-2 font-medium">
                    <Icon
                      name="Calendar"
                      size={16}
                      color="var(--color-accent)"
                    />
                    <span>Yesterday&apos;s Progress</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Applied Yesterday:
                      </span>
                      <span className="text-accent font-medium">
                        {item.suppliedYesterday.toLocaleString()} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Installed Yesterday:
                      </span>
                      <span className="text-accent font-medium">
                        {item.installedYesterday.toLocaleString()} {item.unit}
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-3">
                      <h6 className="text-text-primary mb-1 text-sm font-medium">
                        Additional Notes:
                      </h6>
                      <p className="text-text-secondary bg-muted/30 rounded p-2 text-sm">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-text-primary mb-3 font-semibold">Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          <div>
            <p className="text-primary text-2xl font-bold">
              {selectedProject?.items?.length ?? 0}
            </p>
            <p className="text-text-secondary text-xs">Total Items</p>
          </div>
          <div>
            <p className="text-info text-2xl font-bold">
              {Math.round(
                itemsSummary.reduce(
                  (sum: number, item: ItemSummary) => sum + item.supplyProgress,
                  0,
                ) / itemsSummary.length,
              ) || 0}
              %
            </p>
            <p className="text-text-secondary text-xs">Avg Supply Progress</p>
          </div>
          <div>
            <p className="text-success text-2xl font-bold">
              {Math.round(
                itemsSummary.reduce(
                  (sum: number, item: ItemSummary) =>
                    sum + item.installProgress,
                  0,
                ) / itemsSummary.length,
              ) || 0}
              %
            </p>
            <p className="text-text-secondary text-xs">Avg Install Progress</p>
          </div>
          <div>
            <p className="text-accent text-2xl font-bold">
              {Math.round(
                itemsSummary.reduce(
                  (sum: number, item: ItemSummary) =>
                    sum + item.progressPercentage,
                  0,
                ) / itemsSummary.length,
              ) || 0}
              %
            </p>
            <p className="text-text-secondary text-xs">Overall Progress</p>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="border-border border-t pt-6 text-center">
        <p className="text-text-secondary text-xs">
          Detailed breakdown generated from daily workflow data •{" "}
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Sheet2Preview;
