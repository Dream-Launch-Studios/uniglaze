import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";
import type { PriorityLevel, ReportStatus } from "@prisma/client";
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
  const project = useProjectStore.getState().getProject();

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
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
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
          {/* <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "Generating..." : "Export PDF"}
            </Button>
          </div> */}
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
                  <TableHead>% Supplied</TableHead>
                  <TableHead>% Installed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.latestProjectVersion?.sheet1?.map((item, index) => (
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
                      {Math.min(item.percentSupplied, 100)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.min(item.percentInstalled, 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Sheet 2 */}
          <div className="mt-8 flex flex-col">
            <h2 className="text-text-primary text-lg font-medium">Sheet 2</h2>
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
                {project.latestProjectVersion?.sheet1?.flatMap((item) =>
                  item.sheet2.map((subItem) => (
                    <TableRow key={`${item.itemName}-${subItem.subItemName}`}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{subItem.subItemName}</TableCell>
                      <TableCell className="text-center">
                        {subItem.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        {subItem.totalQuantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {subItem.totalSupplied}
                      </TableCell>
                      <TableCell className="text-center">
                        {subItem.totalInstalled}
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
