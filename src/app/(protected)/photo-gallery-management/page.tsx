/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Select from "@/components/rocket/components/ui/Select";
import PhotoCard from "./components/PhotoCard";
import PhotoFilters from "./components/PhotoFilters";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/server/auth";
import { Role } from "@prisma/client";
// import PhotoUpload from "./components/PhotoUpload";
// import BulkActions from "./components/BulkActions";
// import PhotoEditModal from "./components/PhotoEditModal";

// Define interfaces
interface PhotoLocation {
  lat: number;
  lng: number;
  // address?: string;
}

interface Photo {
  id: number | string;
  projectId: number;
  thumbnail: string;
  // fullSize?: string;
  description?: string;
  workItem?: string;
  // captureDate: Date | string;
  uploadedBy: string;
  // status: "uploaded" | "uploading" | "failed";
  // orientation?: string;
  location?: PhotoLocation;
  // tags?: string[];
  // fileSize?: number;
  // lastModified?: Date | string;
}

interface Project {
  index: number;
  id: number;
  name: string;
}

// interface WorkItem {
//   id: string;
//   name: string;
// }

interface SortOption {
  value: string;
  label: string;
}

interface ProjectOption {
  value: string;
  label: string;
}

interface LocalPhotoFilters {
  searchQuery: string;
  // dateFrom: string;
  // dateTo: string;
  workCategory: string;
  // orientation: string;
  // status: string;
  teamMember: string;
}

interface PhotoFiltersType {
  // dateFrom?: string;
  // dateTo?: string;
  dateTo?: string;
  workCategory?: string;
  // orientation?: string;
  // status?: string;
  teamMember?: string;
  searchQuery?: string;
}

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

interface BreadcrumbProps {
  projectName?: string;
  customBreadcrumbs?: BreadcrumbItem[];
}

// interface FileData {
//   preview: string;
//   description?: string;
//   workItem?: string;
//   orientation: "landscape" | "portrait" | "square";
//   tags: string[];
//   file: File;
// }

// interface EditFormData {
//   description: string;
//   workItem: string;
//   orientation: string;
//   tags: string[];
// }

const PhotoGalleryManagement: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  // const [selectedPhotos, setSelectedPhotos] = useState<(number | string)[]>([]);

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

  const { data: projects, isLoading: isProjectsLoading } =
    api.project.getAllProjectsWithLatestVersion.useQuery(undefined, {});

  const userRole = session?.user?.customRole;
  const userId = session?.user?.id;

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  // const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  // const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  // const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  // const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  // const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [filters, setFilters] = useState<LocalPhotoFilters>({
    searchQuery: "",
    // dateFrom: "",
    // dateTo: "",
    workCategory: "all",
    // orientation: "all",
    // status: "all",
    teamMember: "all",
  });

  // interface Photo {
  //   id: number | string;
  //   thumbnail: string;
  //   // fullSize?: string;
  //   description?: string;
  //   workItem?: string;
  //   // captureDate: Date | string;
  //   uploadedBy: string;
  //   // status: "uploaded" | "uploading" | "failed";
  //   // orientation?: string;
  //   location?: PhotoLocation;
  //   // tags?: string[];
  //   // fileSize?: number;
  //   // lastModified?: Date | string;
  // }

  // const mockPhotos: Photo[] =
  //   projects?.data?.flatMap(
  //     (project, index1) =>
  //       project.latestProjectVersion?.sheet1
  //         ?.filter(
  //           (item) => !!item?.yesterdayProgressPhotos?.[0]?.photos[0]?.url,
  //         )
  //         .flatMap((item, index2) =>
  //           (item.yesterdayProgressPhotos ?? []).map((photo, index3) => ({
  //             id: `${index1}-${index2}-${index3}` || "",
  //             thumbnail: photo?.photos[0]?.url ?? "",
  //             description: photo?.description ?? "",
  //             workItem: item.itemName ?? "",
  //             uploadedBy: project?.assignedProjectManager?.name ?? "",
  //           })),
  //         ) ?? [],
  //   ) ?? [];
  const mockPhotos: Photo[] =
    projects?.data
      ?.filter((project) => {
        // If user is PM, only show photos from their assigned projects
        if (userRole === Role.PROJECT_MANAGER && userId) {
          return (
            project.latestProjectVersion?.assignedProjectManagerId === userId
          );
        }
        // For other roles, show all projects
        return true;
      })
      ?.flatMap(
        (project, index1) =>
          project.latestProjectVersion?.sheet1
            ?.filter(
              (item) => !!item?.yesterdayProgressPhotos?.[0]?.photos[0]?.url,
            )
            .flatMap((item, index2) =>
              (item.yesterdayProgressPhotos ?? []).map((photo, index3) => ({
                id: `${index1}-${index2}-${index3}` || "",
                projectId: project.latestProjectVersion?.projectId ?? index1,
                thumbnail: photo?.photos[0]?.url ?? "",
                description: photo?.description ?? "",
                workItem: item.itemName ?? "",
                uploadedBy: project?.assignedProjectManager?.name ?? "",
              })),
            ) ?? [],
      ) ?? [];

  // console.log("MOCK PHOTOS", mockPhotos);

  // const mockPhotos: Photo[] = [
  //   {
  //     id: 1,
  //     thumbnail:
  //       "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop",
  //     // fullSize:
  //     //   "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop",
  //     description:
  //       "Main entrance glazing installation progress - Phase 1 completed with structural framework in place",
  //     workItem: "Entrance Glazing",
  //     // captureDate: new Date("2025-01-24T10:30:00"),
  //     uploadedBy: "Rajesh Kumar",
  //     // status: "uploaded",
  //     // orientation: "landscape",
  //     location: {
  //       lat: 28.6139,
  //       lng: 77.209,
  //       // address: "Connaught Place, New Delhi",
  //     },
  //     // tags: ["glazing", "entrance", "structural", "phase-1"],
  //     // fileSize: 2.4 * 1024 * 1024,
  //     // lastModified: new Date("2025-01-24T11:00:00"),
  //   },
  //   {
  //     id: 2,
  //     thumbnail:
  //       "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop",
  //     // fullSize:
  //     //   "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=800&fit=crop",
  //     description:
  //       "Curtain wall installation on the east facade showing proper alignment and weather sealing",
  //     workItem: "Curtain Wall System",
  //     // captureDate: new Date("2025-01-24T14:15:00"),
  //     uploadedBy: "Priya Sharma",
  //     // status: "uploaded",
  //     // orientation: "portrait",
  //     location: {
  //       lat: 28.6129,
  //       lng: 77.2095,
  //       // address: "Connaught Place, New Delhi",
  //     },
  //     // tags: ["curtain-wall", "facade", "sealing", "alignment"],
  //     // fileSize: 3.1 * 1024 * 1024,
  //     // lastModified: new Date("2025-01-24T14:45:00"),
  //   },
  //   {
  //     id: 3,
  //     thumbnail:
  //       "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
  //     // fullSize:
  //     //   "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop",
  //     description:
  //       "Interior glazing work in the main lobby area with safety protocols being followed",
  //     workItem: "Interior Glazing",
  //     // captureDate: new Date("2025-01-23T16:45:00"),
  //     uploadedBy: "Amit Patel",
  //     // status: "uploaded",
  //     // orientation: "landscape",
  //     location: {
  //       lat: 28.6135,
  //       lng: 77.2088,
  //       // address: "Connaught Place, New Delhi",
  //     },
  //     // tags: ["interior", "lobby", "safety", "glazing"],
  //     // fileSize: 1.8 * 1024 * 1024,
  //     // lastModified: new Date("2025-01-23T17:00:00"),
  //   },
  //   {
  //     id: 4,
  //     thumbnail:
  //       "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
  //     // fullSize:
  //     //   "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop",
  //     description:
  //       "Quality inspection of installed glass panels checking for defects and proper installation",
  //     workItem: "Quality Inspection",
  //     // captureDate: new Date("2025-01-23T09:20:00"),
  //     uploadedBy: "Sunita Rao",
  //     // status: "uploaded",
  //     // orientation: "square",
  //     location: {
  //       lat: 28.6142,
  //       lng: 77.2085,
  //       // address: "Connaught Place, New Delhi",
  //     },
  //     // tags: ["inspection", "quality", "defects", "panels"],
  //     // fileSize: 2.7 * 1024 * 1024,
  //     // lastModified: new Date("2025-01-23T09:45:00"),
  //   },
  //   {
  //     id: 5,
  //     thumbnail:
  //       "https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=400&fit=crop",
  //     // fullSize:
  //     //   "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&h=800&fit=crop",
  //     description:
  //       "Structural glazing work on the building's corner section with crane assistance",
  //     workItem: "Structural Glazing",
  //     // captureDate: new Date("2025-01-22T11:30:00"),
  //     uploadedBy: "Vikram Singh",
  //     // status: "uploading",
  //     // orientation: "landscape",
  //     location: {
  //       lat: 28.6138,
  //       lng: 77.2092,
  //       // address: "Connaught Place, New Delhi",
  //     },
  //     // tags: ["structural", "corner", "crane", "glazing"],
  //     // fileSize: 3.5 * 1024 * 1024,
  //     // lastModified: new Date("2025-01-22T12:00:00"),
  //   },
  //   {
  //     id: 6,
  //     thumbnail:
  //       "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop",
  //     // fullSize:
  //     //   "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
  //     description:
  //       "Safety compliance check showing proper use of harnesses and protective equipment",
  //     workItem: "Safety Compliance",
  //     //  captureDate: new Date("2025-01-22T08:45:00"),
  //     uploadedBy: "Rajesh Kumar",
  //     // status: "failed",
  //     // orientation: "portrait",
  //     location: {
  //       lat: 28.6141,
  //       lng: 77.2087,
  //       // address: "Connaught Place, New Delhi",
  //     },
  //     // tags: ["safety", "compliance", "harness", "protection"],
  //     // fileSize: 2.2 * 1024 * 1024,
  //     // lastModified: new Date("2025-01-22T09:00:00"),
  //   },
  // ];

  const mockProjects: Project[] =
    projects?.data?.map((project, index) => ({
      index: index,
      id: project.latestProjectVersion?.projectId ?? index,
      name: project.latestProjectVersion?.projectName ?? "",
    })) ?? [];

  // const mockProjects: Project[] = [
  //   { id: 1, name: "Connaught Place Commercial Complex" },
  //   { id: 2, name: "DLF Cyber City Phase 3" },
  //   { id: 3, name: "Gurgaon IT Park Tower B" },
  // ];

  // const mockWorkItems: WorkItem[] = [
  //   { id: "entrance-glazing", name: "Entrance Glazing" },
  //   { id: "curtain-wall", name: "Curtain Wall System" },
  //   { id: "interior-glazing", name: "Interior Glazing" },
  //   { id: "structural-glazing", name: "Structural Glazing" },
  //   { id: "quality-inspection", name: "Quality Inspection" },
  //   { id: "safety-compliance", name: "Safety Compliance" },
  // ];

  const sortOptions: SortOption[] = [
    // { value: "date-desc", label: "Newest First" },
    // { value: "date-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    // { value: "size-desc", label: "Largest First" },
    // { value: "size-asc", label: "Smallest First" },
  ];

  const projectOptions: ProjectOption[] = [
    { value: "all", label: "All Projects" },
    ...mockProjects.map((project) => ({
      value: project.id.toString(),
      label: project.name,
    })),
  ];

  useEffect(() => {
    setPhotos(mockPhotos);
    // setCurrentProject(mockProjects[0] ?? null);
  }, [isProjectsLoading]);

  useEffect(() => {
    // console.log("################################");
    // console.log("MOCK PROJECTS", mockProjects);
    // console.log("################################");
    if (currentProject) {
      setPhotos(
        mockPhotos.filter((photo) => photo.projectId === currentProject?.id),
      );
    } else {
      setPhotos(mockPhotos);
    }
  }, [currentProject]);

  useEffect(() => {
    let filtered = [...photos];

    // console.log("FILTERED 1 ALL", filtered);

    // Apply filters
    if (filters.searchQuery) {
      filtered = filtered.filter(
        (photo) =>
          (photo.description?.toLowerCase() ?? "").includes(
            filters.searchQuery.toLowerCase(),
          ) ||
          (photo.workItem?.toLowerCase() ?? "").includes(
            filters.searchQuery.toLowerCase(),
          ),
        // (photo.tags ?? []).some((tag) =>
        //   tag.toLowerCase().includes(filters.searchQuery.toLowerCase()),
        // ),
      );
    }

    // console.log("FILTERED 2 SEARCH QUERY", filtered);

    // if (filters.dateFrom) {
    //   filtered = filtered.filter(
    //     (photo) => new Date(photo.captureDate) >= new Date(filters.dateFrom),
    //   );
    // }

    // if (filters.dateTo) {
    //   filtered = filtered.filter(
    //     (photo) => new Date(photo.captureDate) <= new Date(filters.dateTo),
    //   );
    // }

    // console.log("################################");
    // console.log("FILTERS WORK CATEGORY", filters);
    // console.log("################################");

    if (currentProject?.id !== undefined) {
      // filters.workCategory !== "all"
      // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
      // console.log("CURRENT PROJECT ID", currentProject?.id);
      // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
      filtered = filtered.filter(
        (photo) => photo.projectId === currentProject?.id,
      );
    }

    // console.log("FILTERED 3 WORK CATEGORY", filtered);

    // if (filters.orientation !== "all") {
    //   filtered = filtered.filter(
    //     (photo) => photo.orientation === filters.orientation,
    //   );
    // }

    // if (filters.status !== "all") {
    //   filtered = filtered.filter((photo) => photo.status === filters.status);
    // }

    if (filters.teamMember !== "all") {
      filtered = filtered.filter((photo) => {
        // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
        // console.log(photo.uploadedBy.toLowerCase().replace(" ", "-"));
        // console.log(filters.teamMember);
        // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
        return photo.uploadedBy
          .toLowerCase()
          .replace(/\s+/g, "-")
          .includes(filters.teamMember.toLowerCase().replace(/\s+/g, "-"));
      });
    }

    // console.log("FILTERED 4 TEAM MEMBER", filtered);

    // Apply sorting
    // filtered.sort((a, b) => {
    //   switch (sortBy) {
    //     // case "date-desc":
    //     //   return (
    //     //     new Date(b.captureDate).getTime() -
    //     //     new Date(a.captureDate).getTime()
    //     //   );
    //     // case "date-asc":
    //     //   return (
    //     //     new Date(a.captureDate).getTime() -
    //     //     new Date(b.captureDate).getTime()
    //     //   );
    //     case "name-asc":
    //       return (a.workItem ?? "").localeCompare(b.workItem ?? "");
    //     case "name-desc":
    //       return (b.workItem ?? "").localeCompare(a.workItem ?? "");
    //     // case "size-desc":
    //     //   return (b.fileSize ?? 0) - (a.fileSize ?? 0);
    //     // case "size-asc":
    //     //   return (a.fileSize ?? 0) - (b.fileSize ?? 0);
    //     default:
    //       return 0;
    //   }
    // });

    // console.log("FILTERED 5 ASC OR DESC", filtered);

    setFilteredPhotos(filtered);
  }, [photos, filters, sortBy]);

  // const handlePhotoSelect = (photoId: number | string): void => {
  //   setSelectedPhotos((prev) =>
  //     prev.includes(photoId)
  //       ? prev.filter((id) => id !== photoId)
  //       : [...prev, photoId],
  //   );
  // };

  // const handleSelectAll = (): void => {
  //   if (selectedPhotos.length === filteredPhotos.length) {
  //     setSelectedPhotos([]);
  //   } else {
  //     setSelectedPhotos(filteredPhotos.map((photo) => photo.id));
  //   }
  // };

  // const handlePhotoView = (photo: Photo): void => {
  //   const index = filteredPhotos.findIndex((p) => p.id === photo.id);
  //   setLightboxIndex(index);
  //   setIsLightboxOpen(true);
  // };

  // const handlePhotoEdit = (photo: Photo): void => {
  //   setEditingPhoto(photo);
  //   setIsEditModalOpen(true);
  // };

  // const handlePhotoDelete = (photo: Photo): void => {
  //   if (window.confirm("Are you sure you want to delete this photo?")) {
  //     setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  //     setSelectedPhotos((prev) => prev.filter((id) => id !== photo.id));
  //   }
  // };

  // const handleBulkDelete = (photoIds: (number | string)[]): void => {
  //   if (
  //     window.confirm(
  //       `Are you sure you want to delete ${photoIds.length} photo(s)?`,
  //     )
  //   ) {
  //     setPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)));
  //     setSelectedPhotos([]);
  //   }
  // };

  // const handleBulkDownload = (photoIds: (number | string)[]): void => {
  // console.log("Downloading photos:", photoIds);
  //   // Implement bulk download logic
  // };

  // const handleBulkAddToReport = (photoIds: (number | string)[]): void => {
  // console.log("Adding photos to report:", photoIds);
  //   // Implement add to report logic
  // };

  // const handleBulkEdit = (photoIds: (number | string)[]): void => {
  // console.log("Bulk editing photos:", photoIds);
  //   // Implement bulk edit logic
  // };

  // const handlePhotoUpload = async (uploadFiles: FileData[]): Promise<void> => {
  //   const newPhotos: Photo[] = uploadFiles.map((fileData, index) => ({
  //     id: Date.now() + index,
  //     thumbnail: fileData.preview,
  //     fullSize: fileData.preview,
  //     description: fileData.description ?? "Uploaded photo",
  //     workItem: fileData.workItem ?? "General Progress",
  //     captureDate: new Date(),
  //     uploadedBy: "Current User",
  //     status: "uploaded" as const,
  //     orientation: fileData.orientation,
  //     location: {
  //       lat: 28.6139 + (Math.random() - 0.5) * 0.01,
  //       lng: 77.209 + (Math.random() - 0.5) * 0.01,
  //       address: "Construction Site",
  //     },
  //     tags: fileData.tags,
  //     fileSize: fileData.file.size,
  //     lastModified: new Date(),
  //   }));

  //   setPhotos((prev) => [...newPhotos, ...prev]);
  // };

  // const handlePhotoSave = async (
  //   photoId: number | string,
  //   formData: EditFormData,
  // ): Promise<void> => {
  //   const updates = {
  //     description: formData.description,
  //     workItem: formData.workItem,
  //     orientation: formData.orientation as "landscape" | "portrait" | "square",
  //     tags: formData.tags,
  //     lastModified: new Date(),
  //   };

  //   setPhotos((prev) =>
  //     prev.map((photo) =>
  //       photo.id === photoId ? { ...photo, ...updates } : photo,
  //     ),
  //   );
  // };

  // const handleLightboxNext = (): void => {
  //   setLightboxIndex((prev) =>
  //     prev < filteredPhotos.length - 1 ? prev + 1 : prev,
  //   );
  // };

  // const handleLightboxPrevious = (): void => {
  //   setLightboxIndex((prev) => (prev > 0 ? prev - 1 : prev));
  // };

  const handleFiltersChange = (newFilters: PhotoFiltersType): void => {
    // Convert from child component's PhotoFilters to our LocalPhotoFilters
    const localFilters: LocalPhotoFilters = {
      searchQuery: newFilters.searchQuery ?? "",
      // dateFrom: newFilters.dateFrom ?? "",
      // dateTo: newFilters.dateTo ?? "",
      workCategory: newFilters.workCategory ?? "all",
      // orientation: newFilters.orientation ?? "all",
      // status: newFilters.status ?? "all",
      teamMember: newFilters.teamMember ?? "all",
    };
    setFilters(localFilters);
  };

  const handleClearFilters = (): void => {
    setFilters({
      searchQuery: "",
      // dateFrom: "",
      // dateTo: "",
      workCategory: "all",
      // orientation: "all",
      // status: "all",
      teamMember: "all",
    });
  };

  // Convert LocalPhotoFilters to the child component's PhotoFilters format
  const childFilters: PhotoFiltersType = {
    searchQuery: filters.searchQuery || undefined,
    // dateFrom: filters.dateFrom || undefined,
    // dateTo: filters.dateTo || undefined,
    workCategory:
      filters.workCategory !== "all" ? filters.workCategory : undefined,
    // orientation:
    // filters.orientation !== "all" ? filters.orientation : undefined,
    // status: filters.status !== "all" ? filters.status : undefined,
    teamMember: filters.teamMember !== "all" ? filters.teamMember : undefined,
  };

  // Custom Breadcrumb component that accepts props
  const CustomBreadcrumb: React.FC<BreadcrumbProps> = ({
    projectName,
    customBreadcrumbs,
  }) => {
    if (!customBreadcrumbs) return <Breadcrumb />;

    return (
      <nav className="mb-6 flex items-center space-x-2" aria-label="Breadcrumb">
        {customBreadcrumbs.map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 && (
              <Icon
                name="ChevronRight"
                size={16}
                color="var(--color-text-secondary)"
              />
            )}
            {item.isActive ? (
              <span className="text-text-primary text-sm font-semibold">
                {item.label}
              </span>
            ) : (
              <a
                href={item.path}
                className="text-text-secondary hover:text-text-primary transition-smooth text-sm font-medium"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // console.log("#####################################");
  // console.log(filteredPhotos);
  // console.log(filters);
  // console.log("#####################################");

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />

      <main className="pt-24 pb-20 md:ml-60 md:pt-20 md:pb-6">
        <div className="p-6">
          <CustomBreadcrumb
            projectName={currentProject?.name}
            customBreadcrumbs={[
              { label: "Dashboard", path: "/dashboard", isActive: false },
              {
                label: currentProject?.name ?? "Project",
                path: "/project-management-dashboard",
                isActive: false,
              },
              {
                label: "Photo Gallery",
                path: "/photo-gallery-management",
                isActive: true,
              },
            ]}
          />

          {/* Page Header */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-text-primary mb-2 text-2xl font-semibold">
                {/* Photo Gallery Management */}
                Photo Gallery
              </h1>
              <p className="text-text-secondary">
                Organize and manage construction progress photos with metadata
                and location tracking
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Select
                options={projectOptions}
                value={currentProject?.id.toString() ?? "all"}
                onChange={(value) => {
                  if (value === "all") {
                    setCurrentProject(null);
                    setFilters({
                      ...filters,
                      workCategory: "all",
                    });
                  } else {
                    setCurrentProject(
                      mockProjects.find((p) => p.id.toString() === value) ??
                        null,
                    );
                    setFilters({
                      ...filters,
                      workCategory:
                        mockProjects.find((p) => p.id.toString() === value)
                          ?.name ?? "all",
                    });
                  }
                }}
                className="w-64"
              />
              {/* <Button
                variant="default"
                iconName="Upload"
                onClick={() => setIsUploadOpen(true)}
              >
                Upload Photos
              </Button> */}
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="bg-card border-border rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Photos</p>
                  <p className="text-text-primary text-2xl font-semibold">
                    {photos.length}
                  </p>
                </div>
                <Icon name="Image" size={24} color="var(--color-primary)" />
              </div>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Uploaded Today</p>
                  <p className="text-text-primary text-2xl font-semibold">
                    {
                      photos.filter((p) => {
                        const today = new Date().toDateString();
                        return new Date(p.captureDate).toDateString() === today;
                      }).length
                    }
                  </p>
                </div>
                <Icon name="Calendar" size={24} color="var(--color-success)" />
              </div>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Failed Uploads</p>
                  <p className="text-text-primary text-2xl font-semibold">
                    {photos.filter((p) => p.status === "failed").length}
                  </p>
                </div>
                <Icon name="AlertCircle" size={24} color="var(--color-error)" />
              </div>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Storage Used</p>
                  <p className="text-text-primary text-2xl font-semibold">
                    {(
                      photos.reduce((acc, p) => acc + (p.fileSize ?? 0), 0) /
                      1024 /
                      1024
                    ).toFixed(1)}
                    MB
                  </p>
                </div>
                <Icon name="HardDrive" size={24} color="var(--color-warning)" />
              </div>
            </div>
          </div> */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <PhotoFilters
                filters={childFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                totalPhotos={photos.length}
                filteredPhotos={filteredPhotos.length}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="mb-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                {/* <div className="flex items-center space-x-3">
                  <Button
                    variant={
                      selectedPhotos.length === filteredPhotos.length
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    iconName={
                      selectedPhotos.length === filteredPhotos.length
                        ? "CheckSquare"
                        : "Square"
                    }
                    onClick={handleSelectAll}
                  >
                    {selectedPhotos.length === filteredPhotos.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>

                  {selectedPhotos.length > 0 && (
                    <span className="text-text-secondary text-sm">
                      {selectedPhotos.length} selected
                    </span>
                  )}
                </div> */}

                <div className="flex items-center space-x-3">
                  {/* <Select
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                    className="w-40"
                  /> */}

                  <div className="border-border flex items-center rounded-md border">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      iconName="Grid3X3"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    />
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      iconName="List"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Grid */}
              {filteredPhotos.length > 0 ? (
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredPhotos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      // isSelected={selectedPhotos.includes(photo.id)}
                      // onSelect={handlePhotoSelect}
                      // onView={handlePhotoView}
                      // onEdit={handlePhotoEdit}
                      // onDelete={handlePhotoDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Icon
                    name="Image"
                    size={48}
                    color="var(--color-text-secondary)"
                    className="mx-auto mb-4"
                  />
                  <h3 className="text-text-primary mb-2 text-lg font-medium">
                    No photos found
                  </h3>
                  {/* <p className="text-text-secondary mb-4">
                    {photos.length === 0
                      ? "Upload your first construction progress photo to get started"
                      : "Try adjusting your filters to see more photos"}
                  </p>
                  <Button
                    variant="outline"
                    iconName="Upload"
                    // onClick={() => setIsUploadOpen(true)}
                  >
                    Upload Photos
                  </Button> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Photo Lightbox */}
      {/* <PhotoLightbox
        photos={filteredPhotos}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNext={handleLightboxNext}
        onPrevious={handleLightboxPrevious}
        onEdit={handlePhotoEdit}
        onDelete={handlePhotoDelete}
      /> */}

      {/* Photo Upload Modal */}
      {/* <PhotoUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handlePhotoUpload}
        projectId={currentProject?.id}
        workItems={mockWorkItems}
      /> */}

      {/* Photo Edit Modal */}
      {/* <PhotoEditModal
        photo={editingPhoto}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPhoto(null);
        }}
        onSave={handlePhotoSave}
        workItems={mockWorkItems}
      /> */}

      {/* Bulk Actions */}
      {/* <BulkActions
        selectedPhotos={selectedPhotos}
        onBulkDelete={handleBulkDelete}
        onBulkEdit={handleBulkEdit}
        onBulkDownload={handleBulkDownload}
        onBulkAddToReport={handleBulkAddToReport}
        onClearSelection={() => setSelectedPhotos([])}
      /> */}
    </div>
  );
};

export default PhotoGalleryManagement;
