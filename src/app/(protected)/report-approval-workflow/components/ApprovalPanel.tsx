import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import { PriorityLevel, ReportStatus, Role } from "@prisma/client";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { ReportClientPDF, ReportTeamPDF } from "./ReportPDF";
import { sendEmail } from "@/lib/send-email";
import { useProjectStore } from "@/store/project.store";
import type { BlockageType } from "@/validators/prisma-schmea.validator";

// Types
interface ReportComment {
  author: string;
  content: string;
  createdAt: string;
  action?: ReportStatus;
}

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

interface ApprovalPanelProps {
  report: WorkflowReport | null;
  onApprove: (reportId: string, comment: string) => Promise<void>;
  // onRequestChanges: (reportId: string, comment: string) => Promise<void>;
  onReject: (reportId: string, comment: string) => Promise<void>;
}

type ActionType = "approve" | "request-changes" | "reject";

const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  report,
  onApprove,
  // onRequestChanges,
  onReject,
}) => {
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const { data: session } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  const project = useProjectStore.getState().getProject();

  const ensureProjectContext = (): void => {
    if (!project?.latestProjectVersion) {
      throw new Error("No project context available for PDF generation");
    }
  };

  const generatePDFBlobs = async (): Promise<{
    teamBlob: Blob;
    clientBlob: Blob;
  }> => {
    if (!report) {
      throw new Error("Missing report data");
    }
    ensureProjectContext();

    const reportWithProject = {
      ...report,
      project,
    };

    const [teamBlob, clientBlob] = await Promise.all([
      pdf(<ReportTeamPDF report={reportWithProject} />).toBlob(),
      pdf(<ReportClientPDF report={reportWithProject} />).toBlob(),
    ]);

    return { teamBlob, clientBlob };
  };

  const triggerDownload = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async (): Promise<void> => {
    try {
      setIsDownloading(true);
      const { teamBlob, clientBlob } = await generatePDFBlobs();
      const projectName =
        project?.latestProjectVersion?.projectName ?? "daily-report";

      triggerDownload(teamBlob, `${projectName}-team-report.pdf`);
      triggerDownload(clientBlob, `${projectName}-client-report.pdf`);

      toast.success("PDFs downloaded");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download PDFs. Try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendPDF = async (): Promise<void> => {
    try {
      const { teamBlob, clientBlob } = await generatePDFBlobs();
      const projectName =
        project?.latestProjectVersion?.projectName ?? "daily-report";

      const teamAttachments = [
        {
          filename: `${projectName}-team-report.pdf`,
          content: teamBlob,
        },
      ];

      const clientAttachments = [
        {
          filename: `${projectName}-client-report.pdf`,
          content: clientBlob,
        },
      ];

      await sendEmail({
        to: project?.latestProjectVersion?.client?.clientEmail ?? "",
        cc:
          project?.latestProjectVersion?.client?.clientCCEmails
            ?.split(",")
            .map((email) => email.trim()) ?? [],
        subject: `Progress Report | ${projectName} | ${new Date().toLocaleDateString(
          "en-IN",
          { day: "2-digit", month: "2-digit", year: "numeric" },
        )}`,
        emailProps: { toClient: true, clientName: "Vali" },
        attachments: clientAttachments,
      });

      await sendEmail({
        to: project?.latestProjectVersion?.client?.internalEmail ?? "",
        cc:
          project?.latestProjectVersion?.client?.internalCCEmails
            ?.split(",")
            .map((email) => email.trim()) ?? [],
        subject: `Progress Report | ${projectName} | ${new Date().toLocaleDateString(
          "en-IN",
          { day: "2-digit", month: "2-digit", year: "numeric" },
        )}`,
        emailProps: { toClient: false },
        attachments: teamAttachments,
      });

      toast.success("PDF generated and sent to client and team successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("PDF generation failed. Please try again.");
    }
  };

  const handleAction = async (action: ActionType): Promise<void> => {
    if (
      (action === "request-changes" || action === "reject") &&
      !comment.trim()
    ) {
      toast.error("Comment is required for this action");
      return;
    }

    setIsSubmitting(true);
    setSelectedAction(action);

    try {
      switch (action) {
        case "approve":
          await handleSendPDF();
          await onApprove(report?.id?.toString() ?? "", comment);
          toast.success("Report approved successfully");
          break;
        // case "request-changes":
        //   await onRequestChanges(report.id, comment);
        //   break;
        case "reject":
          await onReject(report?.id?.toString() ?? "", comment);
          // toast.success("Report rejected successfully");
          break;
      }
      setComment("");
      setRefreshKey((prev) => prev + 1); // Force rerender
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (!report) {
    return (
      <div className="bg-surface border-border flex h-full items-center justify-center border-l">
        <div className="p-4 text-center">
          <Icon
            name="MessageSquare"
            size={48}
            className="text-text-secondary mx-auto mb-4"
          />
          <h3 className="text-text-primary mb-2 text-lg font-medium">
            No Report Selected
          </h3>
          <p className="text-text-secondary text-sm">
            Select a report to view approval options
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border flex h-full flex-col border-l bg-white">
      {/* Header */}
      {session?.user?.customRole !== Role.PROJECT_MANAGER && (
        <div className="border-border border-b p-4">
          <h2 className="text-text-primary mb-2 text-lg font-semibold">
            Approval Actions
          </h2>
          <div className="text-text-secondary flex items-center space-x-2 text-sm">
            <Icon name="Clock" size={14} />
            <span>Submitted {formatDate(report.submittedAt)}</span>
          </div>
        </div>
      )}

      {/* Report Info */}
      {session?.user?.customRole !== Role.PROJECT_MANAGER && (
        <div className="border-border border-b p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Status</span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  report.yesterdayReportStatus === ReportStatus.PENDING
                    ? "bg-warning/10 text-warning border-warning/20 border"
                    : report.yesterdayReportStatus === ReportStatus.APPROVED
                      ? "bg-success/10 text-success border-success/20 border"
                      : "bg-error/10 text-error border-error/20 border"
                }`}
              >
                {report.yesterdayReportStatus}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Priority</span>
              <div className="flex items-center space-x-1">
                <Icon
                  name="AlertCircle"
                  size={14}
                  className={
                    report.priority === PriorityLevel.HIGH_PRIORITY
                      ? "text-error"
                      : report.priority === PriorityLevel.MEDIUM_PRIORITY
                        ? "text-warning"
                        : "text-success"
                  }
                />
                <span className="text-text-primary text-sm font-medium capitalize">
                  {report.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Progress</span>
              <span className="text-text-primary text-sm font-medium">
                {Math.min(report.overallProgress, 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comment Section */}
      {session?.user?.customRole !== Role.PROJECT_MANAGER && (
        <div className="flex-1 p-4">
          <div className="mb-4">
            <div className="mb-4">
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Add Comment
              </label>
              <p className="text-text-secondary mb-3 text-xs">
                Comments are required for requesting changes or rejecting
                reports
              </p>
            </div>

            <textarea
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
              placeholder="Provide detailed feedback about the report..."
              className="border-border bg-input text-text-primary placeholder-text-secondary focus:ring-primary h-32 w-full resize-none rounded-md border p-3 focus:border-transparent focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              iconName="Download"
              iconPosition="left"
              loading={isDownloading}
              disabled={isSubmitting || isDownloading}
              onClick={() => void handleDownloadPDF()}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Download PDFs
            </Button>
            <Button
              variant="default"
              fullWidth
              iconName="CheckCircle"
              iconPosition="left"
              loading={isSubmitting && selectedAction === "approve"}
              disabled={isSubmitting}
              onClick={() => handleAction("approve")}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Approve Report
            </Button>

            {/* <Button
            variant="outline"
            fullWidth
            iconName="MessageCircle"
            iconPosition="left"
            loading={isSubmitting && selectedAction === "request-changes"}
            disabled={isSubmitting || !comment.trim()}
            onClick={() => handleAction("request-changes")}
            className="border-warning text-warning hover:bg-warning/10"
          >
            Request Changes
          </Button> */}

            <Button
              variant="destructive"
              fullWidth
              iconName="XCircle"
              iconPosition="left"
              loading={isSubmitting && selectedAction === "reject"}
              disabled={isSubmitting || !comment.trim()}
              onClick={() => {
                if (!comment.trim()) {
                  toast.error("Comment is required for this action");
                  return;
                }
                void handleAction("reject");
              }}
            >
              Reject Report
            </Button>
          </div>
        </div>
      )}

      {/* Previous Comments */}
      {report.comments && report.comments.length > 0 && (
        <div className="border-border z-0 border-t">
          <div className="p-4">
            <h3 className="text-text-primary mb-3 flex items-center text-sm font-medium">
              <Icon name="MessageSquare" size={16} className="mr-2" />
              Previous Comments ({report.comments.length})
            </h3>
            <div className="max-h-48 space-y-3 overflow-y-auto">
              {report.comments.map(
                (commentItem: ReportComment, index: number) => (
                  <div key={index} className="bg-muted/50 rounded-md p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-text-primary text-sm font-medium">
                        {commentItem.author}
                      </span>
                      <span className="text-text-secondary text-xs">
                        {formatDate(commentItem.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-primary text-sm">
                      {commentItem.content}
                    </p>
                    {commentItem.action && (
                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          commentItem.action === ReportStatus.APPROVED
                            ? "bg-success/10 text-success"
                            : commentItem.action === ReportStatus.REJECTED
                              ? "bg-error/10 text-error"
                              : "bg-warning/10 text-warning"
                        }`}
                      >
                        {commentItem.action}
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {/* <div className="border-border bg-muted/30 z-0 border-t p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-text-secondary mb-1 text-xs">Photos</p>
            <p className="text-text-primary text-lg font-semibold">
              {report.photosCount}
            </p>
          </div>
          <div>
            <p className="text-text-secondary mb-1 text-xs">Items</p>
            <p className="text-text-primary text-lg font-semibold">
              {report.completedItems}/{report.totalItems}
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ApprovalPanel;
