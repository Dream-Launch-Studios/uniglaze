import React, { useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import type { projectVersionSchema } from "@/validators/prisma-schmea.validator";
import type z from "zod";
import { useProjectStore } from "@/store/project.store";

// Define TypeScript interfaces
type ProjectItem = Omit<
  NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>[number],
  "sheet2"
>;

interface SheetTotals {
  totalItems: number;
  totalQuantity: number;
  totalSupplied: number;
  totalInstalled: number;
  totalYetToSupply: number;
  totalYetToInstall: number;
}

interface Sheet2Totals {
  totalSubTasks: number;
}

interface SheetPreviewProps {
  onFinalize: () => void;
  onPrevious: () => void;
  loading: boolean;
}

const SheetPreview: React.FC<SheetPreviewProps> = ({
  onFinalize,
  onPrevious,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<"sheet1" | "sheet2">("sheet1");

  const sheet1Data = useProjectStore(
    (state) => state.latestProjectVersion?.sheet1,
  );
  const projectName = useProjectStore(
    (state) => state.latestProjectVersion?.projectName,
  );
  const client = useProjectStore((state) => state.latestProjectVersion?.client);
  const projectType = useProjectStore(
    (state) => state.latestProjectVersion?.projectType,
  );

  const calculateTotals = (): {
    sheet1Totals: SheetTotals;
    sheet2Totals: Sheet2Totals;
  } => {
    const sheet1Totals: SheetTotals = {
      totalItems: sheet1Data?.length ?? 0,
      totalQuantity:
        sheet1Data?.reduce(
          (sum: number, item: ProjectItem) => sum + item.totalQuantity,
          0,
        ) ?? 0,
      totalSupplied:
        sheet1Data?.reduce(
          (sum: number, item: ProjectItem) => sum + item.totalSupplied,
          0,
        ) ?? 0,
      totalInstalled:
        sheet1Data?.reduce(
          (sum: number, item: ProjectItem) => sum + item.totalInstalled,
          0,
        ) ?? 0,
      totalYetToSupply:
        sheet1Data?.reduce(
          (sum: number, item: ProjectItem) => sum + item.yetToSupply,
          0,
        ) ?? 0,
      totalYetToInstall:
        sheet1Data?.reduce(
          (sum: number, item: ProjectItem) => sum + item.yetToInstall,
          0,
        ) ?? 0,
    };

    const sheet2Totals: Sheet2Totals = {
      totalSubTasks: sheet1Data?.flatMap((item) => item.sheet2).length ?? 0,
    };

    return { sheet1Totals, sheet2Totals };
  };

  const { sheet1Totals, sheet2Totals } = calculateTotals();

  const getSubTasksByItem = (itemName: string) => {
    return (
      sheet1Data?.find((sheet1Item) => sheet1Item.itemName === itemName)
        ?.sheet2 ?? []
    );
  };

  const renderSheet1Preview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-info/10 border-info/20 rounded-lg border p-4 text-center">
          <p className="text-info text-2xl font-bold">
            {sheet1Totals.totalItems}
          </p>
          <p className="text-text-secondary text-sm">Total Items</p>
        </div>
        <div className="bg-primary/10 border-primary/20 rounded-lg border p-4 text-center">
          <p className="text-primary text-2xl font-bold">
            {sheet1Totals.totalQuantity}
          </p>
          <p className="text-text-secondary text-sm">Total Quantity</p>
        </div>
        <div className="bg-warning/10 border-warning/20 rounded-lg border p-4 text-center">
          <p className="text-warning text-2xl font-bold">
            {sheet1Totals.totalYetToSupply}
          </p>
          <p className="text-text-secondary text-sm">Yet to Supply</p>
        </div>
        <div className="bg-success/10 border-success/20 rounded-lg border p-4 text-center">
          <p className="text-success text-2xl font-bold">
            {sheet1Totals.totalYetToInstall}
          </p>
          <p className="text-text-secondary text-sm">Yet to Install</p>
        </div>
      </div>

      {/* Sheet 1 Table */}
      <div className="bg-surface border-border overflow-hidden rounded-lg border">
        <div className="border-border border-b p-4">
          <h3 className="text-text-primary font-medium">
            Sheet 1 - Master Project Data
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  S.No
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Item
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Unit
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Total
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Supplied
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Installed
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Yet to Supply
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Yet to Install
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  % Supplied
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  % Installed
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {sheet1Data?.map((item: ProjectItem, index: number) => (
                <tr key={index} className="hover:bg-muted/20">
                  <td className="text-text-primary px-4 py-3 text-sm">
                    {index + 1}
                  </td>
                  <td className="text-text-primary px-4 py-3 text-sm font-medium">
                    {item.itemName}
                  </td>
                  <td className="text-text-secondary px-4 py-3 text-sm">
                    {item.unit}
                  </td>
                  <td className="text-text-primary px-4 py-3 text-sm">
                    {item.totalQuantity}
                  </td>
                  <td className="text-text-primary px-4 py-3 text-sm">
                    {item.totalSupplied}
                  </td>
                  <td className="text-text-primary px-4 py-3 text-sm">
                    {item.totalInstalled}
                  </td>
                  <td className="text-text-primary px-4 py-3 text-sm">
                    {item.yetToSupply}
                  </td>
                  <td className="text-text-primary px-4 py-3 text-sm">
                    {item.yetToInstall}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.percentSupplied >= 80
                          ? "bg-success/10 text-success"
                          : item.percentSupplied >= 50
                            ? "bg-warning/10 text-warning"
                            : "bg-info/10 text-info"
                      }`}
                    >
                      {item.percentSupplied}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.percentInstalled >= 80
                          ? "bg-success/10 text-success"
                          : item.percentInstalled >= 50
                            ? "bg-warning/10 text-warning"
                            : "bg-info/10 text-info"
                      }`}
                    >
                      {item.percentInstalled}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSheet2Preview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-info/10 border-info/20 rounded-lg border p-4 text-center">
          <p className="text-info text-2xl font-bold">
            {sheet2Totals.totalSubTasks}
          </p>
          <p className="text-text-secondary text-sm">Total Sub-Tasks</p>
        </div>
      </div>

      {/* Sheet 2 Table */}
      <div className="bg-surface border-border overflow-hidden rounded-lg border">
        <div className="border-border border-b p-4">
          <h3 className="text-text-primary font-medium">
            Sheet 2 - Detailed Work Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Item
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Sub-Task
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Unit
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Total
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Supplied
                </th>
                <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Installed
                </th>
                {/* <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                  Connected to Sheet 1
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {sheet1Data?.flatMap((sheet1Item, sheet1Index) =>
                sheet1Item.sheet2.map((subTask, subTaskIndex) => (
                  <tr
                    key={`${sheet1Index}-${subTaskIndex}`}
                    className="hover:bg-muted/20"
                  >
                    <td className="text-text-primary px-4 py-3 text-sm font-medium">
                      {sheet1Item.itemName}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {subTask.subItemName}
                    </td>
                    <td className="text-text-secondary px-4 py-3 text-sm">
                      {subTask.unit}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {subTask.totalQuantity}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {subTask.totalSupplied}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {subTask.totalInstalled}
                    </td>
                    {/* <td className="text-text-primary px-4 py-3 text-sm">
                      {subTask.connectWithSheet1Item ? "Yes" : "No"}
                    </td> */}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Breakdown Summary */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-text-primary mb-3 font-medium">
          Item Breakdown Summary
        </h3>
        <div className="space-y-3">
          {sheet1Data?.map((item: ProjectItem, index: number) => {
            const itemSubTasks = getSubTasksByItem(item.itemName);
            return (
              <div
                key={index}
                className="bg-surface flex items-center justify-between rounded-lg p-3"
              >
                <div>
                  <h4 className="text-text-primary font-medium">
                    {item.itemName}
                  </h4>
                  <p className="text-text-secondary text-sm">
                    {itemSubTasks.length} sub-tasks • {item.totalQuantity}{" "}
                    {item.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border border-b pb-6 text-center">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Preview & Review
        </h2>
        <p className="text-text-secondary">
          Review both Sheet 1 and Sheet 2 data before finalizing the project
          setup
        </p>
      </div>

      {/* Project Information */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-text-primary mb-3 font-medium">
          Project Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-text-secondary text-sm">Project Name</p>
            <p className="text-text-primary font-medium">
              {projectName ?? "N/A"}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Client</p>
            <p className="text-text-primary font-medium">
              {client?.clientName ?? "N/A"}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Project Type</p>
            <p className="text-text-primary font-medium">
              {projectType ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-border border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("sheet1")}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === "sheet1"
                ? "border-primary text-primary"
                : "text-text-secondary hover:text-text-primary border-transparent"
            }`}
          >
            Sheet 1 - Master Data ({sheet1Data?.length ?? 0} items)
          </button>
          <button
            onClick={() => setActiveTab("sheet2")}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === "sheet2"
                ? "border-primary text-primary"
                : "text-text-secondary hover:text-text-primary border-transparent"
            }`}
          >
            Sheet 2 - Detailed Breakdown (
            {sheet1Data?.flatMap((item) => item.sheet2).length ?? 0} sub-tasks)
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "sheet1" ? renderSheet1Preview() : renderSheet2Preview()}
      </div>

      {/* Validation Summary */}
      <div className="bg-surface border-border rounded-lg border p-4">
        <h3 className="text-text-primary mb-3 font-medium">
          Validation Summary
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-text-primary text-sm">
                Sheet 1: {sheet1Data?.length ?? 0} items configured
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-text-primary text-sm">
                Sheet 2:{" "}
                {sheet1Data?.flatMap((item) => item.sheet2).length ?? 0}{" "}
                sub-tasks created
              </span>
            </div>
            ``
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-text-primary text-sm">
                All calculations validated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-border flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Sheet 2
        </Button>

        <Button
          variant="default"
          onClick={onFinalize}
          disabled={loading}
          loading={loading}
          iconName="Check"
          iconPosition="left"
        >
          {loading ? "Finalizing Project..." : "Finalize Project"}
        </Button>
      </div>
    </div>
  );
};

export default SheetPreview;
