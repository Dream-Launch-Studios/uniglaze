import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";
import type { PriorityLevel, ReportStatus } from "@prisma/client";
import { Role } from "@prisma/client";
import type { BlockageType } from "@/validators/prisma-schmea.validator";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project.store";
import {
  Table,
  TableCell,
  TableBody,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Button from "@/components/rocket/components/ui/Button";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { projectVersionSchema } from "@/validators/prisma-schmea.validator";

interface ProgressDetail {
  itemName: string;
  // status: ReportStatus;
  yetToSupply: number | string;
  yetToInstall: number | string;
  completed: number | string;
  progress: number;
  notes?: string;
}

interface Photo {
  url: string;
  description: string;
}

interface Blockage {
  title: string;
  type: BlockageType;
  description: string;
  reportedAt: string | Date;
}

interface ReportComment {
  author: string;
  content: string;
  action: ReportStatus;
  createdAt: string;
}

interface WorkflowReport {
  id: number;
  projectName: string;
  submittedBy: string;
  submittedAt: string;
  yesterdayReportStatus: ReportStatus;
  priority: PriorityLevel;
  overallProgress: number;
  completedItems: number;
  totalItems: number;
  photosCount: number;
  hasPhotos: boolean;
  hasComments: boolean;
  hasChanges: boolean;
  lastComment?: string;
  workSummary?: string;
  progressDetails: ProgressDetail[];
  photos?: Photo[];
  blockages?: Blockage[];
  comments: ReportComment[];
}

interface ReportPreviewProps {
  report: WorkflowReport | null;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  report,
  onApprove,
  onRequestChanges,
  onReject,
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const project = useProjectStore.getState().getProject();
  const { editSheet1Item, editSheet2Item } = useProjectStore.getState();
  const { data: session } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  const utils = api.useUtils();
  const { mutateAsync: createProjectVersion } =
    api.project.createProjectVersion.useMutation({
      onSuccess: async () => {
        toast.success("Report updated successfully");
        setIsEditMode(false);
        await utils.project.getAllProjectsWithLatestVersion.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
        setIsSaving(false);
      },
    });

  const isHeadOfPlanning =
    session?.user?.customRole === Role.HEAD_OF_PLANNING ||
    session?.user?.customRole === Role.MANAGING_DIRECTOR;

  const calculateRemaining = (
    total: number,
    cumulative: number,
  ): number => {
    return Math.max(0, total - cumulative);
  };

  const calculatePercentage = (
    cumulative: number,
    total: number,
  ): number => {
    return total > 0 ? Math.round((cumulative / total) * 100) : 0;
  };

  // Calculate remaining days from target date to report generation date
  const calculateRemainingDays = (targetDate: string | Date | null | undefined): number => {
    if (!targetDate) return 0;
    const target = new Date(targetDate);
    const reportDate = new Date(); // Report generation date
    if (isNaN(target.getTime())) return 0;
    const diffTime = target.getTime() - reportDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Return 0 if target date is in the past
  };

  // Calculate per-day productivity (one decimal place maximum)
  const calculatePerDayTarget = (balance: number, remainingDays: number): number => {
    if (remainingDays <= 0 || balance <= 0) return 0;
    const result = balance / remainingDays;
    return Math.round(result * 10) / 10; // Round to one decimal place
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      const currentProject = useProjectStore.getState().getProject();
      const validated = projectVersionSchema.safeParse(
        currentProject.latestProjectVersion,
      );
      if (!validated.success) {
        toast.error(validated.error.message);
        setIsSaving(false);
        return;
      }

      await createProjectVersion({
        ...validated.data,
        projectId: currentProject.latestProjectVersion?.projectId,
        yesterdayReportStatus:
          currentProject.latestProjectVersion?.yesterdayReportStatus,
      });
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report changes. Check your internet connection and that all data is valid. Try again or contact support.");
      setIsSaving(false);
    }
  };

  const handleSheet2Update = (
    sheet1Index: number,
    sheet2Index: number,
    field: "totalSupplied" | "totalInstalled" | "totalQuantity",
    value: number,
  ): void => {
    const subItem =
      project.latestProjectVersion?.sheet1?.[sheet1Index]?.sheet2?.[sheet2Index];
    if (!subItem) return;

    const updatedSubItem = { ...subItem };
    if (field === "totalQuantity") {
      updatedSubItem.totalQuantity = value;
    } else if (field === "totalSupplied") {
      updatedSubItem.totalSupplied = Math.min(value, subItem.totalQuantity);
    } else if (field === "totalInstalled") {
      updatedSubItem.totalInstalled = Math.min(value, subItem.totalQuantity);
    }

    updatedSubItem.percentSupplied = calculatePercentage(
      updatedSubItem.totalSupplied,
      updatedSubItem.totalQuantity,
    );
    updatedSubItem.percentInstalled = calculatePercentage(
      updatedSubItem.totalInstalled,
      updatedSubItem.totalQuantity,
    );

    editSheet2Item(sheet1Index, sheet2Index, updatedSubItem);

    // Update Sheet1 totals if connected
    const sheet1Item = project.latestProjectVersion?.sheet1?.[sheet1Index];
    if (sheet1Item && subItem.connectWithSheet1Item) {
      // Recalculate Sheet1 totals from all connected Sheet2 items
      const connectedSheet2Items = sheet1Item.sheet2.filter(
        (item) => item.connectWithSheet1Item,
      );
      const newTotalSupplied = connectedSheet2Items.reduce(
        (sum, item) => sum + (item.totalSupplied ?? 0),
        0,
      );
      const newTotalInstalled = connectedSheet2Items.reduce(
        (sum, item) => sum + (item.totalInstalled ?? 0),
        0,
      );

      const updatedSheet1Item = {
        ...sheet1Item,
        totalSupplied: Math.min(newTotalSupplied, sheet1Item.totalQuantity),
        totalInstalled: Math.min(newTotalInstalled, sheet1Item.totalQuantity),
        yetToSupply: calculateRemaining(
          sheet1Item.totalQuantity,
          Math.min(newTotalSupplied, sheet1Item.totalQuantity),
        ),
        yetToInstall: calculateRemaining(
          sheet1Item.totalQuantity,
          Math.min(newTotalInstalled, sheet1Item.totalQuantity),
        ),
        percentSupplied: calculatePercentage(
          Math.min(newTotalSupplied, sheet1Item.totalQuantity),
          sheet1Item.totalQuantity,
        ),
        percentInstalled: calculatePercentage(
          Math.min(newTotalInstalled, sheet1Item.totalQuantity),
          sheet1Item.totalQuantity,
        ),
      };

      editSheet1Item(sheet1Index, updatedSheet1Item);
    }
  };

  // const handleExportPDF = async (): Promise<void> => {
  //   if (!report) return;

  //   try {
  //     setIsGeneratingPDF(true);
  //     const reportWithProject = {
  //       ...report,
  //       project,
  //     };
  //     const blob = await pdf(
  //       <ReportTeamPDF report={reportWithProject} />,
  //     ).toBlob();

  //     const attachments = [
  //       {
  //         filename: `${report.projectName}-report.pdf`,
  //         content: blob, // Blob is fine, server action will convert it
  //       },
  //     ];

  //     const emailResponse = await sendEmail({
  //       to: "rebirth4vali@gmail.com",
  //       subject: "Test Email",
  //       emailProps: { toClient: true, clientName: "Vali" },
  //       attachments,
  //     });

  //     console.log("emailResponse", emailResponse);

  //     // Create download link
  //     // const url = URL.createObjectURL(blob);
  //     // const link = document.createElement("a");
  //     // link.href = url;
  //     // link.download = `${report.projectName}-report.pdf`;
  //     // document.body.appendChild(link);
  //     // link.click();
  //     // document.body.removeChild(link);
  //     // URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("PDF generation failed:", error);
  //     alert("PDF generation failed. Please try again.");
  //   } finally {
  //     setIsGeneratingPDF(false);
  //   }
  // };

  if (!report) {
    return (
      <div className="bg-surface flex h-full items-center justify-center">
        <div className="text-center">
          <Icon
            name="FileText"
            size={48}
            className="text-text-secondary mx-auto mb-4"
          />
          <h3 className="text-text-primary mb-2 text-lg font-medium">
            No Report Selected
          </h3>
          <p className="text-text-secondary">
            Select a report from the list to preview
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-surface flex h-full flex-col">
      {/* Header */}
      <div className="border-border border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-text-primary text-xl font-semibold">
              {report.projectName}
            </h2>
            <p className="text-text-secondary text-sm">
              Submitted by {report.submittedBy} on{" "}
              {formatDate(report.submittedAt)}
            </p>
            <p className="text-text-secondary text-sm">
              Yesterday&apos;s status: {report.yesterdayReportStatus}
            </p>
            <p className="text-text-secondary text-sm">
              Client Name: {project.latestProjectVersion?.client?.clientName}
            </p>
            <p className="text-text-secondary text-sm">
              Site Address: {project.latestProjectVersion?.siteLocation.city}
            </p>
          </div>
          {isHeadOfPlanning && report && (
            <div className="flex items-center space-x-2">
              {!isEditMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Edit"
                  iconPosition="left"
                  onClick={() => setIsEditMode(true)}
                >
                  Edit Report
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="X"
                    iconPosition="left"
                    onClick={() => setIsEditMode(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Save"
                    iconPosition="left"
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={isSaving}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Progress Details */}
        <div className="mb-6">
          <h3 className="text-text-primary mx-auto mb-3 flex w-fit items-center text-center text-lg font-medium">
            <Icon name="BarChart3" size={20} className="mr-2" />
            Daily Progress Report
          </h3>

          {/* Sheet 1 */}
          <div className="flex flex-col">
            <h2 className="text-text-primary text-lg font-medium">Sheet 1</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Main Task</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Total Supplied</TableHead>
                  <TableHead>Total Installed</TableHead>
                  <TableHead>Yet to Supply</TableHead>
                  <TableHead>Yet to Install</TableHead>
                  <TableHead>Supply Target</TableHead>
                  <TableHead>Installation Target</TableHead>
                  <TableHead>Per Day Supply Target</TableHead>
                  <TableHead>Per Day Installation Target</TableHead>
                  <TableHead>% Supplied</TableHead>
                  <TableHead>% Installed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.latestProjectVersion?.sheet1?.map((item, index) => {
                  const remainingDaysSupply = calculateRemainingDays(item.supplyTargetDate);
                  const remainingDaysInstall = calculateRemainingDays(item.installationTargetDate);
                  const perDaySupplyTarget = calculatePerDayTarget(item.yetToSupply, remainingDaysSupply);
                  const perDayInstallTarget = calculatePerDayTarget(item.yetToInstall, remainingDaysInstall);

                  return (
                    <TableRow key={index}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell className="text-center">{item.unit}</TableCell>
                      <TableCell className="text-center">
                        {item.totalQuantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.totalSupplied}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.totalInstalled}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.yetToSupply}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.yetToInstall}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.supplyTargetDate
                          ? formatDate(item.supplyTargetDate).split(",")[0]
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.installationTargetDate
                          ? formatDate(item.installationTargetDate).split(",")[0]
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {perDaySupplyTarget > 0 ? perDaySupplyTarget.toFixed(1) : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {perDayInstallTarget > 0 ? perDayInstallTarget.toFixed(1) : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.min(item.percentSupplied, 100)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.min(item.percentInstalled, 100)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Sheet 2 */}
          <div className="mt-8 flex flex-col">
            <h2 className="text-text-primary text-lg font-medium">Sheet 2</h2>
            {isEditMode && (
              <p className="text-warning border-warning/30 bg-warning/10 mb-3 rounded-md border px-3 py-2 text-xs">
                When editing: use whole numbers only. Supplied and installed cannot exceed total quantity. Items linked to Sheet 1 should have the same values as the main item.
              </p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Main Task</TableHead>
                  <TableHead>Sub Task</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Total Supplied</TableHead>
                  <TableHead>Total Installed</TableHead>
                  <TableHead>Yesterday Installed</TableHead>
                  <TableHead>Yesterday Supplied</TableHead>
                  <TableHead>% Installed</TableHead>
                  <TableHead>% Supplied</TableHead>
                  {/* <TableHead>Connected To Sheet 1</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.latestProjectVersion?.sheet1?.flatMap((item, sheet1Index) =>
                  item.sheet2.map((subItem, sheet2Index) => (
                    <TableRow key={`${item.itemName}-${subItem.subItemName}`}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{subItem.subItemName}</TableCell>
                      <TableCell className="text-center">
                        {subItem.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            min={0}
                            value={subItem.totalQuantity}
                            onChange={(e) =>
                              handleSheet2Update(
                                sheet1Index,
                                sheet2Index,
                                "totalQuantity",
                                +e.target.value,
                              )
                            }
                            className="w-20 text-center"
                          />
                        ) : (
                          subItem.totalQuantity
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            min={0}
                            max={subItem.totalQuantity}
                            value={subItem.totalSupplied}
                            onChange={(e) =>
                              handleSheet2Update(
                                sheet1Index,
                                sheet2Index,
                                "totalSupplied",
                                +e.target.value,
                              )
                            }
                            className="w-20 text-center"
                          />
                        ) : (
                          subItem.totalSupplied
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditMode ? (
                          <Input
                            type="number"
                            min={0}
                            max={subItem.totalQuantity}
                            value={subItem.totalInstalled}
                            onChange={(e) =>
                              handleSheet2Update(
                                sheet1Index,
                                sheet2Index,
                                "totalInstalled",
                                +e.target.value,
                              )
                            }
                            className="w-20 text-center"
                          />
                        ) : (
                          subItem.totalInstalled
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {subItem.yesterdayProgressReport?.yesterdayInstalled ??
                          "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {subItem.yesterdayProgressReport?.yesterdaySupplied ??
                          "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.min(subItem.percentInstalled, 100)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.min(subItem.percentSupplied, 100)}%
                      </TableCell>
                      {/* <TableCell className="text-center">
                        {subItem.connectWithSheet1Item ? "Yes" : "No"}
                      </TableCell> */}
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </div>

          {/* Progress Photos & Description */}
          <div className="mt-8 flex flex-col">
            <p className="text-text-primary mt-8 text-center font-medium">
              Progress Photos & Description
            </p>
            {project.latestProjectVersion?.sheet1?.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div key={index} className="group relative mt-4">
                  <p className="text-text-primary mb-4 font-medium">
                    {index + 1}. {item.itemName}
                  </p>
                  <div className="flex w-full flex-wrap gap-4 overflow-hidden">
                    {item.yesterdayProgressPhotos?.length === 0 ? (
                      <div className="flex items-center justify-center">
                        <p className="text-text-secondary text-center text-lg font-medium">
                          No progress photos available
                        </p>
                      </div>
                    ) : (
                      item.yesterdayProgressPhotos?.map(
                        (progressPhoto, index) => {
                          return (
                            <div
                              key={index}
                              className="flex w-[48%] flex-col justify-between gap-2 overflow-hidden rounded-lg border border-neutral-500 p-4"
                            >
                              {progressPhoto.photos.length > 0 ? (
                                progressPhoto.photos.map((photo, index) => (
                                  <div
                                    key={index}
                                    className="overflow-hidden rounded-lg"
                                  >
                                    <Image
                                      key={photo?.s3Key}
                                      src={photo?.url ?? ""}
                                      alt={photo?.fileName}
                                      className="size-60 object-cover"
                                    />
                                  </div>
                                ))
                              ) : (
                                <p className="text-text-secondary mt-2 line-clamp-2 text-xl">
                                  No photos
                                </p>
                              )}
                              <p className="text-text-secondary mt-2 line-clamp-2 text-xl">
                                Progress Description :{" "}
                                {progressPhoto.description ?? "No description"}
                              </p>
                            </div>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Client Blockages */}
          <div className="mt-16 flex flex-col">
            <h3 className="text-text-primary flex items-center justify-center text-center text-lg font-medium">
              <Icon
                name="AlertTriangle"
                size={20}
                className="text-warning mr-2"
              />
              Client-Side Blockages & Issues
            </h3>
            {project.latestProjectVersion?.sheet1?.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="mt-6">
                  <p className="text-text-primary mb-4 font-medium">
                    {index + 1}. {item.itemName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.blockages?.length === 0 ? (
                      <div className="flex items-center justify-center">
                        <p className="text-text-secondary text-center text-lg font-medium">
                          No client-side blockages available
                        </p>
                      </div>
                    ) : (
                      item.blockages?.map((blockage, index) => (
                        <div
                          key={index}
                          className={cn(
                            blockage?.type === "CLIENT"
                              ? "bg-warning/5 border-warning/20 w-[48%] rounded-lg border p-4"
                              : "hidden",
                          )}
                        >
                          <div className="flex flex-col justify-between">
                            {blockage.type === "CLIENT" && (
                              <>
                                <div className="mb-2 flex items-center justify-between">
                                  <h4 className="text-text-primary font-medium">
                                    {blockage?.type === "CLIENT"
                                      ? "Client"
                                      : "Internal"}
                                  </h4>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      blockage?.type === "CLIENT"
                                        ? "bg-warning/10 text-warning"
                                        : "bg-error/10 text-error"
                                    }`}
                                  >
                                    {blockage?.type === "CLIENT"
                                      ? "Client"
                                      : "Internal"}
                                  </span>
                                </div>
                                <div className="flex flex-col justify-between">
                                  <div className="flex flex-col gap-1">
                                    <p className="text-text-primary text-sm">
                                      Blockage Description:{" "}
                                      {blockage?.description}
                                    </p>
                                    <p className="text-text-primary text-sm">
                                      Weather Report: {blockage?.weatherReport}
                                    </p>
                                    <p className="text-text-primary text-sm">
                                      Reported on{" "}
                                      {formatDate(blockage?.blockageStartTime)}
                                    </p>
                                    <p className="text-text-primary text-sm">
                                      Closed on{" "}
                                      {blockage?.blockageEndTime
                                        ? formatDate(blockage?.blockageEndTime)
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-2 overflow-hidden">
                                    {blockage?.blockagePhotos
                                      .slice(0, 1)
                                      .map((photo, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 overflow-hidden rounded-lg"
                                        >
                                          <Image
                                            src={photo.url}
                                            alt={photo.fileName}
                                            className="mt-12 size-60 object-contain"
                                          />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Internal Blockages */}
          <div className="mt-16 flex flex-col">
            <h3 className="text-text-primary flex items-center justify-center text-center text-lg font-medium">
              <Icon
                name="AlertTriangle"
                size={20}
                className="text-warning mr-2"
              />
              Internal Blockages & Issues
            </h3>
            {project.latestProjectVersion?.sheet1?.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="mt-6">
                  <p className="text-text-primary mb-4 font-medium">
                    {index + 1}. {item.itemName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.blockages?.length === 0 ? (
                      <div className="flex items-center justify-center">
                        <p className="text-text-secondary text-center text-lg font-medium">
                          No internal blockages available
                        </p>
                      </div>
                    ) : (
                      item.blockages?.map((blockage, index) => (
                        <div
                          key={index}
                          className={cn(
                            blockage?.type === "INTERNAL"
                              ? "bg-warning/5 border-warning/20 w-[48%] rounded-lg border p-4"
                              : "hidden",
                          )}
                        >
                          <div className="flex flex-col justify-between">
                            {blockage.type === "INTERNAL" && (
                              <>
                                <div className="mb-2 flex items-center justify-between">
                                  <h4 className="text-text-primary font-medium">
                                    {blockage?.type === "INTERNAL"
                                      ? "Internal"
                                      : "Client"}
                                  </h4>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      blockage?.type === "INTERNAL"
                                        ? "bg-error/10 text-error"
                                        : "bg-warning/10 text-warning"
                                    }`}
                                  >
                                    {blockage?.type === "INTERNAL"
                                      ? "Internal"
                                      : "Client"}
                                  </span>
                                </div>
                                <div className="flex flex-col justify-between">
                                  <div className="flex flex-col gap-1">
                                    <p className="text-text-primary text-sm">
                                      Blockage Description:{" "}
                                      {blockage?.description}
                                    </p>
                                    <p className="text-text-primary text-sm">
                                      Weather Report: {blockage?.weatherReport}
                                    </p>
                                    <p className="text-text-primary text-sm">
                                      Reported on{" "}
                                      {formatDate(blockage?.blockageStartTime)}
                                    </p>
                                    <p className="text-text-primary text-sm">
                                      Closed on{" "}
                                      {blockage?.blockageEndTime
                                        ? formatDate(blockage?.blockageEndTime)
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-2 overflow-hidden">
                                    {blockage?.blockagePhotos
                                      .slice(0, 1)
                                      .map((photo, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 overflow-hidden rounded-lg"
                                        >
                                          <Image
                                            src={photo.url}
                                            alt={photo.fileName}
                                            className="mt-12 size-60 object-contain"
                                          />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
