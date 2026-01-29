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
      throw new Error("Cannot generate PDF: No project data found. Please select a project first.");
    }
  };

  const generatePDFBlobs = async (): Promise<{
    teamBlob: Blob;
    clientBlob: Blob;
  }> => {
    if (!report) {
      throw new Error("Cannot generate PDF: Report data is missing. Please ensure the report is loaded correctly.");
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

  const triggerDownload = (blob: Blob, filename: string): Promise<void> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      // Small delay to ensure download starts before cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 100);
    });
  };

  const handleDownloadPDF = async (): Promise<void> => {
    try {
      setIsDownloading(true);
      const { teamBlob, clientBlob } = await generatePDFBlobs();
      const projectName =
        project?.latestProjectVersion?.projectName ?? "daily-report";

      // Download sequentially with small delay to avoid browser blocking
      await triggerDownload(teamBlob, `${projectName}-internal-team-report.pdf`);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await triggerDownload(clientBlob, `${projectName}-client-report.pdf`);

      toast.success("PDFs downloaded");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download PDFs. Check your browser's download settings or try refreshing the page. If the problem continues, contact support.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendPDF = async (): Promise<void> => {
    const clientEmailRaw = project?.latestProjectVersion?.client?.clientEmail ?? "";
    const internalEmailRaw = project?.latestProjectVersion?.client?.internalEmail ?? "";
    const clientEmails = clientEmailRaw.split(",").map((e) => e.trim()).filter(Boolean);
    const internalEmails = internalEmailRaw.split(",").map((e) => e.trim()).filter(Boolean);
    const clientEmail = clientEmails[0] ?? "";
    const internalEmail = internalEmails[0] ?? "";
    const clientCC = [
      ...clientEmails.slice(1),
      ...(project?.latestProjectVersion?.client?.clientCCEmails
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0) ?? []),
    ];
    const internalCC = [
      ...internalEmails.slice(1),
      ...(project?.latestProjectVersion?.client?.internalCCEmails
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0) ?? []),
    ];
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/a29a5f74-0241-4040-b26d-3120f9f873db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "ApprovalPanel.tsx:handleSendPDF",
        message: "handleSendPDF started",
        data: { clientEmail, internalEmail, hasClient: !!clientEmail, hasInternal: !!internalEmail },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H4",
      }),
    }).catch(() => {});
    // #endregion
    if (!clientEmail.trim()) {
      toast.error(
        "Client email is not set for this project. Add it in project settings (Client information) before sending.",
      );
      return;
    }
    if (!internalEmail.trim()) {
      toast.error(
        "Internal team email is not set for this project. Add it in project settings (Client information) before sending.",
      );
      return;
    }
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
        to: clientEmail,
        cc: clientCC,
        subject: `Progress Report | ${projectName} | ${new Date().toLocaleDateString()}`,
        emailProps: { toClient: true, clientName: "Vali" },
        attachments: clientAttachments,
      });

      await sendEmail({
        to: internalEmail,
        cc: internalCC,
        subject: `Progress Report | ${projectName} | ${new Date().toLocaleDateString()}`,
        emailProps: { toClient: false },
        attachments: teamAttachments,
      });

      toast.success("PDF generated and sent to client and team successfully");
    } catch (error) {
      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/a29a5f74-0241-4040-b26d-3120f9f873db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "ApprovalPanel.tsx:handleSendPDF",
          message: "handleSendPDF error",
          data: { errorMessage: error instanceof Error ? error.message : String(error) },
          timestamp: Date.now(),
          sessionId: "debug-session",
          hypothesisId: "H5",
        }),
      }).catch(() => {});
      // #endregion
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate and send PDFs. Check that client and internal email addresses are set in project settings, and that your internet connection is working. Try again or contact support.");
    }
  };

  const handleAction = async (action: ActionType): Promise<void> => {
    if (
      (action === "request-changes" || action === "reject") &&
      !comment.trim()
    ) {
      toast.error("Comment is required. Please explain why you are requesting changes or rejecting this report.");
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
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage || "Failed to process your action. Check that all required fields are filled and try again. If the problem continues, contact support.");
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleString();
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
                Comments are required for requesting changes or rejecting reports.
                Be specific so the other person knows what to fix or do.
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
                  toast.error("Comment is required. Please explain why you are requesting changes or rejecting this report.");
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
