"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Role } from "@prisma/client";
import type { Session } from "@/server/auth";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import ProjectSelector from "./components/ProjectSelector";
// import ProjectTimeline from "./components/ProjectTimeline";
// import TeamAssignments from "./components/TeamAssignments";
// import QuickFilters from "./components/QuickFilters";
import MasterDataTable from "./components/MasterDataTable";
import DetailedBreakdownTable from "./components/DetailedBreakdownTable";
import ProgressVisualization from "./components/ProgressVisualization";
// import ActionToolbar from "./components/ActionToolbar";

import Button from "@/components/rocket/components/ui/Button";
import { api } from "@/trpc/react";
// import QuickFilters from "./components/QuickFilters";

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  status: string;
  overallProgress: number;
  dueDate: string;
  assignedPM: string;
  revenue: string;
  // cost: string;
  priority: string;
}

// interface TimelineItem {
//   id: number;
//   // phase: string;
//   description: string;
//   date: string;
//   status: "completed" | "in-progress" | "pending";
//   progress: number;
// }

// interface FilterState {
//   status: string;
//   priority?: string;
//   dateRange: string;
// }

// interface TeamMember {
//   id: string;
//   name: string;
//   // avatar: string;
//   // status: "Active" | "Break" | "Offline";
//   customRole: "Project Manager" | "Site Engineer" | "Supervisor" | "Worker";
//   // lastSeen: string;
//   // currentTask?: string;
// }

interface MasterDataRow {
  id: string | number;
  itemDescription: string;
  quantity: number;
  supplied: number;
  installed: number;
  yetToSupply: number;
  yetToInstall: number;
  supplyProgress: number;
  installProgress: number;
  // hasPhotos?: boolean;
  // isBlocked?: boolean;
}

interface TaskItem {
  id: string | number;
  name: string;
  connectWithSheet1Item: boolean;
  yesterdaySupplied: number;
  yesterdayInstalled: number;
  unit: string;
  totalQuantity: number;
  totalSupplied: number;
  totalInstalled: number;
  percentSupplied: number;
  percentInstalled: number;
  // id: string | number;
  // taskName: string;
  // description: string;
  // status: "completed" | "in-progress" | "pending" | "blocked";
  // priority: "high" | "medium" | "low";
  // progress: number;
  // assignedTo: {
  //   id: string;
  //   name: string;
  //   avatar: string;
  // };
  // photos: Array<{ thumbnail: string }>;
  // hasBlockage?: boolean;
  // unit: string;
  // totalQuantity: number;
  // totalSupplied: number;
  // totalInstalled: number;
  // percentSupplied: number;
  // percentInstalled: number;
  // yesterdayProgress: number;
  // subTasks: Array<{
  //   id: string | number;
  //   name: string;
  //   connectWithSheet1Item: boolean;
  //   yesterdaySupplied: number;
  //   yesterdayInstalled: number;
  //   unit: string;
  //   totalQuantity: number;
  //   totalSupplied: number;
  //   totalInstalled: number;
  //   percentSupplied: number;
  //   percentInstalled: number;
  // status: "completed" | "in-progress" | "pending" | "blocked";
  // priority: "high" | "medium" | "low";
  // progress: number;
  // assignedTo: {
  //   id: string;
  //   name: string;
  //   avatar: string;
  // };
  // photos?: Array<{ thumbnail: string }>;
  // notes?: string;
  // }>;
}

const ProjectManagementDashboard: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending: loading } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };
  const user = session?.user;

  const [activeTab, setActiveTab] = useState<string>("master-data");
  const [selectedProject, setSelectedProject] = useState<string>("");
  // const [activeFilters, setActiveFilters] = useState<FilterState>({
  //   status: "all",
  //   priority: undefined,
  //   dateRange: "month",
  // });
  // const [selectedItems, setSelectedItems] = useState<Array<string | number>>(
  //   [],
  // );

  const { data: projects } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  // Mock data for projects with customRole-based filtering
  // const getAllProjects = (): Project[] => [
  //   {
  //     id: "proj-001",
  //     name: "Prestige Tech Park Phase 2",
  //     client: "Prestige Group",
  //     location: "Bangalore, Karnataka",
  //     status: "Active",
  //     overallProgress: 67,
  //     dueDate: "30 Mar 2025",
  //     assignedPM: "pm-001",
  //     revenue: "₹45,00,000",
  //     // cost: "₹32,00,000",
  //     priority: "High",
  //   },
  //   {
  //     id: "proj-002",
  //     name: "DLF Cyber Hub Extension",
  //     client: "DLF Limited",
  //     location: "Gurgaon, Haryana",
  //     status: "On Hold",
  //     overallProgress: 45,
  //     dueDate: "15 Apr 2025",
  //     assignedPM: "pm-001",
  //     revenue: "₹38,00,000",
  //     // cost: "₹28,00,000",
  //     priority: "Medium",
  //   },
  //   {
  //     id: "proj-003",
  //     name: "Brigade Gateway Mall",
  //     client: "Brigade Enterprises",
  //     location: "Chennai, Tamil Nadu",
  //     status: "Active",
  //     overallProgress: 82,
  //     dueDate: "20 Feb 2025",
  //     assignedPM: "pm-002",
  //     revenue: "₹65,00,000",
  //     // cost: "₹48,00,000",
  //     priority: "High",
  //   },
  //   {
  //     id: "proj-004",
  //     name: "Godrej Aqua Residential",
  //     client: "Godrej Properties",
  //     location: "Mumbai, Maharashtra",
  //     status: "Delayed",
  //     overallProgress: 35,
  //     dueDate: "05 Aug 2025",
  //     assignedPM: "pm-002",
  //     revenue: "₹22,00,000",
  //     //  cost: "₹18,00,000",
  //     priority: "High",
  //   },
  // ];

  const getAllProjects = (): Project[] => {
    return (projects?.data ?? []).map((project, index) => ({
      id: project.latestProjectVersion.projectId?.toString() ?? "",
      name: project.latestProjectVersion.projectName,
      client: project.latestProjectVersion.client.clientName,
      location: project.latestProjectVersion.siteLocation.city,
      status: project.latestProjectVersion.projectStatus,
      overallProgress: +Math.min(
        project.latestProjectVersion.sheet1?.reduce(
          (acc, curr) => acc + curr.percentSupplied,
          0,
        ) ?? 0 / (project.latestProjectVersion.sheet1?.length ?? 1),
        100,
      ).toFixed(2),
      dueDate:
        project.latestProjectVersion.estimatedEndDate.toLocaleDateString(
          "en-GB",
        ),
      assignedPM: project.assignedProjectManager?.name ?? "",
      revenue: project.latestProjectVersion.estimatedBudget.toString(),
      priority: project.latestProjectVersion.priorityLevel,
    }));
  };

  // const timeline: TimelineItem[] = [
  //   {
  //     id: 1,
  //     // phase: "Project Initiation",
  //     description: "Site survey and initial planning completed",
  //     date: "15 Jan 2025",
  //     status: "completed",
  //     progress: 100,
  //   },
  //   {
  //     id: 2,
  //     // phase: "Foundation Work",
  //     description: "Structural foundation and base installation",
  //     date: "25 Jan 2025",
  //     status: "completed",
  //     progress: 100,
  //   },
  //   {
  //     id: 3,
  //     // phase: "Glass Installation",
  //     description: "Main glazing work in progress",
  //     date: "10 Feb 2025",
  //     status: "in-progress",
  //     progress: 65,
  //   },
  //   {
  //     id: 4,
  //     // phase: "Finishing Work",
  //     description: "Final touches and quality checks",
  //     date: "15 Mar 2025",
  //     status: "pending",
  //     progress: 0,
  //   },
  //   {
  //     id: 5,
  //     //  phase: "Project Handover",
  //     description: "Final inspection and client handover",
  //     date: "30 Mar 2025",
  //     status: "pending",
  //     progress: 0,
  //   },
  // ];

  // Mock team members data
  // const getTeamMembers = (): TeamMember[] => [
  //   {
  //     id: "tm-001",
  //     name: "John Smith",
  //     // avatar: "/avatars/john.jpg",
  //     // status: "Active",
  //     customRole: "Project Manager",
  //     // lastSeen: "2 min ago",
  //     // currentTask: "Reviewing progress reports",
  //   },
  //   {
  //     id: "tm-002",
  //     name: "Sarah Wilson",
  //     // avatar: "/avatars/sarah.jpg",
  //     // status: "Active",
  //     customRole: "Site Engineer",
  //     // lastSeen: "15 min ago",
  //     // currentTask: "Foundation inspection",
  //   },
  //   {
  //     id: "tm-003",
  //     name: "Mike Johnson",
  //     // avatar: "/avatars/mike.jpg",
  //     // status: "Break",
  //     customRole: "Supervisor",
  //     // lastSeen: "1 hour ago",
  //   },
  // ];

  // Mock Sheet 1 data (Master Data) - converted to match MasterDataRow interface
  // const getSheet1Data = (): MasterDataRow[] => [
  //   {
  //     id: 1,
  //     itemDescription: "UCW",
  //     quantity: 2500,
  //     supplied: 2100,
  //     installed: 1875,
  //     yetToSupply: 400,
  //     yetToInstall: 625,
  //     supplyProgress: 84,
  //     installProgress: 75,
  //     hasPhotos: true,
  //   },
  //   {
  //     id: 2,
  //     itemDescription: "Strip Glazing",
  //     quantity: 800,
  //     supplied: 720,
  //     installed: 640,
  //     yetToSupply: 80,
  //     yetToInstall: 160,
  //     supplyProgress: 90,
  //     installProgress: 80,
  //     hasPhotos: true,
  //   },
  //   {
  //     id: 3,
  //     itemDescription: "Railing Installation",
  //     quantity: 120,
  //     supplied: 100,
  //     installed: 85,
  //     yetToSupply: 20,
  //     yetToInstall: 35,
  //     supplyProgress: 83,
  //     installProgress: 71,
  //   },
  //   {
  //     id: 4,
  //     itemDescription: "Glass Panels",
  //     quantity: 500,
  //     supplied: 450,
  //     installed: 400,
  //     yetToSupply: 50,
  //     yetToInstall: 100,
  //     supplyProgress: 90,
  //     installProgress: 80,
  //     hasPhotos: true,
  //   },
  // ];

  const [selectedRowId, setSelectedRowId] = useState<string | number>("");

  const [sheet1Data, setSheet1Data] = useState<MasterDataRow[]>([]);

  useEffect(() => {
    if (selectedProject) {
      const project = projects?.data?.find(
        (project) =>
          project.latestProjectVersion.projectId === +selectedProject,
      );

      if (project) {
        setSheet1Data(
          project.latestProjectVersion.sheet1?.map((item, index) => ({
            id: index,
            itemDescription: item.itemName + " " + item.unit,
            quantity: item.totalQuantity,
            supplied: item.totalSupplied,
            installed: item.totalInstalled,
            yetToSupply: item.yetToSupply,
            yetToInstall: item.yetToInstall,
            supplyProgress: item.percentSupplied,
            installProgress: item.percentInstalled,
          })) ?? [],
        );
      }
    }
  }, [selectedProject, projects]);

  const [sheet2Data, setSheet2Data] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (selectedProject) {
      const project = projects?.data?.find(
        (project) =>
          project.latestProjectVersion.projectId === +selectedProject,
      );
      if (project) {
        const sheet1 = project.latestProjectVersion?.sheet1?.find(
          (item, index) => index === +selectedRowId,
        );
        setSheet2Data(
          sheet1?.sheet2?.map((item, index) => ({
            id: index,
            name: item.subItemName,
            // description: item.subItemName,
            // status: "in-progress",
            // priority: "high",
            // progress: item.percentSupplied,
            // assignedTo: {
            //   id: project.assignedProjectManager?.id ?? "",
            //   name: project.assignedProjectManager?.name ?? "",
            // },
            // photos: [],
            unit: item.unit,
            totalQuantity: item.totalQuantity,
            totalSupplied: item.totalSupplied,
            totalInstalled: item.totalInstalled,
            percentSupplied: item.percentSupplied,
            percentInstalled: item.percentInstalled,
            connectWithSheet1Item: item.connectWithSheet1Item,
            yesterdaySupplied:
              item.yesterdayProgressReport?.yesterdaySupplied ?? 0,
            yesterdayInstalled:
              item.yesterdayProgressReport?.yesterdayInstalled ?? 0,
            // yesterdayProgress:
            //   ((item.yesterdayProgressReport?.yesterdayInstalled ?? 0) /
            //     (item.totalQuantity ?? 1)) *
            //   100,
            // hasBlockage: item.hasBlockage,
            // subTasks: item.subTasks?.map((subTask, index) => ({
            //   id: subTask.taskName + index.toString(),
            //   name: subTask.taskName,
            //   status: subTask.status,
            //   priority: subTask.priority,
            //   progress: subTask.progress,
            //   assignedTo: {
            //       id: subTask.assignedTo.id,
            //     name: subTask.assignedTo.name,
            //   },
            //     })) ?? [],
            //   })) ?? [],
            // );
          })) ?? [],
        );
      }
    }
  }, [selectedProject, projects, selectedRowId]);

  // Mock Sheet 2 data (Detailed Breakdown) - converted to match TaskItem interface
  // const getSheet2Data = (): TaskItem[] => [
  //   {
  //     id: 1,
  //     taskName: "UCW North Face Installation",
  //     description: "North Face Installation - 625 sqm",
  //     status: "in-progress",
  //     priority: "high",
  //     progress: 75,
  //     assignedTo: {
  //       id: "emp-001",
  //       name: "John Smith",
  //       // avatar: "/avatars/john.jpg",
  //     },
  //     photos: [
  //       { thumbnail: "/photos/progress1.jpg" },
  //       { thumbnail: "/photos/progress2.jpg" },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     taskName: "UCW South Face Installation",
  //     description: "South Face Installation - 625 sqm",
  //     status: "in-progress",
  //     priority: "high",
  //     progress: 74,
  //     assignedTo: {
  //       id: "emp-002",
  //       name: "Sarah Wilson",
  //       // avatar: "/avatars/sarah.jpg",
  //     },
  //     photos: [{ thumbnail: "/photos/progress3.jpg" }],
  //   },
  //   {
  //     id: 3,
  //     taskName: "UCW East Face Installation",
  //     description: "East Face Installation - 625 sqm",
  //     status: "in-progress",
  //     priority: "high",
  //     progress: 76,
  //     assignedTo: {
  //       id: "emp-003",
  //       name: "Mike Johnson",
  //       // avatar: "/avatars/mike.jpg",
  //     },
  //     photos: [{ thumbnail: "/photos/progress4.jpg" }],
  //   },
  //   {
  //     id: 4,
  //     taskName: "UCW West Face Installation",
  //     description: "West Face Installation - 625 sqm",
  //     status: "pending",
  //     priority: "medium",
  //     progress: 0,
  //     assignedTo: {
  //       id: "emp-004",
  //       name: "Lisa Brown",
  //       // avatar: "/avatars/lisa.jpg",
  //     },
  //     photos: [],
  //   },
  //   {
  //     id: 5,
  //     taskName: "Strip Glazing Main Entrance",
  //     description: "Main Entrance - 200 linear m",
  //     status: "completed",
  //     priority: "high",
  //     progress: 100,
  //     assignedTo: {
  //       id: "emp-005",
  //       name: "David Lee",
  //       // avatar: "/avatars/david.jpg",
  //     },
  //     photos: [{ thumbnail: "/photos/progress5.jpg" }],
  //   },
  // ];

  // TODO: Mock function to get assigned projects for PM
  // const getAssignedProjects = (): string[] => {
  //   if (user?.customRole === Role.PROJECT_MANAGER) {
  //     return ["proj-001", "proj-002"]; // Mock assigned projects
  //   }
  //   return [];
  // };

  // Mock permission check
  // const hasPermission = (permission: string): boolean => {
  //   if (
  //     user?.customRole === Role.MANAGING_DIRECTOR ||
  //     user?.customRole === Role.HEAD_OF_PLANNING
  //   ) {
  //     return true;
  //   }
  //   if (user?.customRole === Role.PROJECT_MANAGER) {
  //     switch (permission) {
  //       case "canEditSheet1":
  //       case "canUploadPhotos":
  //         return true;
  //       case "canViewFinancialData":
  //         return false;
  //       default:
  //         return false;
  //     }
  //   }
  //   return false;
  // };

  // Filter projects based on user customRole
  // const getFilteredProjects = (): Project[] => {
  //   const allProjects = getAllProjects();

  //   if (
  //     user?.customRole === Role.MANAGING_DIRECTOR ||
  //     user?.customRole === Role.HEAD_OF_PLANNING
  //   ) {
  //     return allProjects;
  //   } else if (user?.customRole === Role.PROJECT_MANAGER) {
  //     const assignedProjectIds = getAssignedProjects();
  //     return allProjects.filter((project) =>
  //       assignedProjectIds.includes(project.id),
  //     );
  //   }

  //   return [];
  // };

  const filteredProjects = getAllProjects(); // getFilteredProjects();

  // Set default selected project for PM users
  useEffect(() => {
    if (
      user?.customRole === Role.PROJECT_MANAGER &&
      filteredProjects.length > 0 &&
      !selectedProject
    ) {
      setSelectedProject(filteredProjects[0]?.id ?? "");
    } else if (
      user?.customRole !== Role.PROJECT_MANAGER &&
      filteredProjects.length > 0 &&
      !selectedProject
    ) {
      setSelectedProject(filteredProjects[0]?.id ?? "");
    }
  }, [filteredProjects, selectedProject, user?.customRole]);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // If still loading or no user, show loading
  if (loading || !user) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  const handleProjectChange = (projectId: string): void => {
    setSelectedProject(projectId);
  };

  const handleTabChange = (tab: string): void => {
    setActiveTab(tab);
  };

  // const handleFilterChange = (
  //   filterType: "status" | "priority" | "dateRange" | "clear",
  //   value?: string,
  // ): void => {
  //   if (filterType === "clear") {
  //     setActiveFilters({
  //       status: "all",
  //       priority: undefined,
  //       dateRange: "month",
  //     });
  //   } else if (value !== undefined) {
  //     setActiveFilters((prev) => ({
  //       ...prev,
  //       [filterType]: value,
  //     }));
  //   }
  // };

  // const handleDataUpdate = (
  //   rowId: string | number,
  //   field: keyof MasterDataRow,
  //   value: number,
  // ): void => {
  //   // Only allow updates for HOP/MD or if PM has permission for this project
  //   if (
  //     user?.customRole === Role.PROJECT_MANAGER &&
  //     !hasPermission("canEditSheet1")
  //   ) {
  //     alert("You do not have permission to edit this data.");
  //     return;
  //   }

  //   // In real app, this would update the backend
  //   // console.log("Updating data:", { rowId, field, value });
  // };

  // const handlePhotoUpload = (itemId: string | number): void => {
  //   // Only allow photo uploads for PM users or if user has permission
  //   if (
  //     user?.customRole === Role.PROJECT_MANAGER &&
  //     !hasPermission("canUploadPhotos")
  //   ) {
  //     alert("You do not have permission to upload photos.");
  //     return;
  //   }

  //   router.push("/photo-gallery-management");
  // };

  // const handleGenerateReport = (): void => {
  //   // Only allow report generation for HOP/MD
  //   if (user?.customRole === Role.PROJECT_MANAGER) {
  //     alert("You do not have permission to generate reports.");
  //     return;
  //   }

  //   router.push("/pm-final-report-preview");
  // };

  // const handleUploadPhotos = (): void => {
  //   router.push("/photo-gallery-management");
  // };

  // const handleMarkBlockages = (): void => {
  //   router.push("/blockage-management");
  // };

  // const handleExportData = async (format: string): Promise<void> => {
  //   // Only allow data export for HOP/MD
  //   if (user?.customRole === Role.PROJECT_MANAGER) {
  //     alert("You do not have permission to export data.");
  //     return;
  //   }

  //   // console.log(`Exporting data in ${format} format`);
  //   // In real app, this would trigger the export
  // };

  // const canEditData =
  //   user?.customRole === Role.MANAGING_DIRECTOR ||
  //   user?.customRole === Role.HEAD_OF_PLANNING;

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />

      <main className="pt-24 pb-20 md:ml-60 md:pt-20 md:pb-8">
        <div className="p-6">
          <Breadcrumb />

          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-text-primary mb-2 text-3xl font-bold tracking-tight">
                  Project Management Dashboard
                </h1>
                <p className="text-text-secondary">
                  {user?.customRole === Role.PROJECT_MANAGER
                    ? "View and manage your assigned projects"
                    : "Manage all projects and team assignments"}
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
                {/* {user?.customRole === Role.PROJECT_MANAGER && (
                  <Button
                    variant="default"
                    size="sm"
                    iconName="FileText"
                    iconPosition="left"
                    iconSize={16}
                    onClick={() => router.push("/daily-progress-report")}
                  >
                    Submit Report
                  </Button>
                )} */}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {/* Left Sidebar */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Project Selector */}
                <ProjectSelector
                  projects={filteredProjects}
                  selectedProject={selectedProject}
                  onProjectChange={handleProjectChange}
                />

                {/* Project Timeline */}
                {/* <ProjectTimeline timeline={timeline} /> */}

                {/* Team Assignments - Only for HOP/MD */}
                {/* {(user?.customRole === Role.HEAD_OF_PLANNING ||
                  user?.customRole === Role.MANAGING_DIRECTOR) && (
                  <TeamAssignments teamMembers={getTeamMembers()} />
                )} */}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <div className="space-y-6">
                {/* Quick Filters */}
                {/* <QuickFilters
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                /> */}

                {/* Action Toolbar */}
                {/* <ActionToolbar
                  selectedItems={selectedItems}
                  onGenerateReport={handleGenerateReport}
                  onUploadPhotos={handleUploadPhotos}
                  onMarkBlockages={handleMarkBlockages}
                  onExportData={handleExportData}
                /> */}

                {/* Tab Navigation */}
                <div className="bg-card border-border rounded-lg border">
                  <div className="border-border border-b">
                    <nav className="flex space-x-8 px-6">
                      <button
                        onClick={() => handleTabChange("master-data")}
                        className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          activeTab === "master-data"
                            ? "border-primary text-primary"
                            : "text-text-secondary hover:text-text-primary border-transparent"
                        }`}
                      >
                        Sheet 1 - Master Data
                      </button>
                      <button
                        onClick={() => handleTabChange("detailed-breakdown")}
                        className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          activeTab === "detailed-breakdown"
                            ? "border-primary text-primary"
                            : "text-text-secondary hover:text-text-primary border-transparent"
                        }`}
                      >
                        Sheet 2 - Detailed Breakdown
                      </button>
                      <button
                        onClick={() => handleTabChange("progress")}
                        className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          activeTab === "progress"
                            ? "border-primary text-primary"
                            : "text-text-secondary hover:text-text-primary border-transparent"
                        }`}
                      >
                        Progress Visualization
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === "master-data" && (
                      <MasterDataTable
                        data={sheet1Data}
                        selectedRowId={selectedRowId}
                        setSelectedRowId={setSelectedRowId}
                        // onDataUpdate={handleDataUpdate}
                        // onPhotoUpload={handlePhotoUpload}
                      />
                    )}

                    {activeTab === "detailed-breakdown" && (
                      <DetailedBreakdownTable
                        data={sheet2Data}
                        // onPhotoUpload={handlePhotoUpload}
                      />
                    )}

                    {activeTab === "progress" && (
                      <ProgressVisualization 
                        data={sheet1Data} 
                        projectId={selectedProject ? parseInt(selectedProject) : undefined}
                      />
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

export default ProjectManagementDashboard;
