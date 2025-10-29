import React from "react";
import Sheet1Preview from "./Sheet1Preview";
import Sheet2Preview from "./Sheet2Preview";
import BlockagesPreview from "./BlockagesPreview";
import PhotosPreview from "./PhotosPreview";
import type {
  BlockageSeverity,
  BlockageType,
} from "@/validators/prisma-schmea.validator";

// Type definitions based on source components
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

interface Photo {
  id: string;
  thumbnail: string;
  description?: string;
  uploadedAt: string | Date;
  itemId: string;
  itemName?: string;
}

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

interface WorkflowData {
  selectedProject?: Project;
  supplyInstallData?: Record<
    string,
    {
      suppliedTillNow?: number;
      installedTillNow?: number;
    }
  >;
  yesterdayProgress?: Record<
    string,
    {
      suppliedYesterday?: number;
      installedYesterday?: number;
      progressPercentage?: number;
      notes?: string;
    }
  >;
  blockages?: Record<string, Blockage[]>;
  photos?: Record<string, Photo[]>;
}

interface BlockageVisibility {
  clientVisible: boolean;
  selectedBlockages: string[];
}

interface PhotoVisibility {
  selectedForExternal: string[];
}

interface ReportVisibility {
  blockages: BlockageVisibility;
  photos: PhotoVisibility;
}

type ActiveSection = "sheet1" | "sheet2" | "blockages" | "photos";

interface ReportPreviewPanelProps {
  workflowData: WorkflowData;
  activeSection: ActiveSection;
  reportVisibility: ReportVisibility;
  onVisibilityChange: (
    section: string,
    settings: Partial<BlockageVisibility> | Partial<PhotoVisibility>,
  ) => void;
}

const ReportPreviewPanel: React.FC<ReportPreviewPanelProps> = ({
  workflowData,
  activeSection,
  reportVisibility,
  onVisibilityChange,
}) => {
  const renderSectionContent = (): React.ReactNode => {
    switch (activeSection) {
      case "sheet1":
        return <Sheet1Preview workflowData={workflowData} />;
      case "sheet2":
        return <Sheet2Preview workflowData={workflowData} />;
      case "blockages":
        return (
          <BlockagesPreview
            workflowData={workflowData}
            visibility={reportVisibility.blockages}
            onVisibilityChange={(settings: Partial<BlockageVisibility>) =>
              onVisibilityChange("blockages", settings)
            }
          />
        );
      case "photos":
        return (
          <PhotosPreview
            workflowData={workflowData}
            visibility={reportVisibility.photos}
            onVisibilityChange={(settings: Partial<PhotoVisibility>) =>
              onVisibilityChange("photos", settings)
            }
          />
        );
      default:
        return <Sheet1Preview workflowData={workflowData} />;
    }
  };

  return (
    <div className="bg-surface border-border rounded-lg border">
      <div className="border-border border-b p-6">
        <h3 className="text-text-primary text-lg font-semibold">
          Report Preview
        </h3>
        <p className="text-text-secondary mt-1 text-sm">
          Preview how the report will appear to recipients
        </p>
      </div>

      <div className="p-6">{renderSectionContent()}</div>
    </div>
  );
};

export default ReportPreviewPanel;
