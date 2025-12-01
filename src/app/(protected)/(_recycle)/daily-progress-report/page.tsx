"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import AccessRestrictionBanner from "@/components/rocket/components/AccessRestrictionBanner";

import Input from "@/components/rocket/components/ui/Input";
import Select from "@/components/rocket/components/ui/Select";
import Button from "@/components/rocket/components/ui/Button";

// Import components
import DataEntryPanel from "./components/DataEntryPanel";
import PhotoUploadPanel from "./components/PhotoUploadPanel";
import ProgressVisualization from "./components/ProgressVisualization";
import ReportActionBar from "./components/ReportActionBar";
import TimeRestrictionBanner from "./components/TimeRestrictionBanner";
import WorkItemSelector from "./components/WorkItemSelector";

interface Project {
  value: string;
  label: string;
  assignedPM: string;
}

interface WorkItem {
  id: string | number;
  name: string;
  description: string;
  location: string;
  category: string;
  unit: string;
  total_quantity: number;
  completed_quantity: number;
  status: "in_progress" | "completed" | "blocked" | "not_started" | "on_hold";
  daily_target: number;
}

type WorkItemsData = Record<string, Record<string, unknown>>;

interface PhotoData {
  id: number;
  file: File;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
  orientation: string;
  location: string;
  description: string;
}

type PhotoDataState = Record<string, PhotoData[]>;

interface Filters {
  status?: string;
  location?: string;
  category?: string;
}

const DailyProgressReport: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };
  const [activeTab, setActiveTab] = useState<string>("data-entry");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedWorkItems, setSelectedWorkItems] = useState<
    (string | number)[]
  >([]);
  const [workItemsData, setWorkItemsData] = useState<WorkItemsData>({});
  const [photoData, setPhotoData] = useState<PhotoDataState>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({});

  const user = session?.user;
  const loading = isPending;

  // Mock data for projects with customRole-based filtering
  const getAllProjects = (): Project[] => [
    {
      value: "proj-001",
      label: "Skyline Tower - Glass Installation",
      assignedPM: "pm-001",
    },
    {
      value: "proj-002",
      label: "Metro Mall - Facade Work",
      assignedPM: "pm-001",
    },
    {
      value: "proj-003",
      label: "Corporate Plaza - Window Installation",
      assignedPM: "pm-002",
    },
    {
      value: "proj-004",
      label: "Residential Complex - Balcony Work",
      assignedPM: "pm-002",
    },
  ];

  const getAssignedProjects = (): string[] => {
    // Mock assigned projects for PM users
    return ["proj-001", "proj-002"];
  };

  const hasPermission = (permission: string): boolean => {
    // Mock permission check
    return (
      user?.customRole !== Role.PROJECT_MANAGER ||
      permission === "canSubmitDailyReports"
    );
  };

  const getFilteredProjects = (): Project[] => {
    const allProjects = getAllProjects();

    if (!user) return [];

    if (
      user.customRole === Role.MANAGING_DIRECTOR ||
      user.customRole === Role.HEAD_OF_PLANNING
    ) {
      return allProjects;
    } else if (user.customRole === Role.PROJECT_MANAGER) {
      const assignedProjectIds = getAssignedProjects();
      return allProjects.filter((project) =>
        assignedProjectIds.includes(project.value),
      );
    }

    return [];
  };

  const projects = getFilteredProjects();

  // Set default date to yesterday for PM users
  useEffect(() => {
    if (!user) return;

    if (user.customRole === Role.PROJECT_MANAGER && !selectedDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split("T")[0];
      if (dateString) {
        setSelectedDate(dateString);
      }
    } else if (user.customRole !== Role.PROJECT_MANAGER && !selectedDate) {
      const today = new Date();
      const dateString = today.toISOString().split("T")[0];
      if (dateString) {
        setSelectedDate(dateString);
      }
    }
  }, [selectedDate, user]);

  // Set default selected project for PM users
  useEffect(() => {
    if (!user) return;

    if (
      user.customRole === Role.PROJECT_MANAGER &&
      projects.length > 0 &&
      !selectedProject
    ) {
      const firstProjectValue = projects[0]?.value;
      if (firstProjectValue) {
        setSelectedProject(firstProjectValue);
      }
    } else if (
      user.customRole !== Role.PROJECT_MANAGER &&
      projects.length > 0 &&
      !selectedProject
    ) {
      const firstProjectValue = projects[0]?.value;
      if (firstProjectValue) {
        setSelectedProject(firstProjectValue);
      }
    }
  }, [projects, selectedProject, user]);

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
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const mockWorkItems: WorkItem[] = [
    {
      id: 1,
      name: "Curtain Wall Installation - North Face",
      description: "Install structural glazing system on north facade",
      location: "Building A - Floors 1-5",
      category: "Curtain Wall",
      unit: "sqm",
      total_quantity: 500,
      completed_quantity: 125,
      status: "in_progress",
      daily_target: 25,
    },
    {
      id: 2,
      name: "Window Frame Assembly",
      description: "Assemble and install aluminum window frames",
      location: "Building B - East Wing",
      category: "Windows",
      unit: "units",
      total_quantity: 80,
      completed_quantity: 60,
      status: "in_progress",
      daily_target: 20,
    },
    {
      id: 3,
      name: "Glass Panel Fixing",
      description: "Install tempered glass panels with sealant",
      location: "Building A - Ground Floor",
      category: "Glass Work",
      unit: "panels",
      total_quantity: 120,
      completed_quantity: 120,
      status: "completed",
      daily_target: 30,
    },
    {
      id: 4,
      name: "Structural Glazing - South Face",
      description: "Apply structural glazing compound",
      location: "Building C - Floors 6-10",
      category: "Glazing",
      unit: "linear meters",
      total_quantity: 300,
      completed_quantity: 45,
      status: "blocked",
      daily_target: 15,
    },
    {
      id: 5,
      name: "Balcony Railing Installation",
      description: "Install glass balcony railings with steel supports",
      location: "Building B - All Floors",
      category: "Railings",
      unit: "units",
      total_quantity: 60,
      completed_quantity: 0,
      status: "not_started",
      daily_target: 10,
    },
  ];

  // Check if PM user is within allowed time window (10-11 AM)
  const isTimeRestricted = (): boolean => {
    if (user.customRole !== Role.PROJECT_MANAGER) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Only allow between 10:00 AM and 11:00 AM
    return (
      currentHour < 10 ||
      (currentHour === 10 && currentMinute > 59) ||
      currentHour > 10
    );
  };

  // Check if PM user is trying to enter data for today instead of yesterday
  const isDateRestricted = (): boolean => {
    if (user.customRole !== Role.PROJECT_MANAGER) return false;

    const today = new Date().toISOString().split("T")[0];
    return selectedDate === today;
  };

  const handleWorkItemUpdate = (
    itemId: string | number,
    updates: Record<string, unknown>,
  ): void => {
    // PM can only update yesterday's data
    if (user.customRole === Role.PROJECT_MANAGER && isDateRestricted()) {
      alert("Project Managers can only enter data for yesterday's date.");
      return;
    }

    setWorkItemsData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...updates },
    }));
    setHasUnsavedChanges(true);
  };

  const handlePhotoUpload = (photoData: PhotoData): void => {
    // PM can only upload photos for yesterday's work
    if (user.customRole === Role.PROJECT_MANAGER && isDateRestricted()) {
      alert(
        "Project Managers can only upload photos for yesterday's work. Please select yesterday's date.",
      );
      return;
    }

    // For now, we'll associate with the first selected work item
    const workItemId = selectedWorkItems[0];
    if (workItemId) {
      setPhotoData((prev) => ({
        ...prev,
        [workItemId]: [...(prev[workItemId] ?? []), photoData],
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handlePhotoDelete = (photoId: number): void => {
    // Find and remove photo from all work items
    setPhotoData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((workItemId) => {
        updated[workItemId] =
          updated[workItemId]?.filter((photo) => photo.id !== photoId) ?? [];
      });
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = async (): Promise<void> => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setHasUnsavedChanges(false);
    setIsSubmitting(false);

    alert("Draft saved successfully!");
  };

  const handlePreviewReport = (): void => {
    router.push("/pm-final-report-preview");
  };

  const handleSubmitForApproval = async (): Promise<void> => {
    // PM can only submit during allowed time window
    if (user.customRole === Role.PROJECT_MANAGER && isTimeRestricted()) {
      alert(
        "Daily reports can only be submitted between 10:00 AM and 11:00 AM. Please try again during the allowed time window.",
      );
      return;
    }

    // PM can only submit yesterday's data
    if (user.customRole === Role.PROJECT_MANAGER && isDateRestricted()) {
      alert(
        "Project Managers can only submit reports for yesterday's work. Please select yesterday's date.",
      );
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setHasUnsavedChanges(false);
    setIsSubmitting(false);

    alert("Report submitted successfully for approval!");
    router.push("/dashboard");
  };

  const getCurrentWorkItem = (): WorkItem | null => {
    return mockWorkItems[selectedWorkItems.length] ?? null;
  };

  const isFormComplete = (): boolean => {
    return selectedWorkItems.length === mockWorkItems.length;
  };

  // Show access restriction for non-PM users trying to access PM-specific features
  if (
    user.customRole !== Role.PROJECT_MANAGER &&
    !hasPermission("canSubmitDailyReports")
  ) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <Sidebar />
        <main className="pt-24 pb-20 md:ml-60 md:pt-20 md:pb-8">
          <div className="p-6">
            <AccessRestrictionBanner
              title="Daily Report Access Restricted"
              message="Only Project Managers can submit daily progress reports. Please contact your administrator if you need access to this feature."
              type="warning"
            />
          </div>
        </main>
      </div>
    );
  }

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
                  Daily Progress Report
                </h1>
                <p className="text-text-secondary">
                  {user.customRole === Role.PROJECT_MANAGER
                    ? "Submit your daily progress report for yesterday's work"
                    : "Review and manage daily progress reports"}
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
              </div>
            </div>
          </div>

          {/* Time Restriction Banner for PM users */}
          {user.customRole === Role.PROJECT_MANAGER && isTimeRestricted() && (
            <TimeRestrictionBanner />
          )}

          {/* Date Restriction Warning for PM users */}
          {user.customRole === Role.PROJECT_MANAGER && isDateRestricted() && (
            <AccessRestrictionBanner
              title="Date Selection Required"
              message="Project Managers can only enter data for yesterday's work. Please select yesterday's date."
              type="warning"
            />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Sidebar */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Project and Date Selection */}
                <div className="bg-surface border-border rounded-lg border p-4">
                  <h3 className="text-text-primary mb-4 text-lg font-semibold">
                    Report Details
                  </h3>

                  <div className="space-y-4">
                    {/* Project Selection */}
                    <div>
                      <label className="text-text-primary mb-2 block text-sm font-medium">
                        Select Project
                      </label>
                      <Select
                        value={selectedProject}
                        onChange={(value: string) => setSelectedProject(value)}
                        disabled={
                          user.customRole === Role.PROJECT_MANAGER &&
                          projects.length === 1
                        }
                        options={[
                          { value: "", label: "Choose a project..." },
                          ...projects.map((project) => ({
                            value: project.value,
                            label: project.label,
                          })),
                        ]}
                      />
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="text-text-primary mb-2 block text-sm font-medium">
                        Report Date
                      </label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSelectedDate(e.target.value)
                        }
                        disabled={user.customRole === Role.PROJECT_MANAGER}
                        max={
                          user.customRole === Role.PROJECT_MANAGER
                            ? new Date(Date.now() - 86400000)
                                .toISOString()
                                .split("T")[0]
                            : undefined
                        }
                      />
                      {user.customRole === Role.PROJECT_MANAGER && (
                        <p className="text-text-secondary mt-1 text-xs">
                          PMs can only report yesterday&apos;s work
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Work Item Selector */}
                <WorkItemSelector
                  workItems={mockWorkItems}
                  selectedItems={selectedWorkItems}
                  onSelectionChange={setSelectedWorkItems}
                  onFilterChange={setFilters}
                  filters={filters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="bg-surface border-border rounded-lg border">
                  <div className="border-border border-b">
                    <nav className="flex space-x-8 px-6">
                      <button
                        onClick={() => setActiveTab("data-entry")}
                        className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          activeTab === "data-entry"
                            ? "border-primary text-primary"
                            : "text-text-secondary hover:text-text-primary border-transparent"
                        }`}
                      >
                        Data Entry
                      </button>
                      <button
                        onClick={() => setActiveTab("photos")}
                        className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          activeTab === "photos"
                            ? "border-primary text-primary"
                            : "text-text-secondary hover:text-text-primary border-transparent"
                        }`}
                      >
                        Photo Upload
                      </button>
                      <button
                        onClick={() => setActiveTab("progress")}
                        className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          activeTab === "progress"
                            ? "border-primary text-primary"
                            : "text-text-secondary hover:text-text-primary border-transparent"
                        }`}
                      >
                        Progress Overview
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === "data-entry" && (
                      <DataEntryPanel
                        workItems={mockWorkItems}
                        onUpdateItem={handleWorkItemUpdate}
                        onSaveDraft={handleSaveDraft}
                        isTimeRestricted={
                          user.customRole === Role.PROJECT_MANAGER &&
                          isTimeRestricted()
                        }
                        selectedDate={selectedDate}
                      />
                    )}

                    {activeTab === "photos" && (
                      <PhotoUploadPanel
                        selectedWorkItem={mockWorkItems.find((item) =>
                          selectedWorkItems.includes(item.id),
                        )}
                        onPhotoUpload={handlePhotoUpload}
                        onPhotoDelete={handlePhotoDelete}
                        existingPhotos={
                          selectedWorkItems.length > 0 && selectedWorkItems[0]
                            ? photoData[selectedWorkItems[0]]
                            : []
                        }
                      />
                    )}

                    {activeTab === "progress" && (
                      <ProgressVisualization workItems={mockWorkItems} />
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <ReportActionBar
                  hasUnsavedChanges={hasUnsavedChanges}
                  isSubmitting={isSubmitting}
                  canSubmit={isFormComplete()}
                  onSaveDraft={handleSaveDraft}
                  onPreviewReport={handlePreviewReport}
                  onSubmitForApproval={handleSubmitForApproval}
                  userRole={
                    user.customRole === Role.PROJECT_MANAGER
                      ? "PM"
                      : user.customRole === Role.HEAD_OF_PLANNING
                        ? "HOP"
                        : "MD"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyProgressReport;
