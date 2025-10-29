/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import Button from "@/components/rocket/components/ui/Button";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import ArchiveFilters from "./components/ArchiveFilters";
import ProjectCard from "./components/ProjectCard";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import ArchiveStats from "./components/ArchiveStats";
import ExportModal from "./components/ExportModal";

// Interface definitions based on component requirements
interface Report {
  id: string | number;
  title: string;
  description: string;
  submittedAt: string;
  submittedBy: string;
  status: "approved" | "rejected" | "pending";
}

interface Photo {
  id: string | number;
  url: string;
  description: string;
}

interface TimelineEvent {
  title: string;
  description: string;
  date: string;
  icon: IconName;
}

interface Analytics {
  supplyProgress: number;
  installationProgress: number;
  avgDailyProgress: number;
  teamEfficiency: number;
}

// ArchivedProject interface matching ProjectCard expectations
interface ArchivedProject {
  id: string;
  name: string;
  clientName: string;
  status: "completed" | "cancelled" | "on-hold";
  completionPercentage: number;
  finalCost: number;
  startDate: string;
  endDate: string;
  archivedDate: string;
  projectManager: string;
  location: string;
  teamSize: number;
  totalReports: number;
  totalPhotos: number;
  totalBlockages: number;
  resolvedBlockages: number;
  timelineAdherence: number;
  budgetAdherence: number;
  qualityScore: number;
  thumbnail: string;
  reports?: Report[];
  photos?: Photo[];
  timeline?: TimelineEvent[];
  analytics?: Analytics;
}

// Project interface for ProjectDetailsModal (converted from ArchivedProject)
interface ProjectForModal {
  id: string | number;
  name: string;
  clientName: string;
  thumbnail: string;
  status: "completed" | "cancelled" | "in-progress";
  completionPercentage: number;
  finalCost: number;
  startDate: string;
  endDate: string;
  teamSize: number;
  totalReports: number;
  projectManager: string;
  location: string;
  timelineAdherence: number;
  budgetAdherence: number;
  qualityScore: number;
  totalPhotos: number;
  totalBlockages: number;
  resolvedBlockages: number;
  reports?: Report[];
  photos?: Photo[];
  timeline?: TimelineEvent[];
  analytics?: Analytics;
}

// Simple Project interface for ExportModal (matches ExportModal expectations)
interface ProjectForExport {
  id: string;
  name: string;
}

interface ArchiveStatsData {
  totalProjects: number;
  completedProjects: number;
  totalValue: number;
  avgCompletion: number;
  totalReports: number;
  totalPhotos: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface CompletionPercentage {
  min: string;
  max: string;
}

interface CostRange {
  min: string;
  max: string;
}

// FiltersState matching ArchiveFilters component expectations
interface FiltersState {
  searchQuery: string;
  dateRange: DateRange;
  projectStatus: string;
  teamMembers: string;
  documentTypes: string;
  completionPercentage: CompletionPercentage;
  costRange: CostRange;
}

interface ExportConfig {
  format: string;
  includeReports: boolean;
  includePhotos: boolean;
  includeTimeline: boolean;
  includeAnalytics: boolean;
  dateRange: { start: string; end: string };
  reportTypes: string[];
  compression: string;
}

interface ExportData {
  projects: ProjectForExport[];
  config: ExportConfig;
}

interface SortOption {
  value: keyof ArchivedProject;
  label: string;
}

const ProjectArchive = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<ArchivedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ArchivedProject[]>(
    [],
  );
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<ArchivedProject | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<keyof ArchivedProject>("endDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to convert ArchivedProject to ProjectForModal
  const convertToModalProject = (
    project: ArchivedProject,
  ): ProjectForModal => ({
    ...project,
    status: project.status === "on-hold" ? "in-progress" : project.status,
  });

  // Helper function to convert ArchivedProject to ProjectForExport
  const convertToExportProject = (
    project: ArchivedProject,
  ): ProjectForExport => ({
    id: project.id,
    name: project.name,
  });

  // Mock archived projects data
  const mockProjects: ArchivedProject[] = [
    {
      id: "PROJ-001",
      name: "Prestige Tech Park - Phase 1",
      clientName: "Prestige Group",
      status: "completed",
      completionPercentage: 100,
      finalCost: 15000000,
      startDate: "2024-01-15",
      endDate: "2024-06-30",
      archivedDate: "2024-07-05",
      projectManager: "Rajesh Kumar",
      location: "Whitefield, Bangalore",
      teamSize: 8,
      totalReports: 156,
      totalPhotos: 342,
      totalBlockages: 12,
      resolvedBlockages: 12,
      timelineAdherence: 95,
      budgetAdherence: 98,
      qualityScore: 92,
      thumbnail:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
      reports: [
        {
          id: "RPT-001",
          title: "Final Project Report",
          description:
            "Comprehensive project completion report with all deliverables",
          submittedAt: "2024-06-30T18:00:00Z",
          submittedBy: "Rajesh Kumar",
          status: "approved",
        },
        {
          id: "RPT-002",
          title: "Quality Assurance Report",
          description: "Final quality inspection and compliance verification",
          submittedAt: "2024-06-29T16:30:00Z",
          submittedBy: "Quality Team",
          status: "approved",
        },
      ],
      photos: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300",
          description: "Main facade completion",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300",
          description: "Interior glass installation",
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300",
          description: "Lobby area finishing",
        },
        {
          id: 4,
          url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=300",
          description: "Conference room setup",
        },
      ],
      timeline: [
        {
          title: "Project Started",
          description: "Initial site setup and team deployment",
          date: "2024-01-15",
          icon: "Play",
        },
        {
          title: "Foundation Complete",
          description: "Structural foundation work completed",
          date: "2024-02-28",
          icon: "CheckCircle",
        },
        {
          title: "Glass Installation",
          description: "Main glass facade installation completed",
          date: "2024-05-15",
          icon: "Building2",
        },
        {
          title: "Project Completed",
          description: "Final handover and client approval",
          date: "2024-06-30",
          icon: "Flag",
        },
      ],
      analytics: {
        supplyProgress: 100,
        installationProgress: 100,
        avgDailyProgress: 2.1,
        teamEfficiency: 94,
      },
    },
    {
      id: "PROJ-002",
      name: "Embassy Business Park - Tower B",
      clientName: "Embassy Group",
      status: "completed",
      completionPercentage: 100,
      finalCost: 22000000,
      startDate: "2023-09-01",
      endDate: "2024-03-15",
      archivedDate: "2024-03-20",
      projectManager: "Priya Singh",
      location: "Manyata Tech Park, Bangalore",
      teamSize: 12,
      totalReports: 198,
      totalPhotos: 456,
      totalBlockages: 8,
      resolvedBlockages: 8,
      timelineAdherence: 88,
      budgetAdherence: 95,
      qualityScore: 96,
      thumbnail:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
      reports: [
        {
          id: "RPT-003",
          title: "Project Completion Report",
          description: "Final deliverables and handover documentation",
          submittedAt: "2024-03-15T17:00:00Z",
          submittedBy: "Priya Singh",
          status: "approved",
        },
      ],
      photos: [
        {
          id: 5,
          url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300",
          description: "Tower exterior view",
        },
        {
          id: 6,
          url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300",
          description: "Office space interior",
        },
      ],
      timeline: [
        {
          title: "Project Initiated",
          description: "Contract signing and team formation",
          date: "2023-09-01",
          icon: "Play",
        },
        {
          title: "Structural Work",
          description: "Main structural components completed",
          date: "2023-12-15",
          icon: "Building",
        },
        {
          title: "Glass Work Complete",
          description: "All glass installation finished",
          date: "2024-02-28",
          icon: "CheckCircle",
        },
        {
          title: "Handover",
          description: "Project delivered to client",
          date: "2024-03-15",
          icon: "Flag",
        },
      ],
      analytics: {
        supplyProgress: 100,
        installationProgress: 100,
        avgDailyProgress: 1.8,
        teamEfficiency: 91,
      },
    },
    {
      id: "PROJ-003",
      name: "Godrej Platinum - Residential Complex",
      clientName: "Godrej Properties",
      status: "cancelled",
      completionPercentage: 45,
      finalCost: 8500000,
      startDate: "2023-11-01",
      endDate: "2024-01-15",
      archivedDate: "2024-01-20",
      projectManager: "Amit Sharma",
      location: "Hebbal, Bangalore",
      teamSize: 6,
      totalReports: 67,
      totalPhotos: 123,
      totalBlockages: 15,
      resolvedBlockages: 8,
      timelineAdherence: 45,
      budgetAdherence: 78,
      qualityScore: 65,
      thumbnail:
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400",
      reports: [
        {
          id: "RPT-004",
          title: "Project Termination Report",
          description: "Documentation of project cancellation and handover",
          submittedAt: "2024-01-15T15:00:00Z",
          submittedBy: "Amit Sharma",
          status: "approved",
        },
      ],
      photos: [
        {
          id: 7,
          url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=300",
          description: "Partial construction view",
        },
        {
          id: 8,
          url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300",
          description: "Site preparation",
        },
      ],
      timeline: [
        {
          title: "Project Started",
          description: "Initial mobilization and setup",
          date: "2023-11-01",
          icon: "Play",
        },
        {
          title: "First Phase",
          description: "Initial construction phase completed",
          date: "2023-12-15",
          icon: "Building",
        },
        {
          title: "Project Cancelled",
          description: "Client requested project termination",
          date: "2024-01-15",
          icon: "X",
        },
      ],
      analytics: {
        supplyProgress: 45,
        installationProgress: 30,
        avgDailyProgress: 1.2,
        teamEfficiency: 68,
      },
    },
    {
      id: "PROJ-004",
      name: "Salarpuria Sattva - Office Complex",
      clientName: "Salarpuria Sattva Group",
      status: "completed",
      completionPercentage: 100,
      finalCost: 18500000,
      startDate: "2023-06-01",
      endDate: "2024-01-30",
      archivedDate: "2024-02-05",
      projectManager: "Neha Patel",
      location: "Electronic City, Bangalore",
      teamSize: 10,
      totalReports: 234,
      totalPhotos: 567,
      totalBlockages: 6,
      resolvedBlockages: 6,
      timelineAdherence: 92,
      budgetAdherence: 96,
      qualityScore: 94,
      thumbnail:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      reports: [
        {
          id: "RPT-005",
          title: "Final Delivery Report",
          description: "Complete project documentation and client sign-off",
          submittedAt: "2024-01-30T16:00:00Z",
          submittedBy: "Neha Patel",
          status: "approved",
        },
      ],
      photos: [
        {
          id: 9,
          url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300",
          description: "Office complex exterior",
        },
        {
          id: 10,
          url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300",
          description: "Interior workspace",
        },
      ],
      timeline: [
        {
          title: "Project Launch",
          description: "Contract execution and team deployment",
          date: "2023-06-01",
          icon: "Play",
        },
        {
          title: "Milestone 1",
          description: "First phase construction completed",
          date: "2023-09-15",
          icon: "CheckCircle",
        },
        {
          title: "Milestone 2",
          description: "Glass installation phase completed",
          date: "2023-12-15",
          icon: "Building2",
        },
        {
          title: "Project Delivered",
          description: "Final handover and documentation",
          date: "2024-01-30",
          icon: "Flag",
        },
      ],
      analytics: {
        supplyProgress: 100,
        installationProgress: 100,
        avgDailyProgress: 2.3,
        teamEfficiency: 96,
      },
    },
  ];

  // Mock statistics
  const mockStats: ArchiveStatsData = {
    totalProjects: 24,
    completedProjects: 21,
    totalValue: 285000000,
    avgCompletion: 94,
    totalReports: 1456,
    totalPhotos: 3247,
  };

  useEffect(() => {
    // Simulate loading
    const loadProjects = async (): Promise<void> => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      setIsLoading(false);
    };

    void loadProjects();
  }, []);

  const handleFiltersChange = (filters: FiltersState): void => {
    let filtered = [...projects];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.clientName.toLowerCase().includes(query) ||
          project.projectManager.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query),
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((project) => {
        const projectEnd = new Date(project.endDate);
        const startFilter = filters.dateRange.start
          ? new Date(filters.dateRange.start)
          : null;
        const endFilter = filters.dateRange.end
          ? new Date(filters.dateRange.end)
          : null;

        if (startFilter && projectEnd < startFilter) return false;
        if (endFilter && projectEnd > endFilter) return false;
        return true;
      });
    }

    // Status filter
    if (filters.projectStatus) {
      filtered = filtered.filter(
        (project) => project.status === filters.projectStatus,
      );
    }

    // Team members filter
    if (filters.teamMembers) {
      filtered = filtered.filter((project) =>
        project.projectManager
          .toLowerCase()
          .includes(filters.teamMembers.toLowerCase()),
      );
    }

    // Completion percentage filter
    if (filters.completionPercentage.min || filters.completionPercentage.max) {
      filtered = filtered.filter((project) => {
        const completion = project.completionPercentage;
        const min = filters.completionPercentage.min
          ? parseInt(filters.completionPercentage.min)
          : 0;
        const max = filters.completionPercentage.max
          ? parseInt(filters.completionPercentage.max)
          : 100;
        return completion >= min && completion <= max;
      });
    }

    // Cost range filter
    if (filters.costRange.min || filters.costRange.max) {
      filtered = filtered.filter((project) => {
        const cost = project.finalCost;
        const min = filters.costRange.min ? parseInt(filters.costRange.min) : 0;
        const max = filters.costRange.max
          ? parseInt(filters.costRange.max)
          : Infinity;
        return cost >= min && cost <= max;
      });
    }

    setFilteredProjects(filtered);
  };

  const handleClearFilters = (): void => {
    setFilteredProjects(projects);
  };

  const handleSort = (field: keyof ArchivedProject): void => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);

    const sorted = [...filteredProjects].sort((a, b) => {
      let aValue: string | number | Date = a[field] as string | number;
      let bValue: string | number | Date = b[field] as string | number;

      if (field === "endDate" || field === "startDate") {
        aValue = new Date(aValue as string);
        bValue = new Date(bValue as string);
      }

      if (newOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(sorted);
  };

  const handleProjectSelect = (projectId: string): void => {
    setSelectedProjects((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleSelectAll = (): void => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map((p) => p.id));
    }
  };

  const handleViewDetails = (project: ArchivedProject): void => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleExportProject = (project: ArchivedProject): void => {
    setSelectedProjects([project.id]);
    setIsExportModalOpen(true);
  };

  const handleBulkExport = (): void => {
    if (selectedProjects.length > 0) {
      setIsExportModalOpen(true);
    }
  };

  const handleExport = (exportData: ExportData): void => {
    // console.log("Exporting projects:", exportData);
    // Implement actual export logic here
    alert(
      `Exporting ${exportData.projects.length} project(s) in ${exportData.config.format.toUpperCase()} format`,
    );
  };

  const sortOptions: SortOption[] = [
    { value: "endDate", label: "End Date" },
    { value: "name", label: "Project Name" },
    { value: "completionPercentage", label: "Completion %" },
    { value: "finalCost", label: "Final Cost" },
    { value: "timelineAdherence", label: "Timeline Adherence" },
  ];

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <Sidebar />
        <main className="min-h-screen pt-16 md:ml-60">
          <div className="p-6">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Icon
                  name="Loader2"
                  size={32}
                  className="text-primary mx-auto mb-4 animate-spin"
                />
                <p className="text-text-secondary">
                  Loading archived projects...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />

      <main className="min-h-screen pt-16 md:ml-60">
        <div className="p-6">
          <Breadcrumb />

          {/* Page Header */}
          <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <h1 className="text-text-primary mb-2 text-2xl font-bold">
                Project Archive
              </h1>
              <p className="text-text-secondary">
                Browse and manage completed project documentation and reports
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3 md:mt-0">
              {selectedProjects.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBulkExport}
                  iconName="Download"
                  iconPosition="left"
                >
                  Export Selected ({selectedProjects.length})
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  iconName="Grid3X3"
                />
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  iconName="List"
                />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <ArchiveStats stats={mockStats} />

          {/* Filters */}
          <ArchiveFilters
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          {/* Results Header */}
          <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <p className="text-text-secondary">
                {filteredProjects.length} of {projects.length} projects
              </p>

              {filteredProjects.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedProjects.length === filteredProjects.length
                    }
                    onChange={handleSelectAll}
                    className="border-border rounded"
                  />
                  <span className="text-text-secondary text-sm">
                    Select All
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3 md:mt-0">
              <span className="text-text-secondary text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  handleSort(e.target.value as keyof ArchivedProject)
                }
                className="border-border bg-background rounded-md border px-3 py-1 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort(sortBy)}
                iconName={sortOrder === "asc" ? "ArrowUp" : "ArrowDown"}
              />
            </div>
          </div>

          {/* Projects Grid/List */}
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center">
              <Icon
                name="Archive"
                size={48}
                className="text-text-secondary mx-auto mb-4"
              />
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                No archived projects found
              </h3>
              <p className="text-text-secondary mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-4"
              }
            >
              {filteredProjects.map((project) => (
                <div key={project.id} className="relative">
                  {viewMode === "grid" && (
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleProjectSelect(project.id)}
                        className="border-border bg-background/80 rounded backdrop-blur-sm"
                      />
                    </div>
                  )}

                  <ProjectCard
                    project={project}
                    onViewDetails={handleViewDetails}
                    onExportProject={handleExportProject}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ProjectDetailsModal
        project={
          selectedProject ? convertToModalProject(selectedProject) : null
        }
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onExportProject={(project) => {
          // Convert back to find the original archived project
          const archivedProject = projects.find((p) => p.id === project.id);
          if (archivedProject) {
            handleExportProject(archivedProject);
          }
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedProjects={selectedProjects
          .map((id) => {
            const project = projects.find((p) => p.id === id);
            return project ? convertToExportProject(project) : null;
          })
          .filter((p): p is ProjectForExport => p !== null)}
        onExport={handleExport}
      />
    </div>
  );
};

export default ProjectArchive;
