/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Icon from "@/components/rocket/components/AppIcon";
import BlockageFilters from "./components/BlockageFilters";
import BlockageCard from "./components/BlockageCard";
import { api } from "@/trpc/react";
import type { Session } from "@/server/auth";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
// import BlockageDetailModal from "./components/BlockageDetailModal";
// import AddBlockageModal from "./components/AddBlockageModal";
// import BlockageStats from "./components/BlockageStats";

// Type definitions - matching what the components expect
interface BlockagePhoto {
  url: string;
  description: string;
  timestamp: Date;
}

interface BlockageTimelineEvent {
  action: string;
  description: string;
  timestamp: Date;
}

// Main blockage interface for this component
interface Blockage {
  id: string;
  title: string;
  description: string;
  project: string;
  // location: string; //
  category: "client" | "internal" | "supplier" | "weather";
  severity: "critical" | "high" | "medium" | "low";
  // status: "open" | "in-progress" | "pending-approval" | "resolved" | "closed"; //
  assignedTo: string;
  createdAt: Date;
  // clientVisible: boolean; //
  priority: boolean;
  // commentsCount: number; //
  photos: BlockagePhoto[];
  // timeline: BlockageTimelineEvent[]; //
}

// For components that expect different formats
interface BlockageCardData {
  id: string | number;
  title: string;
  description: string;
  project: string;
  // location: string; //
  severity: "critical" | "high" | "medium" | "low";
  category: "client" | "internal" | "supplier" | "weather";
  // status: "open" | "in-progress" | "pending-approval" | "resolved" | "closed"; //
  createdAt: string;
  // clientVisible: boolean; //
  assignedTo: string;
  priority: boolean;
  // commentsCount?: number; //
  photos?: BlockagePhoto[];
}

// interface BlockageModalData {
//   id?: string;
//   title: string;
//   description: string;
//   // status: string; //
//   severity: "critical" | "high" | "medium" | "low";
//   category: string;
//   project: string;
//   // location: string; //
//   assignedTo: string;
//   expectedResolution?: string;
//   // clientVisible: boolean; //
//   createdAt: Date;
//   photos?: BlockagePhoto[];
//   // timeline?: BlockageTimelineEvent[]; //
// }

interface FilterState {
  project: string;
  category: string;
  status: string;
  severity: string;
  dateRange: string;
  clientVisible: boolean;
  internalOnly: boolean;
  overdue: boolean;
}

type ViewMode = "grid" | "list";

// interface UpdateBlockageData {
//   id?: string;
//   title: string;
//   description: string;
//   status: string;
//   severity: "critical" | "high" | "medium" | "low";
//   category: string;
//   project: string;
//   location: string;
//   assignedTo: string;
//   expectedResolution?: string;
//   clientVisible?: boolean;
//   createdAt: Date;
//   photos?: Array<{
//     url: string;
//     description?: string;
//     timestamp: Date;
//   }>;
//   timeline?: BlockageTimelineEvent[];
// }

const BlockageManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: session, isPending } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };
  const router = useRouter();

  const { data: projects, isLoading: isProjectsLoading } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  // const [selectedBlockage, setSelectedBlockage] = useState<Blockage | null>(
  //   null,
  // );
  // const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  // const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    project: "all",
    category: "all",
    status: "all",
    severity: "all",
    dateRange: "all",
    clientVisible: false,
    internalOnly: false,
    overdue: false,
  });

  //
  // Mock blockages data
  const [blockages, setBlockages] = useState<Blockage[]>();

  useEffect(() => {
    const bs =
      projects?.data?.flatMap((project) =>
        project.latestProjectVersion?.sheet1?.flatMap((item) =>
          item.blockages?.map((blockage) => {
            return {
              id: project.latestProjectVersion?.projectId?.toString() ?? "",
              title: project.latestProjectVersion?.projectName ?? "",
              description: blockage.description ?? "",
              project:
                project.latestProjectVersion?.projectName.toLowerCase() ?? "",
              category: blockage.category as Blockage["category"],
              severity: blockage.severity as Blockage["severity"],
              assignedTo: project.assignedProjectManager?.name ?? "",
              createdAt: blockage.blockageStartTime
                ? new Date(blockage.blockageStartTime)
                : new Date(),
              priority:
                project.latestProjectVersion?.priorityLevel === "HIGH_PRIORITY"
                  ? true
                  : false,
              photos: blockage.blockagePhotos.map((photo) => ({
                url: photo.url ?? "",
                description: blockage.description ?? "",
                timestamp: blockage.blockageStartTime
                  ? new Date(blockage.blockageStartTime)
                  : new Date(),
              })),
            };
          }),
        ),
      ) ?? [];
    setBlockages(bs.filter((b) => b !== undefined));
  }, [isProjectsLoading]);

  //   [
  //   {
  //     id: "1",
  //     title: "Glass Panel Installation Delayed",
  //     description:
  //       "Client has not provided final approval for the custom glass specifications. Installation team is on standby waiting for confirmation.",
  //     project: "Prestige Tech Park - Phase 2",
  //     // location: "Building A - 15th Floor", //
  //     category: "client",
  //     severity: "high",
  //     // status: "open", //
  //     assignedTo: "Rajesh Kumar",
  //     createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  //     expectedResolution: "2025-07-28",
  //     // clientVisible: true, //
  //     priority: true,
  //     // commentsCount: 3, //
  //     photos: [
  //       {
  //         url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
  //         description: "Current installation area",
  //         timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //       },
  //       {
  //         url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
  //         description: "Glass panels ready for installation",
  //         timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //       },
  //     ],
  //     // timeline: [
  //     //   {
  //     //     action: "Blockage Reported",
  //     //     description: "Installation team reported client approval pending",
  //     //     timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  //     //   },
  //     //   {
  //     //     action: "Follow-up Sent",
  //     //     description: "Email sent to client for specification approval",
  //     //     timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //     //   },
  //     // ], //
  //   },
  //   {
  //     id: "2",
  //     title: "Structural Support Issue",
  //     description:
  //       "Discovered structural integrity concern during installation. Engineering review required before proceeding with glass mounting.",
  //     project: "Brigade Gateway Mall",
  //     // location: "Atrium - Level 3", //
  //     category: "internal",
  //     severity: "critical",
  //     // status: "in-progress", //
  //     assignedTo: "Suresh Reddy",
  //     createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  //     expectedResolution: "2025-07-30",
  //     // clientVisible: false,
  //     priority: true,
  //     // commentsCount: 7,
  //     photos: [
  //       {
  //         url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
  //         description: "Structural concern area",
  //         timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  //       },
  //     ],
  //     // timeline: [
  //     //   {
  //     //     action: "Issue Identified",
  //     //     description: "Structural engineer identified potential concern",
  //     //     timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  //     //   },
  //     //   {
  //     //     action: "Engineering Review Started",
  //     //     description: "Detailed structural analysis initiated",
  //     //     timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  //     //   },
  //     // ],
  //   },
  //   {
  //     id: "3",
  //     title: "Material Supply Shortage",
  //     description:
  //       "Supplier has informed about shortage of specific glass type. Alternative solutions being evaluated.",
  //     project: "Embassy Manyata",
  //     // location: "Tower B - Facade", //
  //     category: "supplier",
  //     severity: "medium",
  //     // status: "pending-approval", //
  //     assignedTo: "Priya Sharma",
  //     createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  //     expectedResolution: "2025-08-05",
  //     // clientVisible: true, //
  //     priority: false,
  //     // commentsCount: 2,
  //     photos: [],
  //     // timeline: [
  //     //   {
  //     //     action: "Supply Issue Reported",
  //     //     description: "Supplier notified about material shortage",
  //     //     timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  //     //   },
  //     //   {
  //     // //   action: "Alternative Sourcing",
  //     //   description: "Exploring alternative suppliers and materials",
  //     //   timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  //     //   },
  //     // ],
  //   },
  //   {
  //     id: "4",
  //     title: "Weather Delay - Monsoon",
  //     description:
  //       "Heavy rainfall preventing outdoor glass installation work. Safety protocols require dry conditions.",
  //     project: "RMZ Ecospace",
  //     // location: "External Facade - East Wing", //
  //     category: "weather",
  //     severity: "low",
  //     // status: "open", //
  //     assignedTo: "Amit Patel",
  //     createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  //     expectedResolution: "2025-07-27",
  //     // clientVisible: true,
  //     priority: false,
  //     //  commentsCount: 1,
  //     photos: [
  //       {
  //         url: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400",
  //         description: "Weather conditions at site",
  //         timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  //       },
  //     ],
  //     // timeline: [
  //     //   {
  //     //     action: "Weather Delay Reported",
  //     //     description: "Work suspended due to heavy rainfall",
  //     //     timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  //     //   },
  //     // ],
  //   },
  //   {
  //     id: "5",
  //     title: "Quality Control Rejection",
  //     description:
  //       "Installed glass panels failed quality inspection. Replacement required as per quality standards.",
  //     project: "Prestige Tech Park - Phase 2",
  //     // location: "Building B - 8th Floor", //
  //     category: "internal",
  //     severity: "high",
  //     // status: "resolved", //
  //     assignedTo: "Rajesh Kumar",
  //     createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  //     expectedResolution: "2025-07-20",
  //     // clientVisible: false,
  //     priority: true,
  //     // commentsCount: 5,
  //     photos: [
  //       {
  //         url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
  //         description: "Quality issue documentation",
  //         timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  //       },
  //       {
  //         url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400",
  //         description: "Replacement panels installed",
  //         timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //       },
  //     ],
  //     // timeline: [
  //     //   {
  //     //     action: "Quality Issue Identified",
  //     //     description: "QC inspection failed, replacement required",
  //     //     timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  //     //   },
  //     //   {
  //     //     action: "Replacement Ordered",
  //     //     description: "New glass panels ordered from supplier",
  //     //     timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  //     //   },
  //     //   {
  //     //     action: "Issue Resolved",
  //     //     description: "New panels installed and passed QC",
  //     //     timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //     //   },
  //     // ],
  //   },
  // ]
  // );

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean,
  ): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = (): void => {
    setFilters({
      project: "all",
      category: "all",
      status: "all",
      severity: "all",
      dateRange: "all",
      clientVisible: false,
      internalOnly: false,
      overdue: false,
    });
    setSearchQuery("");
  };

  // const handleViewDetails = (blockage: Blockage): void => {
  //   setSelectedBlockage(blockage);
  //   setIsDetailModalOpen(true);
  // };

  const handleStatusChange = (
    blockageId: string | number,
    newStatus: string,
  ): void => {
    setBlockages((prev) =>
      prev?.map((blockage) =>
        blockage.id === String(blockageId)
          ? {
              ...blockage,
              // status: newStatus as Blockage["status"],
              // timeline: [
              //   ...blockage.timeline,
              //   {
              //     action: `Status Changed to ${newStatus.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
              //     description: `Blockage status updated by user`,
              //     timestamp: new Date(),
              //   },
              // ],
            }
          : blockage,
      ),
    );
  };

  // const handleUpdateBlockage = (updatedData: UpdateBlockageData): void => {
  //   if (!updatedData.id) return;

  //   setBlockages((prev) =>
  //     prev.map((blockage) =>
  //       blockage.id === updatedData.id
  //         ? {
  //             ...blockage,
  //             title: updatedData.title,
  //             description: updatedData.description,
  //             // status: updatedData.status as Blockage["status"],
  //             severity: updatedData.severity,
  //             category: updatedData.category as Blockage["category"],
  //             project: updatedData.project,
  //             // location: updatedData.location,
  //             assignedTo: updatedData.assignedTo,
  //             expectedResolution:
  //               updatedData.expectedResolution ?? blockage.expectedResolution,
  //             // clientVisible:
  //             //   updatedData.clientVisible ?? blockage.clientVisible,
  //             photos:
  //               updatedData.photos?.map((photo) => ({
  //                 url: photo.url,
  //                 description: photo.description ?? "",
  //                 timestamp: photo.timestamp,
  //               })) ?? blockage.photos,
  //             // timeline: updatedData.timeline ?? blockage.timeline,
  //           }
  //         : blockage,
  //     ),
  //   );
  // };

  // const handleAddBlockage = (newBlockageData: {
  //   title: string;
  //   description: string;
  //   project: string;
  //   location: string;
  //   category: string;
  //   severity: string;
  //   assignedTo: string;
  //   expectedResolution?: string;
  //   clientVisible?: boolean;
  //   priority?: boolean;
  //   photos?: BlockagePhoto[];
  // }): void => {
  //   const blockageToAdd: Blockage = {
  //     id: Date.now().toString(),
  //     title: newBlockageData.title,
  //     description: newBlockageData.description,
  //     project: newBlockageData.project,
  //     // location: newBlockageData.location, //
  //     category: newBlockageData.category as Blockage["category"],
  //     severity: newBlockageData.severity as Blockage["severity"],
  //     // status: "open", //
  //     assignedTo: newBlockageData.assignedTo,
  //     createdAt: new Date(),
  //     expectedResolution: newBlockageData.expectedResolution ?? "",
  //     // clientVisible: newBlockageData.clientVisible ?? false, //
  //     priority: newBlockageData.priority ?? false,
  //     // commentsCount: 0, //
  //     photos: newBlockageData.photos ?? [],
  //     // timeline: [
  //     //   {
  //     //     action: "Blockage Reported",
  //     //     description: "New blockage reported",
  //     //     timestamp: new Date(),
  //     //   },
  //     // ],
  //   };
  //   setBlockages((prev) => [blockageToAdd, ...prev]);
  // };

  // const handleEditBlockage = (blockage: Blockage): void => {
  //   setSelectedBlockage(blockage);
  //   setIsDetailModalOpen(true);
  // };

  // Convert blockage to format expected by BlockageCard
  const convertToCardData = (blockage: Blockage): BlockageCardData => ({
    id: blockage.id,
    title: blockage.title,
    description: blockage.description,
    project: blockage.project,
    // location: blockage.location, //
    severity: blockage.severity,
    category: blockage.category,
    // status: blockage.status, //
    createdAt: blockage.createdAt.toISOString(),
    // clientVisible: blockage.clientVisible, //
    assignedTo: blockage.assignedTo,
    priority: blockage.priority,
    // commentsCount: blockage.commentsCount, //
    photos: blockage.photos,
  });

  // // Convert blockage to format expected by BlockageDetailModal
  // const convertToModalData = (blockage: Blockage): BlockageModalData => ({
  //   id: blockage.id,
  //   title: blockage.title,
  //   description: blockage.description,
  //   // status: blockage.status, //
  //   severity: blockage.severity,
  //   category: blockage.category,
  //   project: blockage.project,
  //   // location: blockage.location, //
  //   assignedTo: blockage.assignedTo,
  //   expectedResolution: blockage.expectedResolution,
  //   // clientVisible: blockage.clientVisible, //
  //   createdAt: blockage.createdAt,
  //   photos: blockage.photos,
  //   // timeline: blockage.timeline, //
  // });

  // Filter blockages based on current filters and search
  const filteredBlockages = blockages?.filter((blockage) => {
    // Search filter
    if (
      searchQuery &&
      !blockage.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !blockage.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !blockage.project.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Project filter
    if (filters.project !== "all" && blockage.project !== filters.project) {
      return false;
    }

    // Category filter
    if (filters.category !== "all" && blockage.category !== filters.category) {
      return false;
    }

    // Status filter
    // if (filters.status !== "all" && blockage.status !== filters.status) {
    //   return false;
    // }

    // Severity filter
    if (filters.severity !== "all" && blockage.severity !== filters.severity) {
      return false;
    }

    // Visibility filters
    // if (filters.clientVisible && !blockage.clientVisible) {
    //   return false;
    // }

    // if (filters.internalOnly && blockage.clientVisible) {
    //   return false;
    // }

    // Overdue filter
    // if (filters.overdue) {
    //   const days = Math.ceil(
    //     (new Date().getTime() - blockage.createdAt.getTime()) /
    //       (1000 * 60 * 60 * 24),
    //   );
    //   if (
    //     days <= 7 ||
    //     blockage.status === "resolved" ||
    //     blockage.status === "closed"
    //   ) {
    //     return false;
    //   }
    // }

    // Date range filter
    if (filters.dateRange !== "all") {
      const blockageDate = blockage.createdAt;
      const today = new Date();
      const diffTime = today.getTime() - blockageDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case "7days":
          if (diffDays > 7) return false;
          break;
        case "30days":
          if (diffDays > 30) return false;
          break;
        case "thisMonth":
          if (
            blockageDate.getMonth() !== today.getMonth() ||
            blockageDate.getFullYear() !== today.getFullYear()
          )
            return false;
          break;
      }
    }

    return true;
  });

  // Sort blockages by priority and creation date
  const sortedBlockages = filteredBlockages?.sort((a, b) => {
    // Priority first
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;

    // Then by severity
    const severityOrder: Record<Blockage["severity"], number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    // Finally by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  if (session && !session?.user) {
    router.push("/login");
    return;
  }

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />

      <main className="pt-16 pb-20 md:ml-60 md:pb-6">
        <div className="p-6">
          <Breadcrumb />

          {/* Page Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-text-primary mb-2 text-2xl font-bold">
                Blockage Management
              </h1>
              <p className="text-text-secondary">
                Track and resolve project obstacles with systematic
                documentation
              </p>
            </div>

            {/* <div className="mt-4 flex items-center space-x-3 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                iconSize={16}
              >
                Export Report
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                iconSize={16}
                onClick={() => setIsAddModalOpen(true)}
              >
                Report Blockage
              </Button>
            </div> */}
          </div>

          {/* Statistics */}
          {/* <BlockageStats blockages={blockages} /> */}

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Filters Sidebar */}
            <div className="lg:col-span-3">
              <BlockageFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                // onAddBlockage={() => setIsAddModalOpen(true)}
                onAddBlockage={() => ({})}
              />
            </div>

            {/* Blockages List */}
            <div className="lg:col-span-9">
              {/* Search and View Controls */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 max-w-md flex-1 md:mb-0">
                  <Input
                    placeholder="Search blockages..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    icon={<Icon name="Search" size={18} />}
                    iconPosition="left"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-text-secondary text-sm">
                    {sortedBlockages?.length} of {blockages?.length} blockages
                  </span>
                  <div className="border-border flex items-center rounded-lg border">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      iconName="Grid3X3"
                      iconSize={16}
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    />
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      iconName="List"
                      iconSize={16}
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>

              {/* Blockages Grid/List */}
              {sortedBlockages?.length && sortedBlockages?.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 xl:grid-cols-2"
                      : "space-y-4"
                  }
                >
                  {sortedBlockages?.map((blockage) => (
                    <BlockageCard
                      key={blockage.photos?.[0]?.url}
                      blockage={convertToCardData(blockage)}
                      // onViewDetails={(cardData) => handleViewDetails(blockage)}
                      onViewDetails={(cardData) => ({})}
                      onStatusChange={handleStatusChange}
                      // onEdit={(cardData) => handleEditBlockage(blockage)}
                      onEdit={(cardData) => ({})}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Icon
                    name="AlertTriangle"
                    size={48}
                    className="text-text-secondary mx-auto mb-4"
                  />
                  <h3 className="text-text-primary mb-2 text-lg font-medium">
                    No blockages found
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {searchQuery ||
                    Object.values(filters).some(
                      (f) => f !== "all" && f !== false,
                    )
                      ? "Try adjusting your search or filters"
                      : "No blockages have been reported yet that matches your search or filters"}
                  </p>
                  {/* {!searchQuery &&
                    !Object.values(filters).some(
                      (f) => f !== "all" && f !== false,
                    ) && (
                      <Button
                        variant="default"
                        iconName="Plus"
                        iconPosition="left"
                        iconSize={16}
                        // onClick={() => setIsAddModalOpen(true)}
                        onClick={() => ({})}
                      >
                        Report First Blockage
                      </Button>
                    )} */}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* <BlockageDetailModal
        blockage={
          selectedBlockage ? convertToModalData(selectedBlockage) : null
        }
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBlockage(null);
        }}
        onUpdate={handleUpdateBlockage}
      /> */}

      {/* <AddBlockageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBlockage}
      /> */}
    </div>
  );
};

export default BlockageManagement;
