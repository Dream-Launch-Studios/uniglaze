/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PriorityLevel, type ProjectStatus } from "@prisma/client";
import { Role } from "@prisma/client";
import type * as LucideIcons from "lucide-react";

import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import ProjectStatusCard from "./_components/ProjectStatusCard";
import QuickActionCard from "./_components/QuickActionCard";
import RecentActivityFeed from "./_components/RecentActivityFeed";
import NotificationPanel from "./_components/NotificationPanel";
import ProjectNavigationTree from "./_components/ProjectNavigationTree";
import TeamPerformanceWidget from "./_components/TeamPerformanceWidget";
import Button from "@/components/rocket/components/ui/Button";
import { api } from "@/trpc/react";
import { useProjectStore } from "@/store/project.store";
import { toast } from "sonner";

// TypeScript interfaces
interface Project {
  id: number;
  name: string;
  client: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  progress: number;
  supplyProgress: number;
  installationProgress: number;
  dueDate: string;
  // teamSize: number;
  daysRemaining: number;
  msTeamsLink?: string;
  projectDocuments: {
    s3Key: string;
    fileName: string;
    fileType: string;
    url: string;
  }[];
}

interface ProjectWithId extends Project {
  assignedPM: string;
  // revenue: string;
  // cost: string;
}

interface KPIData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  // target: string;
  period: string;
  progress: number;
  icon: keyof typeof LucideIcons;
}

interface QuickAction {
  title: string;
  description: string;
  icon: keyof typeof LucideIcons;
  type: "primary" | "accent" | "success" | "warning";
  route: string;
  buttonText: string;
  badge?: { label: string; count: number };
}

interface Activity {
  id: string;
  type:
    | "report_submitted"
    | "photo_uploaded"
    | "blockage_reported"
    | "project_created";
  title: string;
  description: string;
  project: string;
  timestamp: Date;
}

interface Notification {
  id: string | number;
  type: "approval_required" | "alert" | "info" | "report" | "approval";
  title: string;
  message: string;
  priority: PriorityLevel | "high" | "medium" | "low";
  projectName?: string;
  // read: boolean;
  // actionRequired: boolean;
  // actionText?: string;
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const setProject = useProjectStore((state) => state.setProject);

  const { data: recentReportsAndBlockagesListOfProjectsOfManager } =
    api.dashboard.recentReportsAndBlockagesListOfProjectsOfManager.useQuery(
      undefined,
      {},
    );

  const { data: recentReportsAndBlockagesList } =
    api.dashboard.recentReportsAndBlockagesList.useQuery(undefined, {});

  const { data: projectMangersProjectProgressNowAnd30DaysBack } =
    api.dashboard.projectMangersProjectProgressNowAnd30DaysBack.useQuery(
      undefined,
      {},
    );

  const { data: projects } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check authentication and customRole
  useEffect(() => {
    if (isPending) return;

    if (session && !session?.user) {
      router.push("/login");
      return;
    }
  }, [session, router, isPending]);

  // If no session, show loading
  if (!session?.user && isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Get user customRole and name from session
  const userRole = session?.user?.customRole;
  const userName = session?.user?.name;

  // Safe date formatting helper
  const safeFormatDate = (date: string | number | Date | null): string => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleDateString();
  };

  const safeDateDiff = (date: string | number | Date | null): number => {
    if (!date) return 0;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 0;
    return Math.ceil(
      (parsedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const getAllProjects = (): ProjectWithId[] => {
    return (
      projects?.data?.map((project, index) => ({
        id: project.latestProjectVersion.projectId ?? index,
        name: project.latestProjectVersion?.projectName,
        client: project.latestProjectVersion?.client?.clientName,
        status: project.latestProjectVersion?.projectStatus,
        priority: project.latestProjectVersion?.priorityLevel,
        progress: project.latestProjectVersion?.sheet1
          ? +Math.min(
              (project.latestProjectVersion?.sheet1?.reduce(
                (acc, curr) =>
                  acc + curr.percentInstalled + curr.percentSupplied,
                0,
              ) *
                0.5) /
                (project.latestProjectVersion?.sheet1?.length ?? 1),
              100,
            ).toFixed(2)
          : 0,
        supplyProgress: project.latestProjectVersion?.sheet1
          ? +Math.min(
              project.latestProjectVersion?.sheet1?.reduce(
                (acc, curr) => acc + curr.percentSupplied,
                0,
              ) / (project.latestProjectVersion?.sheet1?.length ?? 1),
              100,
            ).toFixed(2)
          : 0,
        installationProgress: project.latestProjectVersion?.sheet1
          ? +Math.min(
              project.latestProjectVersion?.sheet1?.reduce(
                (acc, curr) => acc + curr.percentInstalled,
                0,
              ) / (project.latestProjectVersion?.sheet1?.length ?? 1),
              100,
            ).toFixed(2)
          : 0,
        dueDate: safeFormatDate(project.latestProjectVersion?.estimatedEndDate),
        // convert to number of days
        daysRemaining: safeDateDiff(
          project.latestProjectVersion?.estimatedEndDate,
        ),
        msTeamsLink: project.latestProjectVersion?.msTeamsLink,
        projectDocuments:
          project.latestProjectVersion?.projectDocuments ?? [],
        // @ts-expect-error
        assignedPM: project!.latestProjectVersion!.assignedProjectManager!.name,
      })) ?? []
    );
  };

  // Filter projects based on user customRole
  const getFilteredProjects = (): ProjectWithId[] => {
    const allProjects = getAllProjects();

    if (
      userRole === Role.MANAGING_DIRECTOR ||
      userRole === Role.HEAD_OF_PLANNING
    ) {
      return allProjects;
    } else if (userRole === Role.PROJECT_MANAGER) {
      return allProjects.filter((project) => project.assignedPM === userName);
    }

    return [];
  };

  const mockProjects = getFilteredProjects();

  // Mock quick actions based on user customRole and permissions
  const getQuickActions = (): QuickAction[] => {
    if (userRole === Role.MANAGING_DIRECTOR) {
      return [
        {
          title: "Create New Project",
          description: "Set up a new construction project with client details",
          icon: "Plus",
          type: "primary",
          route: "/project-creation",
          buttonText: "Create Project",
        },
        {
          title: "Review Reports",
          description: "Check pending project reports and approvals",
          icon: "FileText",
          type: "accent",
          route: "/report-approval-workflow",
          buttonText: "Review Now",
          // badge: { label: "Pending", count: 5 },
        },
        // {
        //   title: "Team Management",
        //   description: "Manage project assignments and team performance",
        //   icon: "Users",
        //   type: "success",
        //   route: "/project-management-dashboard",
        //   buttonText: "Manage Teams",
        // },
      ];
    } else if (userRole === Role.HEAD_OF_PLANNING) {
      return [
        {
          title: "Approve Reports",
          description: "Review and approve daily progress reports",
          icon: "CheckCircle",
          type: "warning",
          route: "/report-approval-workflow",
          buttonText: "Review Reports",
          // badge: { label: "Pending", count: 8 },
        },
        // {
        //   title: "Assign Projects",
        //   description: "Assign new projects to project managers",
        //   icon: "UserPlus",
        //   type: "primary",
        //   route: "/project-management-dashboard",
        //   buttonText: "Assign Now",
        // },
        // {
        //   title: "Monitor Progress",
        //   description: "Track overall project progress and milestones",
        //   icon: "TrendingUp",
        //   type: "success",
        //   route: "/dashboard",
        //   buttonText: "View Progress",
        // },
        {
          title: "Resolve Blockages",
          description: "Address project blockages and issues",
          icon: "AlertTriangle",
          type: "accent",
          route: "/blockage-management",
          buttonText: "View Issues",
          // badge: { label: "Active", count: 3 },
        },
      ];
    } else {
      return [
        {
          title: "Submit Daily Report",
          description: "Upload today's progress report with photos",
          icon: "FileText",
          type: "primary",
          route: "/project-manager-daily-workflow",
          buttonText: "Submit Report",
        },
        // {
        //   title: "Upload Photos",
        //   description: "Add progress photos to project gallery",
        //   icon: "Camera",
        //   type: "success",
        //   route: "/project-manager-daily-workflow",
        //   buttonText: "Upload Photos",
        // },
        {
          title: "Report Blockage",
          description: "Report any issues or blockages encountered",
          icon: "AlertTriangle",
          type: "warning",
          route: "/project-manager-daily-workflow",
          buttonText: "Report Issue",
        },
        // {
        //   title: "View Projects",
        //   description: "Access your assigned project details",
        //   icon: "FolderOpen",
        //   type: "accent",
        //   route: "/project-manager-daily-workflow",
        //   buttonText: "View Projects",
        // },
      ];
    }
  };

  // Mock team members data - only for HOP/MD
  // const mockTeamMembers: TeamMember[] = [
  //   {
  //     id: 1,
  //     name: "Rajesh Kumar",
  //     customRole: "Project Manager",
  //     performanceScore: 92,
  //     activeProjects: 3,
  //     reportsSubmitted: 45,
  //   },
  //   {
  //     id: 2,
  //     name: "Priya Sharma",
  //     customRole: "Project Manager",
  //     performanceScore: 88,
  //     activeProjects: 2,
  //     reportsSubmitted: 38,
  //   },
  //   {
  //     id: 3,
  //     name: "Amit Patel",
  //     customRole: "Project Manager",
  //     performanceScore: 95,
  //     activeProjects: 4,
  //     reportsSubmitted: 52,
  //   },
  // ];

  const mockTeamMembers = projectMangersProjectProgressNowAnd30DaysBack?.map(
    (manager) => ({
      id: manager.projectManagerName,
      name: manager.projectManagerName,
      customRole: "Project Manager",
      performanceScore: isNaN(
        Math.min(+manager.currentMonthAvgInstallationProgress.toFixed(2), 100),
      )
        ? 0
        : Math.min(
            +manager.currentMonthAvgInstallationProgress.toFixed(2),
            100,
          ),
      activeProjects: manager.numOfProjects,
      reportsSubmitted: manager.numberOfReportsSubmitted,
    }),
  );

  // Mock activities with customRole-based filtering
  const getMockActivities = (): Activity[] => {
    const activities: Activity[] = [];

    if (
      userRole === Role.PROJECT_MANAGER &&
      recentReportsAndBlockagesListOfProjectsOfManager
    ) {
      // Daily Reports
      recentReportsAndBlockagesListOfProjectsOfManager.recentDailyReportsInProjects.forEach(
        (project, projectIndex) => {
          project.dailyReports.forEach((report, reportIndex) => {
            if (report) {
              activities.push({
                id: `report-${project.projectName}-${projectIndex}-${reportIndex}`,
                type: "report_submitted",
                title: "Daily Report Submitted",
                description: `${report.description} - ${report.numberOfPhotos} photos submitted by ${project.assignedProjectManager.name}`,
                project: project.projectName,
                timestamp: new Date(report.dailyReportCreatedAt),
              });
            }
          });
        },
      );

      // Blockages
      recentReportsAndBlockagesListOfProjectsOfManager.recentBlockagesInProjects.forEach(
        (project, projectIndex) => {
          project.blockages.forEach((blockage, blockageIndex) => {
            if (blockage) {
              activities.push({
                id: `blockage-${project.projectName}-${projectIndex}-${blockageIndex}`,
                type: "blockage_reported",
                title: "Blockage Reported",
                description: `${blockage.description} - Status: ${blockage.status} (${blockage.numberOfPhotos} photos)`,
                project: project.projectName,
                timestamp: new Date(blockage.openDate),
              });
            }
          });
        },
      );

      return activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      // const result2: Activity[] = (dashboardData as unknown as ProjectManagerDashboardData).recentDailyReportsBlockagesListAndProjectDeadlineAlertsListOfProjectsOfManagerId.projectDeadlineAlerts.map((item, index) => {
      //   return {
      //     id: item.id.toString(),
      //     type: "project_deadline_alert",
      //     title: "Project Deadline Alert",
      //     description: item.projectDescription,
      //     timestamp: item.projectVersionCreatedAt,
      //     project: item.projectName,
      //   }
      // })
    } else if (
      (userRole === Role.HEAD_OF_PLANNING ||
        userRole === Role.MANAGING_DIRECTOR) &&
      recentReportsAndBlockagesList
    ) {
      // Daily Reports
      recentReportsAndBlockagesList.recentDailyReportsInProjects.forEach(
        (project, projectIndex) => {
          project.dailyReports.forEach((report, reportIndex) => {
            if (report) {
              activities.push({
                id: `report-${project.projectName}-${projectIndex}-${reportIndex}`,
                type: "report_submitted",
                title: "Daily Report Submitted",
                description: `${report.description} - ${report.numberOfPhotos} photos submitted by ${project.assignedProjectManager.name}`,
                project: project.projectName,
                timestamp: new Date(report.dailyReportCreatedAt),
              });
            }
          });
        },
      );

      // Blockages
      recentReportsAndBlockagesList.recentBlockagesInProjects.forEach(
        (project, projectIndex) => {
          project.blockages.forEach((blockage, blockageIndex) => {
            if (blockage) {
              activities.push({
                id: `blockage-${project.projectName}-${projectIndex}-${blockageIndex}`,
                type: "blockage_reported",
                title: "Blockage Reported",
                description: `${blockage.description} - Status: ${blockage.status} (${blockage.numberOfPhotos} photos)`,
                project: project.projectName,
                timestamp: new Date(blockage.openDate),
              });
            }
          });
        },
      );

      return activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }

    return activities;

    // const allActivities: Activity[] = [
    //   {
    //     id: "1",
    //     type: "report_submitted",
    //     title: "Daily Report Submitted",
    //     description:
    //       "Prestige Tech Park Phase 2 - Daily progress report submitted by Rajesh Kumar",
    //     timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    //     project: "Prestige Tech Park Phase 2",
    //   },
    //   {
    //     id: "2",
    //     type: "photo_uploaded",
    //     title: "Photos Uploaded",
    //     description:
    //       "15 progress photos uploaded for Embassy TechVillage project",
    //     timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    //     project: "Embassy TechVillage",
    //   },
    //   {
    //     id: "3",
    //     type: "blockage_reported",
    //     title: "Blockage Reported",
    //     description:
    //       "Material shortage reported for Brigade Gateway Mall project",
    //     timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    //     project: "Brigade Gateway Mall",
    //   },
    //   {
    //     id: "4",
    //     type: "project_created",
    //     title: "New Project Created",
    //     description:
    //       "New project 'Godrej Aqua Residential' created by Head Of Planning",
    //     timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    //     project: "Godrej Aqua Residential",
    //   },
    // ];

    // Filter activities based on user customRole
    // if (userRole === Role.PROJECT_MANAGER) {
    //   const assignedProjectIds = getAssignedProjects();
    //   return allActivities.filter((activity) =>
    //     assignedProjectIds.some((projectId) =>
    //       activity.project.toLowerCase().includes(projectId.toString()),
    //     ),
    //   );
    // }

    // return allActivities;
  };

  const mockActivities = getMockActivities();

  // Mock notifications with customRole-based filtering
  const getMockNotifications = (): Notification[] => {
    const notifications: Notification[] = [];

    if (
      userRole === Role.PROJECT_MANAGER &&
      recentReportsAndBlockagesListOfProjectsOfManager
    ) {
      // Project deadline alerts
      recentReportsAndBlockagesListOfProjectsOfManager.projectDeadlineAlerts.forEach(
        (alert) => {
          // Safety checks to prevent undefined values
          if (
            !alert.estimatedEndDate ||
            !alert.projectDescription ||
            !alert.projectName
          ) {
            console.warn("Incomplete alert data:", alert);
            return;
          }

          const deadlineDate = new Date(alert.estimatedEndDate);
          // Check if date is valid
          if (isNaN(deadlineDate.getTime())) {
            console.warn("Invalid date in alert:", alert);
            return;
          }

          const daysUntilDeadline = Math.ceil(
            (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );
          // Calculate when this alert would have been relevant (simulate alert creation time)
          const alertCreatedTime = new Date(
            Date.now() -
              (Math.abs(daysUntilDeadline) <= 7
                ? Math.abs(daysUntilDeadline) * 24 * 60 * 60 * 1000
                : 2 * 24 * 60 * 60 * 1000),
          );

          notifications.push({
            id: `deadline-${alert.id}`,
            type: "alert",
            title: `Project Deadline ${daysUntilDeadline > 0 ? "Alert" : "Overdue"}`,
            message: `${alert.projectDescription} - Deadline ${daysUntilDeadline > 0 ? `in ${daysUntilDeadline} days` : `overdue by ${Math.abs(daysUntilDeadline)} days`} (${deadlineDate.toLocaleDateString()})`,
            priority: daysUntilDeadline <= 3 ? "high" : "medium",
            timestamp: alertCreatedTime,
            projectName: alert.projectName,
          });
        },
      );

      // Blockage notifications
      recentReportsAndBlockagesListOfProjectsOfManager.recentBlockagesInProjects.forEach(
        (project) => {
          project.blockages.forEach((blockage, index) => {
            if (blockage && blockage.status === "PENDING") {
              notifications.push({
                id: `blockage-${project.projectName}-${index}`,
                type: "alert",
                title: "Pending Blockage Reported",
                message: `${blockage.description} (Status: ${blockage.status}, ${blockage.numberOfPhotos} photos attached)`,
                priority: "high",
                timestamp: new Date(blockage.openDate),
                projectName: project.projectName,
              });
            }
          });
        },
      );
    } else if (
      (userRole === Role.HEAD_OF_PLANNING ||
        userRole === Role.MANAGING_DIRECTOR) &&
      recentReportsAndBlockagesList
    ) {
      // Project deadline alerts
      recentReportsAndBlockagesList.projectDeadlineAlerts.forEach((alert) => {
        // Safety checks to prevent undefined values
        if (
          !alert.estimatedEndDate ||
          !alert.projectDescription ||
          !alert.projectName
        ) {
          console.warn("Incomplete alert data:", alert);
          return;
        }

        const deadlineDate = new Date(alert.estimatedEndDate);
        // Check if date is valid
        if (isNaN(deadlineDate.getTime())) {
          console.warn("Invalid date in alert:", alert);
          return;
        }

        const daysUntilDeadline = Math.ceil(
          (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        // Calculate when this alert would have been relevant
        const alertCreatedTime = new Date(
          Date.now() -
            (Math.abs(daysUntilDeadline) <= 7
              ? Math.abs(daysUntilDeadline) * 24 * 60 * 60 * 1000
              : 2 * 24 * 60 * 60 * 1000),
        );

        notifications.push({
          id: `deadline-${alert.id}`,
          type: "alert",
          title: `Project Deadline ${daysUntilDeadline > 0 ? "Alert" : "Overdue"}`,
          message: `${alert.projectDescription} - Deadline ${daysUntilDeadline > 0 ? `in ${daysUntilDeadline} days` : `overdue by ${Math.abs(daysUntilDeadline)} days`} (${deadlineDate.toLocaleDateString()})`,
          priority: daysUntilDeadline <= 3 ? "high" : "medium",
          timestamp: alertCreatedTime,
          projectName: alert.projectName,
        });
      });

      // Blockage notifications
      recentReportsAndBlockagesList.recentBlockagesInProjects.forEach(
        (project) => {
          project.blockages.forEach((blockage, index) => {
            if (blockage && blockage.status === "PENDING") {
              notifications.push({
                id: `blockage-${project.projectName}-${index}`,
                type: "alert",
                title: "Pending Blockage Reported",
                message: `${blockage.description} (Status: ${blockage.status}, ${blockage.numberOfPhotos} photos attached)`,
                priority: "high",
                timestamp: new Date(blockage.openDate),
                projectName: project.projectName,
              });
            }
          });
        },
      );

      // Report approval notifications
      recentReportsAndBlockagesList.recentDailyReportsInProjects.forEach(
        (project) => {
          project.dailyReports.forEach((report, index) => {
            if (report && report.status === "PENDING") {
              notifications.push({
                id: `report-${project.projectName}-${index}`,
                type: "approval",
                title: "Report Approval Required",
                message: `Report from ${project.assignedProjectManager.name} needs approval - ${report.description}`,
                priority: "medium",
                timestamp: new Date(report.dailyReportCreatedAt),
                projectName: project.projectName,
              });
            }
          });
        },
      );
    }

    return notifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    // const allNotifications: Notification[] = [
    //   {
    //     id: 1,
    //     type: "approval_required",
    //     title: "Report Approval Required",
    //     message:
    //       "Daily report for Prestige Tech Park Phase 2 requires your approval",
    //     priority: PriorityLevel.HIGH_PRIORITY,
    //     // read: false,
    //     // actionRequired: true,
    //     // actionText: "Review Report",
    //     timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    //   },
    //   {
    //     id: 2,
    //     type: "alert",
    //     title: "Project Deadline Alert",
    //     message:
    //       "Embassy TechVillage project deadline is approaching in 16 days",
    //     priority: PriorityLevel.MEDIUM_PRIORITY,
    //     // read: false,
    //     // actionRequired: false,
    //     timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    //   },
    //   // {
    //   //   id: 3,
    //   //   type: "info",
    //   //   title: "System Maintenance",
    //   //   message: "Scheduled maintenance will occur tonight from 11 PM to 1 AM",
    //   //   priority: PriorityLevel.LOW_PRIORITY,
    //   //   // read: true,
    //   //   // actionRequired: false,
    //   //   timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    //   // },
    //   // {
    //   //   id: 4,
    //   //   type: "report",
    //   //   title: "Weekly Summary Ready",
    //   //   message: "Your weekly project summary report is now available",
    //   //   priority: PriorityLevel.LOW_PRIORITY,
    //   //   // read: true,
    //   //   // actionRequired: false,
    //   //   timestamp: new Date(Date.now() - 86400000), // 1 day ago
    //   // },
    // ];

    // // Filter notifications based on user customRole
    // if (userRole === Role.PROJECT_MANAGER) {
    //   return allNotifications.filter(
    //     (notification) =>
    //       notification.type !== "approval_required" &&
    //       notification.type !== "report",
    //   );
    // }

    // return allNotifications;
  };

  const mockNotifications = getMockNotifications();

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />

      <main className="pt-24 pb-20 md:ml-60 md:pt-20 md:pb-8">
        <div className="p-6">
          <Breadcrumb />

          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-text-primary mb-2 text-3xl font-bold tracking-tight">
                  Welcome back, {userName}!
                </h1>
                <p className="text-text-secondary">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                  {userRole && (
                    <span className="bg-primary/5 text-primary ml-3 rounded-md px-3 py-1 text-sm font-medium">
                      {userRole === Role.MANAGING_DIRECTOR
                        ? "Managing Director"
                        : userRole === Role.HEAD_OF_PLANNING
                          ? "Head Of Planning"
                          : "Project Manager"}
                    </span>
                  )}
                </p>
              </div>
              <div className="mt-4 flex items-center space-x-3 md:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="RefreshCw"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() =>
                    router.push(
                      userRole === Role.PROJECT_MANAGER
                        ? "/daily-progress-report"
                        : "/project-creation",
                    )
                  }
                >
                  {userRole === Role.PROJECT_MANAGER
                    ? "Submit Report"
                    : "Create Project"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Sidebar - Project Navigation */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <ProjectNavigationTree
                  projects={mockProjects.map(
                    // ({ assignedPM, revenue, cost, ...rest }) => rest,
                    ({ assignedPM, ...rest }) => rest,
                  )}
                />
                {(userRole === Role.HEAD_OF_PLANNING ||
                  userRole === Role.MANAGING_DIRECTOR) && (
                  <TeamPerformanceWidget teamMembers={mockTeamMembers ?? []} />
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <div className="space-y-6">
                {/* KPI Cards */}
                {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {getMockKPIs()?.map((kpi, index) => (
                    <KPICard key={index} kpi={kpi} />
                  ))}
                </div> */}

                {/* Quick Actions */}
                <div>
                  <h2 className="text-text-primary mb-4 text-xl font-semibold tracking-tight">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {getQuickActions().map((action, index) => (
                      <QuickActionCard key={index} action={action} />
                    ))}
                  </div>
                </div>

                {/* Project Status Cards */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-text-primary text-xl font-semibold tracking-tight">
                      {userRole === Role.PROJECT_MANAGER
                        ? "My Projects"
                        : "Active Projects"}
                    </h2>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      iconName="ArrowRight"
                      iconPosition="right"
                      iconSize={16}
                      onClick={
                        () => ({})
                        // router.push("/project-management-dashboard")
                      }
                    >
                      View All
                    </Button> */}
                  </div>
                  <div className="grid min-h-[300px] grid-cols-1 gap-4 lg:grid-cols-2">
                    {mockProjects.length > 0 ? (
                      mockProjects.map((project) => (
                        <ProjectStatusCard
                          key={project.id}
                          project={{
                            ...project,
                            status: project.status,
                          }}
                          onClick={() => {
                            if (userRole === Role.PROJECT_MANAGER) {
                              router.push("/project-manager-daily-workflow");
                            } else {
                              const foundProject = projects?.data.find(
                                (p) =>
                                  p.latestProjectVersion?.projectId ===
                                  project.id,
                              );
                              if (foundProject) {
                                setProject(foundProject);
                                router.push(`/project-creation?edit=${true}`);
                              } else {
                                toast.error("Project not found");
                              }
                            }
                          }}
                        />
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-text-secondary">
                          No recent projects
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
