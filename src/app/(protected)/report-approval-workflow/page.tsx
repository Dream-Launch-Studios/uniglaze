/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import ReportsList from "./components/ReportsList";
import ReportPreview from "./components/ReportPreview";
import ApprovalPanel from "./components/ApprovalPanel";
import { api } from "@/trpc/react";
import { type PriorityLevel, ReportStatus, Role } from "@prisma/client";
import {
  projectVersionSchema,
  type BlockageType,
} from "@/validators/prisma-schmea.validator";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { useProjectStore } from "@/store/project.store";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

// TypeScript interfaces
interface Photo {
  url: string;
  description: string;
}

interface Blockage {
  title: string;
  description: string;
  type: BlockageType;
  reportedAt: string;
}

interface ReportComment {
  author: string;
  content: string;
  action: ReportStatus;
  createdAt: string;
}

interface ProgressDetail {
  itemName: string;
  yetToSupply: number | string;
  yetToInstall: number | string;
  completed: number | string;
  progress: number;
  notes?: string;
}

interface WorkflowReport {
  id: number;
  projectName: string;
  submittedBy: string;
  submittedAt: string;
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
  yesterdayReportStatus: ReportStatus;
}

// Safe date formatting helper
const safeToLocaleString = (date: any): string => {
  if (!date) return new Date().toLocaleString();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return new Date().toLocaleString();
  return parsedDate.toLocaleString();
};

const ReportApprovalWorkflow: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WorkflowReport | null>(
    null,
  );
  const [reports, setReports] = useState<WorkflowReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { data: session, isPending } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  // Check authentication and customRole
  useEffect(() => {
    if (isPending) return;

    if (session && !session?.user) {
      router.push("/login");
      return;
    }
  }, [session, router, isPending]);

  const searchParams = useSearchParams();
  const isPDF = searchParams.get("pdf") === "true";
  const projectId = searchParams.get("projectId");

  const utils = api.useUtils();

  const { mutateAsync: createProjectVersion } =
    api.project.createProjectVersion.useMutation({
      onSuccess: async () => {
        toast.success("Report saved successfully");
        await utils.project.getAllProjectsWithLatestVersion.invalidate();
        window.location.reload();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const {
    pushToComments,
    setProject,
    updateSupplyAndInstallationsFromYesterdayProgressReport,
  } = useProjectStore();

  const { data: projects, isLoading: isProjectsLoading } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  // Mock data for reports
  // const mockReports: WorkflowReport[] = [
  //   {
  //     id: 1,
  //     projectName: "Prestige Tech Park - Phase 2",
  //     submittedBy: "Rajesh Kumar",
  //     submittedAt: "2025-01-25T09:30:00",
  //     status: "pending",
  //     priority: "high",
  //     overallProgress: 75,
  //     completedItems: 12,
  //     totalItems: 16,
  //     photosCount: 8,
  //     hasPhotos: true,
  //     hasComments: true,
  //     hasChanges: true,
  //     lastComment: "Please verify the glass thickness measurements",
  //     workSummary: `Today's work focused on the installation of curtain wall systems on floors 8-10. The team successfully completed the structural glazing for the east facade.\n\nKey achievements:\n- Installed 24 glass panels (8mm thickness)\n- Completed waterproofing for 3 sections\n- Conducted quality checks on all installations\n\nChallenges faced:\n- Weather conditions caused minor delays\n- Material delivery was 2 hours late`,
  //     progressDetails: [
  //       {
  //         itemName: "Curtain Wall - East Facade",
  //         status: "in-progress",
  //         yetToSupply: "45 panels",
  //         yetToInstall: "32 panels",
  //         completed: "68 panels",
  //         progress: 68,
  //         notes:
  //           "Installation proceeding as per schedule. Quality checks completed.",
  //       },
  //       {
  //         itemName: "Structural Glazing - Floor 8",
  //         status: "completed",
  //         yetToSupply: "0 units",
  //         yetToInstall: "0 units",
  //         completed: "24 units",
  //         progress: 100,
  //         notes: "All units installed and tested. Waterproofing completed.",
  //       },
  //       {
  //         itemName: "Window Installation - North Wing",
  //         status: "not-started",
  //         yetToSupply: "18 units",
  //         yetToInstall: "18 units",
  //         completed: "0 units",
  //         progress: 0,
  //         notes: "Waiting for material delivery scheduled for tomorrow.",
  //       },
  //     ],
  //     photos: [
  //       {
  //         url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
  //         description: "East facade curtain wall installation progress",
  //       },
  //       {
  //         url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
  //         description: "Structural glazing quality check",
  //       },
  //       {
  //         url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
  //         description: "Waterproofing application on floor 8",
  //       },
  //       {
  //         url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
  //         description: "Team safety briefing before installation",
  //       },
  //     ],
  //     blockages: [
  //       {
  //         title: "Material Delivery Delay",
  //         description:
  //           "Glass panels delivery was delayed by 2 hours due to traffic conditions",
  //         type: "team-side",
  //         reportedAt: "2025-01-25T07:30:00",
  //       },
  //     ],
  //     comments: [
  //       {
  //         author: "Mr. Vamsi",
  //         content:
  //           "Good progress on the east facade. Please ensure all safety protocols are followed.",
  //         action: "approved",
  //         createdAt: "2025-01-24T16:45:00",
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     projectName: "Brigade Gateway - Tower B",
  //     submittedBy: "Priya Sharma",
  //     submittedAt: "2025-01-25T08:45:00",
  //     status: "pending",
  //     priority: "medium",
  //     overallProgress: 45,
  //     completedItems: 8,
  //     totalItems: 18,
  //     photosCount: 6,
  //     hasPhotos: true,
  //     hasComments: false,
  //     hasChanges: false,
  //     lastComment: undefined,
  //     workSummary: `Focus on interior glass partitions and door installations. Team worked on floors 5-7 with good progress on partition systems.\n\nCompleted tasks:\n- Installed 16 glass partitions\n- Completed door frame installations\n- Conducted measurements for next phase\n\nUpcoming work:\n- Door glass installation scheduled for tomorrow\n- Quality inspection planned for completed sections`,
  //     progressDetails: [
  //       {
  //         itemName: "Glass Partitions - Floor 5",
  //         status: "completed",
  //         yetToSupply: "0 panels",
  //         yetToInstall: "0 panels",
  //         completed: "16 panels",
  //         progress: 100,
  //         notes: "All partitions installed and tested successfully.",
  //       },
  //       {
  //         itemName: "Door Installation - Floors 6-7",
  //         status: "in-progress",
  //         yetToSupply: "8 doors",
  //         yetToInstall: "12 doors",
  //         completed: "6 doors",
  //         progress: 33,
  //         notes: "Frame installation completed. Glass fitting in progress.",
  //       },
  //     ],
  //     photos: [
  //       {
  //         url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
  //         description: "Glass partition installation on floor 5",
  //       },
  //       {
  //         url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400",
  //         description: "Door frame preparation work",
  //       },
  //     ],
  //     blockages: [],
  //     comments: [],
  //   },
  //   {
  //     id: 3,
  //     projectName: "UB City Mall - Renovation",
  //     submittedBy: "Amit Patel",
  //     submittedAt: "2025-01-25T10:15:00",
  //     status: "approved",
  //     priority: "low",
  //     overallProgress: 90,
  //     completedItems: 14,
  //     totalItems: 15,
  //     photosCount: 4,
  //     hasPhotos: true,
  //     hasComments: true,
  //     hasChanges: false,
  //     lastComment: "Excellent work quality. Approved for next phase.",
  //     workSummary: `Final phase of renovation work with focus on finishing touches and quality assurance.\n\nCompleted activities:\n- Final glass cleaning and polishing\n- Hardware adjustments and calibration\n- Safety testing of all installations\n\nProject nearing completion with only minor touch-ups remaining.`,
  //     progressDetails: [
  //       {
  //         itemName: "Storefront Glass - Main Entrance",
  //         status: "completed",
  //         yetToSupply: "0 panels",
  //         yetToInstall: "0 panels",
  //         completed: "8 panels",
  //         progress: 100,
  //         notes: "Installation completed with excellent finish quality.",
  //       },
  //     ],
  //     photos: [
  //       {
  //         url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
  //         description: "Completed storefront installation",
  //       },
  //     ],
  //     blockages: [],
  //     comments: [
  //       {
  //         author: "Mr. Vamsi",
  //         content: "Excellent work quality. Approved for next phase.",
  //         action: "approved",
  //         createdAt: "2025-01-25T11:30:00",
  //       },
  //     ],
  //   },
  // ];

  useEffect(() => {
    // Simulate API call
    const loadReports = async (): Promise<void> => {
      setLoading(true);
      try {
        // Simulate network delay
        const mockReports: WorkflowReport[] =
          projects?.data?.map((project) => {
            return {
              id: project.latestProjectVersion.projectId!,
              projectName: project.latestProjectVersion.projectName,
              submittedBy: project.assignedProjectManager?.name ?? "",
              submittedAt: safeToLocaleString(
                project.latestProjectVersion?.yesterdayReportCreatedAt,
              ),
              yesterdayReportStatus: project.latestProjectVersion
                .yesterdayReportStatus as unknown as ReportStatus,
              priority: project.latestProjectVersion
                .priorityLevel as unknown as PriorityLevel,
              overallProgress: Array.isArray(
                project?.latestProjectVersion?.sheet1,
              )
                ? +(
                    project?.latestProjectVersion?.sheet1?.reduce(
                      (acc, item) => acc + (item?.percentInstalled || 0),
                      0,
                    ) / (project?.latestProjectVersion?.sheet1?.length ?? 1)
                  ).toFixed(2)
                : 0,
              completedItems:
                project?.latestProjectVersion?.sheet1?.filter(
                  (item) => item?.totalQuantity === item?.totalInstalled,
                ).length ?? 0,
              totalItems: project?.latestProjectVersion?.sheet1?.length ?? 0,
              photosCount:
                project?.latestProjectVersion?.sheet1?.reduce(
                  (acc, item) =>
                    acc + (item?.yesterdayProgressPhotos?.length ?? 0),
                  0,
                ) ?? 0,
              hasPhotos:
                (project?.latestProjectVersion?.sheet1?.reduce(
                  (acc, item) =>
                    acc + (item?.yesterdayProgressPhotos?.length ?? 0),
                  0,
                ) ?? 0) > 0,
              hasComments:
                Array.isArray(project?.latestProjectVersion?.comments) &&
                project?.latestProjectVersion?.comments?.length > 0,
              hasChanges:
                Array.isArray(project?.latestProjectVersion?.comments) &&
                project?.latestProjectVersion?.comments?.length > 0,
              lastComment: Array.isArray(
                project?.latestProjectVersion?.comments,
              )
                ? project?.latestProjectVersion?.comments[
                    project?.latestProjectVersion?.comments?.length - 1
                  ]?.comment
                : "",
              progressDetails:
                project?.latestProjectVersion?.sheet1?.map((item) => ({
                  itemName: item?.itemName,
                  yetToSupply: item?.yetToSupply,
                  yetToInstall: item?.yetToInstall,
                  completed: item?.totalInstalled,
                  progress: item?.percentInstalled,
                  notes: item?.itemName,
                })) ?? [],
              photos: (project.latestProjectVersion.sheet1?.flatMap((item) =>
                item?.yesterdayProgressPhotos?.map((photo) => ({
                  url: photo?.photos[0]?.url,
                  description: photo?.description,
                })),
              ) ?? []) as Photo[],
              blockages:
                project.latestProjectVersion.sheet1?.flatMap((item) =>
                  (item?.blockages ?? [])?.map((blockage) => ({
                    title: blockage?.category,
                    description: blockage?.description,
                    type: blockage?.type,
                    reportedAt: safeToLocaleString(blockage?.blockageStartTime),
                  })),
                ) ?? [],
              comments:
                project.latestProjectVersion.comments?.map((item) => ({
                  content: item?.comment,
                  author: item?.author,
                  action: project.latestProjectVersion
                    .yesterdayReportStatus as unknown as ReportStatus,
                  createdAt: safeToLocaleString(item?.createdAt),
                })) ?? [],
            };
          }) ?? [];
        // TODO: uncomment after UI chnages
        let filteredReports: WorkflowReport[] = [];
        if (session?.user?.customRole === Role.PROJECT_MANAGER) {
          filteredReports = mockReports.filter(
            (item) => item?.yesterdayReportStatus === ReportStatus.REJECTED,
          );
        } else {
          filteredReports = mockReports.filter(
            (item) =>
              item?.yesterdayReportStatus === ReportStatus.PENDING ||
              item?.yesterdayReportStatus === ReportStatus.REJECTED,
          );
        }
        setReports(filteredReports);
        
        if (projectId) {
          const project = filteredReports.find((r) => r.id === parseInt(projectId));
          if (project) setSelectedReport(project);
        } else {
          // Auto-select first pending report
          const firstPending = filteredReports.find(
            (r) => r.yesterdayReportStatus === ReportStatus.PENDING,
          );
          if (firstPending) setSelectedReport(firstPending);
        }
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, [isProjectsLoading, isPDF, projectId, projects?.data, session?.user?.customRole]);

  // const handleSelectReport = (report: WorkflowReport): void => {
  //   setSelectedReport(report);
  // };

  // Type adapter for ReportsList component
  const handleSelectReportAdapter = (report: { id: number | string }): void => {
    // Find the full WorkflowReport from our reports array
    const project = projects?.data?.find(
      (p) => p.latestProjectVersion.projectId === report.id,
    );
    if (project) {
      setProject(project);
    }
    const fullReport = reports.find((r) => r.id === report.id);
    if (fullReport) {
      setSelectedReport(fullReport);
    }
  };

  const handleApprove = async (
    reportId: number | string,
    comment?: string,
  ): Promise<void> => {
    pushToComments({
      comment: comment ?? "Report approved",
      createdAt: new Date(),
      author: session?.user?.name ?? "",
    });

    updateSupplyAndInstallationsFromYesterdayProgressReport();

    const currentProject = useProjectStore.getState().getProject();
    const validated = projectVersionSchema.safeParse(
      currentProject.latestProjectVersion,
    );
    if (!validated.success) {
      toast.error(validated.error.message);
      return;
    }

    const projectVersion = await createProjectVersion({
      ...validated.data,
      yesterdayReportStatus: ReportStatus.APPROVED,
    });

    // TODO: send email

    toast.success("Report approved successfully");

    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              yesterdayReportStatus: ReportStatus.APPROVED,
              comments: [
                ...(report.comments || []),
                {
                  author: session?.user?.name ?? "",
                  content: comment ?? "Report approved",
                  action: ReportStatus.APPROVED,
                  createdAt: new Date().toLocaleString(),
                },
              ],
            }
          : report,
      ),
    );

    // Update selected report
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              yesterdayReportStatus: ReportStatus.APPROVED,
              comments: [
                ...(prev.comments || []),
                {
                  author: session?.user?.name ?? "",
                  content: comment ?? "Report approved",
                  action: ReportStatus.APPROVED,
                  createdAt: new Date().toLocaleString(),
                },
              ],
            }
          : null,
      );
    }
  };

  // const handleRequestChanges = async (
  //   reportId: number | string,
  //   comment: string,
  // ): Promise<void> => {
  //   // Simulate API call
  //   await new Promise((resolve) => setTimeout(resolve, 1500));

  //   setReports((prevReports) =>
  //     prevReports.map((report) =>
  //       report.id === reportId
  //         ? {
  //             ...report,
  //             status: "pending" as const,
  //             comments: [
  //               ...(report.comments || []),
  //               {
  //                 author: "Mr. Vamsi",
  //                 content: comment,
  //                 action: "requested-changes" as const,
  //                 createdAt: new Date()?.toLocaleString(),
  //               },
  //             ],
  //           }
  //         : report,
  //     ),
  //   );

  //   // Update selected report
  //   if (selectedReport?.id === reportId) {
  //     setSelectedReport((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             status: "pending" as const,
  //             comments: [
  //               ...(prev.comments || []),
  //               {
  //                 author: "Mr. Vamsi",
  //                 content: comment,
  //                 action: "requested-changes" as const,
  //                 createdAt: new Date()?.toLocaleString(),
  //               },
  //             ],
  //           }
  //         : null,
  //     );
  //   }
  // };

  const handleReject = async (
    reportId: number | string,
    comment: string,
  ): Promise<void> => {
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    pushToComments({
      comment: comment ?? "Report rejected",
      createdAt: new Date(),
      author: session?.user?.name ?? "",
    });

    const currentProject = useProjectStore.getState().getProject();
    const validated = projectVersionSchema.safeParse(
      currentProject.latestProjectVersion,
    );
    if (!validated.success) {
      toast.error(validated.error.message);
      return;
    }

    const projectVersion = await createProjectVersion({
      ...validated.data,
      yesterdayReportStatus: ReportStatus.REJECTED,
    });

    toast.success("Report rejected successfully");

    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              yesterdayReportStatus: ReportStatus.REJECTED,
              comments: [
                ...(report.comments || []),
                {
                  author: session?.user?.name ?? "",
                  content: comment,
                  action: ReportStatus.REJECTED,
                  createdAt: new Date().toLocaleString(),
                },
              ],
            }
          : report,
      ),
    );

    // Update selected report
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              yesterdayReportStatus: ReportStatus.REJECTED,
              comments: [
                ...(prev.comments || []),
                {
                  author: session?.user?.name ?? "",
                  content: comment,
                  action: ReportStatus.REJECTED,
                  createdAt: new Date().toLocaleString(),
                },
              ],
            }
          : null,
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <Sidebar />
        <div className="pt-16 md:ml-60">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
              <p className="text-text-secondary">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {!isPDF && <Header />}
      {!isPDF && <Sidebar />}

      <div className="pt-16 md:ml-60">
        <div className="p-6">
          {!isPDF && <Breadcrumb />}

          {!isPDF && (
            <div className="mb-6">
              <h1 className="text-text-primary mb-2 text-2xl font-bold">
                Report Approval Workflow
              </h1>
              <p className="text-text-secondary">
                Review and approve daily progress reports submitted by project
                managers
              </p>
            </div>
          )}

          {/* Three Panel Layout */}
          <div className="grid h-[calc(100vh-200px)] grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Reports List - Left Panel */}
            {!isPDF && (
              <div className="lg:col-span-3">
                <ReportsList
                  reports={reports}
                  selectedReport={selectedReport}
                  onSelectReport={handleSelectReportAdapter}
                />
              </div>
            )}

            {/* Report Preview - Center Panel */}
            <div className="lg:col-span-6">
              <ReportPreview report={selectedReport} />
            </div>

            {/* Approval Panel - Right Panel */}
            {!isPDF && (
              <div className="lg:col-span-3">
                <ApprovalPanel
                  report={selectedReport}
                  onApprove={handleApprove}
                  // onRequestChanges={handleRequestChanges}
                  onReject={handleReject}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReportApprovalWorkflowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportApprovalWorkflow />
    </Suspense>
  );
}
