import React, { useState } from "react";
import { Checkbox } from "@/components/rocket/components/ui/Checkbox";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import type {
  BlockageSeverity,
  BlockageType,
} from "@/validators/prisma-schmea.validator";

// Type definitions
interface BlockagePhoto {
  url: string;
  description?: string;
  timestamp?: Date;
}

interface Blockage {
  id: string;
  type: BlockageType;
  category: string;
  severity: BlockageSeverity;
  description: string;
  reportedAt: string | Date;
  photos?: BlockagePhoto[];
}

interface WorkflowData {
  blockages?: Record<string, Blockage[]>;
}

interface Visibility {
  clientVisible: boolean;
  selectedBlockages: string[];
}

interface BlockagesPreviewProps {
  workflowData: WorkflowData;
  visibility: Visibility;
  onVisibilityChange: (settings: Partial<Visibility>) => void;
}

type SeverityColor = "error" | "warning" | "success" | "muted";
type TypeColor = "info" | "accent";

const BlockagesPreview: React.FC<BlockagesPreviewProps> = ({
  workflowData,
  visibility,
  onVisibilityChange,
}) => {
  const [selectedBlockages, setSelectedBlockages] = useState<string[]>(
    visibility.selectedBlockages ?? [],
  );

  const allBlockages: Blockage[] = Object.values(
    workflowData.blockages ?? {},
  ).flat();

  const handleClientVisibilityToggle = (checked: boolean): void => {
    onVisibilityChange({ clientVisible: checked });
  };

  const handleBlockageSelection = (
    blockageId: string,
    checked: boolean,
  ): void => {
    const updated = checked
      ? [...selectedBlockages, blockageId]
      : selectedBlockages.filter((id: string) => id !== blockageId);

    setSelectedBlockages(updated);
    onVisibilityChange({ selectedBlockages: updated });
  };

  const getSeverityColor = (severity: string): SeverityColor => {
    switch (severity) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "muted";
    }
  };

  const getTypeIcon = (type: string): IconName => {
    return type === "client-side" ? "Users" : "Wrench";
  };

  const getTypeColor = (type: string): TypeColor => {
    return type === "client-side" ? "info" : "accent";
  };

  const formatCategory = (category: string): string => {
    return category
      .replace("-", " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const clientSideBlockages = allBlockages.filter(
    (b: Blockage) => b.type === "CLIENT",
  );
  const teamSideBlockages = allBlockages.filter(
    (b: Blockage) => b.type === "INTERNAL",
  );

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="border-border border-b pb-6 text-center">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Blockages & Issues Report
        </h2>
        <p className="text-text-secondary">
          Current project impediments and their status
        </p>
        <div className="mt-4 flex justify-center">
          <div className="bg-primary/10 rounded-lg px-4 py-2">
            <p className="text-primary text-sm font-medium">
              Report Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Client Visibility Controls */}
      <div className="bg-warning/10 border-warning/20 rounded-lg border p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Eye" size={20} color="var(--color-warning)" />
          <div className="flex-1">
            <h3 className="text-warning mb-2 font-medium">
              Client Visibility Settings
            </h3>
            <Checkbox
              label="Include blockages section in external client reports"
              checked={visibility.clientVisible}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleClientVisibilityToggle(e.target.checked)
              }
              className="text-sm"
            />
            <p className="text-warning/80 mt-1 text-xs">
              When enabled, selected blockages will be visible to external
              clients. Use discretion when sharing sensitive information.
            </p>
          </div>
        </div>
      </div>

      {allBlockages.length === 0 ? (
        /* No Blockages */
        <div className="py-8 text-center">
          <div className="bg-success/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <Icon name="CheckCircle" size={32} color="var(--color-success)" />
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            No Blockages Reported
          </h3>
          <p className="text-text-secondary">
            Excellent! No issues are currently blocking project progress.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-primary text-2xl font-bold">
                {allBlockages.length}
              </p>
              <p className="text-text-secondary text-xs">Total Blockages</p>
            </div>
            <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-info text-2xl font-bold">
                {clientSideBlockages.length}
              </p>
              <p className="text-text-secondary text-xs">Client-Side</p>
            </div>
            <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-accent text-2xl font-bold">
                {teamSideBlockages.length}
              </p>
              <p className="text-text-secondary text-xs">Team-Side</p>
            </div>
            <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-error text-2xl font-bold">
                {
                  allBlockages.filter((b: Blockage) => b.severity === "HIGH")
                    .length
                }
              </p>
              <p className="text-text-secondary text-xs">High Priority</p>
            </div>
          </div>

          {/* Client-Side Blockages */}
          {clientSideBlockages.length > 0 && (
            <div>
              <h3 className="text-text-primary mb-4 flex items-center space-x-2 text-lg font-semibold">
                <Icon name="Users" size={20} color="var(--color-info)" />
                <span>Client-Side Issues ({clientSideBlockages.length})</span>
              </h3>
              <div className="space-y-4">
                {clientSideBlockages.map((blockage: Blockage) => (
                  <div
                    key={blockage.id}
                    className="border-border overflow-hidden rounded-lg border"
                  >
                    <div className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-10 w-10 rounded-full bg-${getTypeColor(blockage.type)}/10 flex items-center justify-center`}
                          >
                            <Icon
                              name={getTypeIcon(blockage.type)}
                              size={20}
                              color={`var(--color-${getTypeColor(blockage.type)})`}
                            />
                          </div>
                          <div>
                            <h4 className="text-text-primary font-medium">
                              {formatCategory(blockage.category)}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs">
                              <span
                                className={`rounded-full px-2 py-1 bg-${getSeverityColor(blockage.severity)}/10 text-${getSeverityColor(blockage.severity)}`}
                              >
                                {blockage.severity} Priority
                              </span>
                              <span className="text-text-secondary">
                                {new Date(
                                  blockage.reportedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {visibility.clientVisible && (
                          <Checkbox
                            checked={selectedBlockages.includes(blockage.id)}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              handleBlockageSelection(
                                blockage.id,
                                e.target.checked,
                              )
                            }
                            label="Include in client report"
                            className="text-xs"
                          />
                        )}
                      </div>

                      <p className="text-text-secondary mb-3 text-sm">
                        {blockage.description}
                      </p>

                      {blockage.photos && blockage.photos.length > 0 && (
                        <div className="text-text-secondary flex items-center space-x-2 text-xs">
                          <Icon name="Camera" size={14} />
                          <span>
                            {blockage.photos.length} supporting photo(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team-Side Blockages */}
          {teamSideBlockages.length > 0 && (
            <div>
              <h3 className="text-text-primary mb-4 flex items-center space-x-2 text-lg font-semibold">
                <Icon name="Wrench" size={20} color="var(--color-accent)" />
                <span>Team-Side Issues ({teamSideBlockages.length})</span>
              </h3>
              <div className="space-y-4">
                {teamSideBlockages.map((blockage: Blockage) => (
                  <div
                    key={blockage.id}
                    className="border-border overflow-hidden rounded-lg border"
                  >
                    <div className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-10 w-10 rounded-full bg-${getTypeColor(blockage.type)}/10 flex items-center justify-center`}
                          >
                            <Icon
                              name={getTypeIcon(blockage.type)}
                              size={20}
                              color={`var(--color-${getTypeColor(blockage.type)})`}
                            />
                          </div>
                          <div>
                            <h4 className="text-text-primary font-medium">
                              {formatCategory(blockage.category)}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs">
                              <span
                                className={`rounded-full px-2 py-1 bg-${getSeverityColor(blockage.severity)}/10 text-${getSeverityColor(blockage.severity)}`}
                              >
                                {blockage.severity} Priority
                              </span>
                              <span className="text-text-secondary">
                                {new Date(
                                  blockage.reportedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-text-secondary bg-muted rounded px-2 py-1 text-xs">
                          Internal Only
                        </div>
                      </div>

                      <p className="text-text-secondary mb-3 text-sm">
                        {blockage.description}
                      </p>

                      {blockage.photos && blockage.photos.length > 0 && (
                        <div className="text-text-secondary flex items-center space-x-2 text-xs">
                          <Icon name="Camera" size={14} />
                          <span>
                            {blockage.photos.length} supporting photo(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Report Footer */}
      <div className="border-border border-t pt-6 text-center">
        <p className="text-text-secondary text-xs">
          Blockages report generated from daily workflow •{" "}
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default BlockagesPreview;
