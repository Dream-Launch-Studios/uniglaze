"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { Role } from "@prisma/client";
import type { Session } from "@/server/auth";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";

interface ProjectDocument {
  s3Key: string;
  fileName: string;
  fileType: string;
  url: string;
}

interface ProjectWithDocuments {
  projectId: number;
  projectName: string;
  documents: ProjectDocument[];
}

const Resources: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<
    "all" | "document" | "drawing" | "image"
  >("all");

  const { data: projects } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  // Check authentication
  React.useEffect(() => {
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

  // Process projects and their documents
  const projectsWithDocuments: ProjectWithDocuments[] = useMemo(() => {
    if (!projects?.data) return [];

    return projects.data
      .map((project) => ({
        projectId: project.latestProjectVersion.projectId ?? 0,
        projectName: project.latestProjectVersion.projectName,
        documents:
          project.latestProjectVersion.projectDocuments?.map((doc) => ({
            s3Key: doc.s3Key,
            fileName: doc.fileName,
            fileType: doc.fileType,
            url: doc.url,
          })) ?? [],
      }))
      .filter((project) => project.documents.length > 0);
  }, [projects]);

  // Filter projects based on user role
  const filteredProjects = useMemo(() => {
    if (!session?.user) return [];

    const userRole = session.user.customRole;

    if (
      userRole === Role.MANAGING_DIRECTOR ||
      userRole === Role.HEAD_OF_PLANNING
    ) {
      return projectsWithDocuments;
    } else if (userRole === Role.PROJECT_MANAGER) {
      // For PM, only show projects assigned to them
      return projectsWithDocuments.filter((project) => {
        const assignedPM =
          projects?.data?.find(
            (p) =>
              p.latestProjectVersion.projectId === project.projectId,
          )?.assignedProjectManager;
        return assignedPM?.id === session.user.id;
      });
    }

    return [];
  }, [projectsWithDocuments, projects, session]);

  // Get all documents from filtered projects
  const allDocuments = useMemo(() => {
    const docs: Array<ProjectDocument & { projectName: string; projectId: number }> =
      [];

    filteredProjects.forEach((project) => {
      project.documents.forEach((doc) => {
        docs.push({
          ...doc,
          projectName: project.projectName,
          projectId: project.projectId,
        });
      });
    });

    return docs;
  }, [filteredProjects]);

  // Filter documents based on selected project, search query, and type
  const filteredDocuments = useMemo(() => {
    let filtered = allDocuments;

    // Filter by project
    if (selectedProject !== "all") {
      filtered = filtered.filter(
        (doc) => doc.projectId.toString() === selectedProject,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(query) ||
          doc.projectName.toLowerCase().includes(query),
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => {
        const extension = doc.fileName.split(".").pop()?.toLowerCase() ?? "";
        if (filterType === "document") {
          return ["pdf", "doc", "docx", "xls", "xlsx"].includes(extension);
        } else if (filterType === "drawing") {
          return ["dwg", "dxf"].includes(extension);
        } else if (filterType === "image") {
          return ["jpg", "jpeg", "png", "gif"].includes(extension);
        }
        return true;
      });
    }

    return filtered;
  }, [allDocuments, selectedProject, searchQuery, filterType]);

  const getFileIconName = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (["pdf", "doc", "docx", "xls", "xlsx"].includes(extension)) {
      return "FileText";
    } else if (["dwg", "dxf"].includes(extension)) {
      return "FileImage";
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return "Image";
    }
    return "File";
  };

  const getFileTypeLabel = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (["pdf", "doc", "docx", "xls", "xlsx"].includes(extension)) {
      return "Document";
    } else if (["dwg", "dxf"].includes(extension)) {
      return "Drawing";
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return "Image";
    }
    return "File";
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />
      <main className="pt-24 pb-20 md:ml-60 md:pt-20 md:pb-8">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-text-primary mb-2 text-3xl font-bold">
              View Resources
            </h1>
            <p className="text-text-secondary">
              Access all uploaded documents, drawings, and reference files
              across projects
            </p>
          </div>

          {/* Filters */}
          <div className="bg-surface border-border mb-6 rounded-lg border p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Project Filter */}
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Filter by Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2"
                >
                  <option value="all">All Projects</option>
                  {filteredProjects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as "all" | "document" | "drawing" | "image",
                    )
                  }
                  className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2"
                >
                  <option value="all">All Types</option>
                  <option value="document">Documents</option>
                  <option value="drawing">Drawings</option>
                  <option value="image">Images</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Search
                </label>
                <div className="relative">
                  <Icon
                    name="Search"
                    size={18}
                    className="text-text-secondary absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by filename or project..."
                    className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border bg-background pl-10 pr-3 py-2 text-sm focus:ring-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={`${doc.projectId}-${doc.s3Key}`}
                  className="bg-surface border-border hover:border-primary/50 group rounded-lg border p-4 transition-all"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                      <Icon
                        name={getFileIconName(doc.fileName)}
                        size={24}
                        color="var(--color-primary)"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/5"
                        onClick={() => window.open(doc.url, "_blank")}
                      >
                        <Icon name="ExternalLink" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/5"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.url;
                          link.download = doc.fileName;
                          link.click();
                        }}
                      >
                        <Icon name="Download" size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-text-primary mb-1 truncate text-sm font-semibold">
                      {doc.fileName}
                    </h3>
                    <p className="text-text-secondary text-xs">
                      {doc.projectName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="bg-muted text-text-secondary rounded-full px-2 py-1 text-xs">
                      {getFileTypeLabel(doc.fileName)}
                    </span>
                    <span className="text-text-secondary text-xs">
                      {doc.fileType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border-border rounded-lg border p-12 text-center">
              <Icon
                name="FolderX"
                size={48}
                className="text-text-secondary mx-auto mb-4"
              />
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                No resources found
              </h3>
              <p className="text-text-secondary">
                {searchQuery || selectedProject !== "all" || filterType !== "all"
                  ? "Try adjusting your filters or search query"
                  : "No documents have been uploaded to projects yet"}
              </p>
            </div>
          )}

          {/* Summary */}
          {filteredDocuments.length > 0 && (
            <div className="bg-surface border-border mt-6 rounded-lg border p-4">
              <p className="text-text-secondary text-sm">
                Showing <strong>{filteredDocuments.length}</strong>{" "}
                {filteredDocuments.length === 1 ? "resource" : "resources"}
                {selectedProject !== "all" &&
                  ` from ${filteredProjects.find((p) => p.projectId.toString() === selectedProject)?.projectName}`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Resources;
