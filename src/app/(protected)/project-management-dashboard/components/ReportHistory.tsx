import React, { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { pdf } from "@react-pdf/renderer";
import { ReportTeamPDF, ReportClientPDF } from "@/app/(protected)/report-approval-workflow/components/ReportPDF";
import { useProjectStore } from "@/store/project.store";
import { toast } from "sonner";
import type { ReportStatus } from "@prisma/client";

interface ReportHistoryProps {
  projectId?: number;
}

type ReportType = "all" | "client" | "internal";

const ReportHistory: React.FC<ReportHistoryProps> = ({ projectId }) => {
  const [reportTypeFilter, setReportTypeFilter] = useState<ReportType>("all");
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);

  // Fetch all project versions with reports
  const { data: historicalData, isLoading } = api.project.getProjectVersionsHistory.useQuery(
    {
      projectId: projectId ?? 0,
    },
    {
      enabled: !!projectId,
    }
  );

  // Filter versions that have reports (yesterdayReportStatus is not NOT_CREATED)
  // Group by date and show only the latest version per day
  const reports = useMemo(() => {
    if (!historicalData?.data) return [];
    
    // First, get all versions with reports
    const allReports = historicalData.data
      .filter((version) => {
        const status = (version as any).yesterdayReportStatus as ReportStatus | undefined;
        return status && status !== "NOT_CREATED";
      })
      .map((version) => {
        const reportDate = version.yesterdayReportCreatedAt 
          ? new Date(version.yesterdayReportCreatedAt)
          : new Date(version.projectVersionCreatedAt);
        
        // Normalize date to just the date part (ignore time)
        const normalizedDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
        
        return {
          id: version.id,
          date: normalizedDate,
          originalDate: reportDate,
          status: (version as any).yesterdayReportStatus as ReportStatus,
          projectName: (version as any).projectName as string,
          sheet1: version.sheet1,
          versionCreatedAt: version.projectVersionCreatedAt,
          version: version,
        };
      });
    
    // Group by date and keep only the latest version per day
    // Priority: APPROVED > PENDING > REJECTED, then by creation time
    const reportsByDate = new Map<string, typeof allReports[0]>();
    
    allReports.forEach((report) => {
      const dateKey = report.date.toISOString().split("T")[0] as string; // YYYY-MM-DD
      const existing = reportsByDate.get(dateKey);
      
      if (!existing) {
        reportsByDate.set(dateKey, report);
      } else {
        // Priority order: APPROVED > PENDING > REJECTED
        const statusPriority: Record<ReportStatus, number> = {
          APPROVED: 3,
          PENDING: 2,
          REJECTED: 1,
          NOT_CREATED: 0,
        };
        
        const existingStatus = existing.status || "NOT_CREATED";
        const currentStatus = report.status || "NOT_CREATED";
        const existingPriority = statusPriority[existingStatus] || 0;
        const currentPriority = statusPriority[currentStatus] || 0;
        
        // If same priority, use the most recent version
        if (currentPriority > existingPriority || 
            (currentPriority === existingPriority && 
             report.versionCreatedAt > existing.versionCreatedAt)) {
          reportsByDate.set(dateKey, report);
        }
      }
    });
    
    // Convert map to array and sort by date (most recent first)
    return Array.from(reportsByDate.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [historicalData]);

  const triggerDownload = (blob: Blob, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        // Delay to ensure download starts before cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        }, 200);
      } catch (error) {
        reject(error);
      }
    });
  };

  const generatePDF = async (versionId: number, type: "client" | "internal"): Promise<void> => {
    const version = historicalData?.data?.find((v) => v.id === versionId);
    if (!version) {
      toast.error("Report data not found. The report may have been deleted or you don't have access. Refresh the page or contact support.");
      return;
    }

    try {
      setGeneratingPdfId(versionId);
      
      // Create a project structure compatible with ReportPDF components
      const projectVersion = {
        ...version,
        projectName: (version as any).projectName || "Project",
        client: (version as any).client || {},
        siteLocation: (version as any).siteLocation || {},
        yesterdayReportCreatedAt: version.yesterdayReportCreatedAt || version.projectVersionCreatedAt,
        yesterdayReportStatus: (version as any).yesterdayReportStatus,
      };

      const project = {
        latestProjectVersion: projectVersion,
      };

      const report = {
        id: version.id,
        projectName: (version as any).projectName || "Report",
        submittedBy: (version as any).assignedProjectManager?.name || "Unknown",
        submittedAt: (version.yesterdayReportCreatedAt || version.projectVersionCreatedAt).toISOString(),
        yesterdayReportStatus: (version as any).yesterdayReportStatus || "PENDING",
        priority: (version as any).priorityLevel || "MEDIUM_PRIORITY",
        overallProgress: 0,
        completedItems: 0,
        totalItems: 0,
        photosCount: 0,
        hasPhotos: false,
        hasComments: false,
        hasChanges: false,
        progressDetails: [],
        project: project as any, // Type assertion since we're constructing from DB data
      } as any;

      const PDFComponent = type === "client" ? ReportClientPDF : ReportTeamPDF;
      const blob = await pdf(<PDFComponent report={report} />).toBlob();
      
      const reportDate = version.yesterdayReportCreatedAt || version.projectVersionCreatedAt;
      const filename = `${report.projectName}-${type === "client" ? "client" : "internal"}-report-${reportDate.toISOString().split("T")[0]}.pdf`;
      
      // Use the triggerDownload function with proper delay
      await triggerDownload(blob, filename);

      toast.success(`${type === "client" ? "Client" : "Internal"} report downloaded`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Check your browser's download settings, refresh the page, and try again. If the problem continues, contact support.", {
        duration: 5000,
      });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: ReportStatus): string => {
    switch (status) {
      case "APPROVED":
        return "text-success";
      case "PENDING":
        return "text-warning";
      case "REJECTED":
        return "text-error";
      default:
        return "text-text-secondary";
    }
  };

  const getStatusLabel = (status: ReportStatus): string => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "PENDING":
        return "Pending";
      case "REJECTED":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="mx-auto mb-3 animate-spin text-text-secondary" />
          <p className="text-text-secondary">Loading report history...</p>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Icon name="FileText" size={48} className="mx-auto mb-3 text-text-secondary opacity-50" />
          <p className="text-text-secondary">Please select a project to view report history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-card border-border rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={20} color="var(--color-primary)" />
            <h3 className="text-text-primary text-lg font-semibold">
              Report History
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Report Type Filter */}
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">
              Report Type
            </Label>
            <Select
              value={reportTypeFilter}
              onValueChange={(value) => setReportTypeFilter(value as ReportType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="client">Client Reports</SelectItem>
                <SelectItem value="internal">Internal Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-card border-border rounded-lg border">
        {reports.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Icon
                name="FileText"
                size={48}
                color="var(--color-text-secondary)"
                className="mx-auto mb-3 opacity-50"
              />
              <p className="text-text-secondary">No reports found for this project</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border-border flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Icon name="FileText" size={20} className="text-text-secondary" />
                    <div>
                      <h4 className="text-text-primary font-medium">
                        {report.projectName}
                      </h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm">
                        <span className="text-text-secondary">
                          {formatDate(report.date)}
                        </span>
                        <span className={`font-medium ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {(reportTypeFilter === "all" || reportTypeFilter === "internal") && (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                      onClick={() => generatePDF(report.id, "internal")}
                      disabled={generatingPdfId === report.id}
                      loading={generatingPdfId === report.id}
                    >
                      Internal PDF
                    </Button>
                  )}
                  {(reportTypeFilter === "all" || reportTypeFilter === "client") && (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                      onClick={() => generatePDF(report.id, "client")}
                      disabled={generatingPdfId === report.id}
                      loading={generatingPdfId === report.id}
                    >
                      Client PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportHistory;

