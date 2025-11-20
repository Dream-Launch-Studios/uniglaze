import React from "react";
import Icon from "@/components/rocket/components/AppIcon";
import { useProjectStore } from "@/store/project.store";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";

// Type definitions
interface ProjectItem {
  id: string | number;
  name?: string;
  itemName?: string;
  totalQuantity: number;
  uom?: string;
  unit?: string;
  description?: string;
}

interface Project {
  id?: string | number;
  name?: string;
  client?: string;
  location?: string;
  status?: string;
  progress?: number;
  items?: ProjectItem[];
}

interface SupplyInstallData {
  suppliedTillNow?: number;
  installedTillNow?: number;
}

interface YesterdayProgress {
  suppliedYesterday?: number;
  installedYesterday?: number;
  progressPercentage?: number;
  notes?: string;
}

interface WorkflowData {
  selectedProject?: Project;
  supplyInstallData?: Record<string | number, SupplyInstallData>;
  yesterdayProgress?: Record<string | number, YesterdayProgress>;
}

interface Sheet1PreviewProps {
  workflowData: WorkflowData;
}

interface TotalsData {
  totalQuantity: number;
  totalSupplied: number;
  totalInstalled: number;
  totalYesterdayApplied: number;
  totalYesterdayInstalled: number;
  supplyProgress: number;
  installProgress: number;
}

const Sheet1Preview: React.FC<Sheet1PreviewProps> = ({ workflowData }) => {
  // const { selectedProject, supplyInstallData, yesterdayProgress } =
  //   workflowData;

  const { data: session } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  const currentProjectData = useProjectStore.getState().getProject();

  // const calculateTotals = (): TotalsData => {
  //   if (!selectedProject?.items)
  //     return {
  //       totalQuantity: 0,
  //       totalSupplied: 0,
  //       totalInstalled: 0,
  //       totalYesterdayApplied: 0,
  //       totalYesterdayInstalled: 0,
  //       supplyProgress: 0,
  //       installProgress: 0,
  //     };

  //   let totalQuantity = 0;
  //   let totalSupplied = 0;
  //   let totalInstalled = 0;
  //   let totalYesterdayApplied = 0;
  //   let totalYesterdayInstalled = 0;

  //   selectedProject.items.forEach((item) => {
  //     totalQuantity += item.totalQuantity;

  //     const supplyData = supplyInstallData?.[item.id];
  //     if (supplyData) {
  //       totalSupplied += supplyData.suppliedTillNow ?? 0;
  //       totalInstalled += supplyData.installedTillNow ?? 0;
  //     }

  //     const progressData = yesterdayProgress?.[item.id];
  //     if (progressData) {
  //       totalYesterdayApplied += progressData.suppliedYesterday ?? 0;
  //       totalYesterdayInstalled += progressData.installedYesterday ?? 0;
  //     }
  //   });

  //   return {
  //     totalQuantity,
  //     totalSupplied,
  //     totalInstalled,
  //     totalYesterdayApplied,
  //     totalYesterdayInstalled,
  //     supplyProgress: totalQuantity
  //       ? Math.round((totalSupplied / totalQuantity) * 100)
  //       : 0,
  //     installProgress: totalQuantity
  //       ? Math.round((totalInstalled / totalQuantity) * 100)
  //       : 0,
  //   };
  // };

  // const totals = calculateTotals();
  const projectName = currentProjectData?.latestProjectVersion?.projectName;
  const clientName =
    currentProjectData?.latestProjectVersion?.client.clientName;
  const location =
    currentProjectData?.latestProjectVersion?.client.billingAddress;
  const status = currentProjectData?.latestProjectVersion?.projectStatus;

  const totalQuantity =
    currentProjectData?.latestProjectVersion?.sheet1?.reduce(
      (acc, item) => acc + item.totalQuantity,
      0,
    ) ?? 0;
  const totalSupplied =
    currentProjectData?.latestProjectVersion?.sheet1?.reduce(
      (acc, item) => acc + item.totalSupplied,
      0,
    ) ?? 0;
  const totalInstalled =
    currentProjectData?.latestProjectVersion?.sheet1?.reduce(
      (acc, item) => acc + item.totalInstalled,
      0,
    ) ?? 0;

  const overallProgress = +(
    ((totalSupplied + totalInstalled) * 100) /
    (2 * totalQuantity)
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="border-border border-b pb-6 text-center">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Daily Progress Report
        </h2>
        <p className="text-text-secondary">Project Summary</p>
        <div className="mt-4 flex justify-center">
          <div className="bg-primary/10 rounded-lg px-4 py-2">
            <p className="text-primary text-sm font-medium">
              Report Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Project Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-text-primary mb-2 font-medium">
              Project Details
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-text-secondary">Name:</span>{" "}
                <span className="font-medium">{projectName}</span>
              </p>
              <p>
                <span className="text-text-secondary">Client:</span>{" "}
                <span className="font-medium">{clientName}</span>
              </p>
              <p>
                <span className="text-text-secondary">Location:</span>{" "}
                <span className="font-medium">{location}</span>
              </p>
              <p>
                <span className="text-text-secondary">Status:</span>{" "}
                <span className="font-medium">{status}</span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-text-primary mb-2 font-medium">
              Project Statistics
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-text-secondary">Total Items:</span>{" "}
                <span className="font-medium">
                  {currentProjectData?.latestProjectVersion?.sheet1?.length ??
                    0}
                </span>
              </p>
              <p>
                <span className="text-text-secondary">Overall Progress:</span>{" "}
                <span className="font-medium">{overallProgress}%</span>
              </p>
              <p>
                <span className="text-text-secondary">Report By:</span>{" "}
                <span className="font-medium">{session?.user?.name}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div>
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Summary Statistics
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Supply Progress */}
          <div className="bg-info/10 border-info/20 rounded-lg border p-4">
            <div className="mb-3 flex items-center space-x-2">
              <Icon name="Package" size={20} color="var(--color-info)" />
              <h4 className="text-info font-medium">Supply Progress</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total Quantity:</span>
                <span className="font-medium">{totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Supplied Till Now:</span>
                <span className="font-medium">
                  {Math.min(totalSupplied, totalQuantity)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Progress:</span>
                <span className="text-info font-medium">
                  {Math.min(
                    +((totalSupplied * 100) / totalQuantity).toFixed(2),
                    100,
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Installation Progress */}
          <div className="bg-success/10 border-success/20 rounded-lg border p-4">
            <div className="mb-3 flex items-center space-x-2">
              <Icon name="Settings" size={20} color="var(--color-success)" />
              <h4 className="text-success font-medium">
                Installation Progress
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total Quantity:</span>
                <span className="font-medium">{totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Installed Till Now:</span>
                <span className="font-medium">
                  {Math.min(totalInstalled, totalQuantity)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Progress:</span>
                <span className="text-success font-medium">
                  {Math.min(
                    +((totalInstalled * 100) / totalQuantity).toFixed(2),
                    100,
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yesterday's Work Summary */}
      <div>
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Yesterday&apos;s Work Summary
        </h3>
        <div className="bg-accent/10 border-accent/20 rounded-lg border p-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center space-x-2">
                <Icon name="TrendingUp" size={18} color="var(--color-accent)" />
                <h4 className="text-accent font-medium">Work Supplied</h4>
              </div>
              <p className="text-text-primary text-2xl font-bold">
                {Math.min(totalSupplied, totalQuantity)}
              </p>
              <p className="text-text-secondary text-sm">
                Total units applied till now
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-center space-x-2">
                <Icon
                  name="CheckCircle"
                  size={18}
                  color="var(--color-accent)"
                />
                <h4 className="text-accent font-medium">Work Installed</h4>
              </div>
              <p className="text-text-primary text-2xl font-bold">
                {Math.min(totalInstalled, totalQuantity)}
              </p>
              <p className="text-text-secondary text-sm">
                Total units installed till now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="border-border border-t pt-6 text-center">
        <p className="text-text-secondary text-xs">
          This report was generated automatically from daily workflow data •{" "}
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Sheet1Preview;
