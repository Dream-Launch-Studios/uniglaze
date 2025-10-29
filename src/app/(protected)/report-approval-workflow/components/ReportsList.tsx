import React from "react";
import Icon from "@/components/rocket/components/AppIcon";
import NotificationBadge from "@/components/rocket/components/ui/NotificationBadge";
import { type PriorityLevel, ReportStatus } from "@prisma/client";

// Types
interface Report {
  id: string | number;
  projectName: string;
  submittedBy: string;
  submittedAt: string | Date;
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
}

interface ReportsListProps {
  reports: Report[];
  selectedReport: Report | null;
  onSelectReport: (report: Report) => void;
}

const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  selectedReport,
  onSelectReport,
}) => {
  const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "text-error";
      case "medium":
        return "text-warning";
      default:
        return "text-success";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-error/10 text-error border-error/20";
      default:
        return "bg-muted text-text-secondary border-border";
    }
  };

  return (
    <div className="bg-surface border-border flex h-full flex-col border-r">
      <div className="border-border border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-text-primary text-lg font-semibold">
            Pending Reports
          </h2>
          <NotificationBadge
            count={
              reports.filter(
                (r) => r.yesterdayReportStatus === ReportStatus.PENDING,
              ).length
            }
            variant="warning"
          />
        </div>

        <div className="relative">
          <Icon
            name="Search"
            size={16}
            className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2 transform"
          />
          <input
            type="text"
            placeholder="Search reports..."
            className="border-border bg-input text-text-primary placeholder-text-secondary focus:ring-primary w-full rounded-md border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => onSelectReport(report)}
            className={`border-border transition-smooth hover:bg-muted cursor-pointer border-b p-4 ${
              selectedReport?.id === report.id
                ? "bg-primary/5 border-l-primary border-l-4"
                : ""
            }`}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-text-primary truncate font-medium">
                  {report.projectName}
                </h3>
                <p className="text-text-secondary truncate text-sm">
                  {report.submittedBy}
                </p>
              </div>
              <div className="ml-2 flex items-center space-x-2">
                <Icon
                  name="AlertCircle"
                  size={14}
                  className={getPriorityColor(report.priority)}
                />
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(
                    report.yesterdayReportStatus,
                  )}`}
                >
                  {report.yesterdayReportStatus}
                </span>
              </div>
            </div>

            <div className="text-text-secondary flex items-center justify-between text-xs">
              <span>{formatDate(report.submittedAt)}</span>
              <div className="flex items-center space-x-2">
                {report.hasPhotos && <Icon name="Camera" size={12} />}
                {report.hasComments && <Icon name="MessageCircle" size={12} />}
                {report.hasChanges && (
                  <Icon name="Edit" size={12} className="text-warning" />
                )}
              </div>
            </div>

            {report.lastComment && (
              <p className="text-text-secondary mt-2 line-clamp-2 text-xs">
                Latest: {report.lastComment}
              </p>
            )}
          </div>
        ))}
        {reports.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-secondary">
              No reports need your attention for now
            </p>
          </div>
        )}
      </div>

      {/* <div className="border-border bg-muted/50 border-t p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Total Reports</span>
          <span className="text-text-primary font-medium">
            {reports.length}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-text-secondary">Pending Approval</span>
          <span className="text-warning font-medium">
            {
              reports.filter(
                (r) => r.yesterdayReportStatus === ReportStatus.PENDING,
              ).length
            }
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default ReportsList;
