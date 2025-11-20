import React, { useState } from "react";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";
import Button from "@/components/rocket/components/ui/Button";

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

interface Project {
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

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onExportProject: (project: Project) => void;
}

type TabId = "overview" | "reports" | "photos" | "timeline" | "analytics";

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
  onExportProject,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (!isOpen || !project) return null;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "Info" as const },
    { id: "reports" as const, label: "Reports", icon: "FileText" as const },
    { id: "photos" as const, label: "Photos", icon: "Camera" as const },
    { id: "timeline" as const, label: "Timeline", icon: "Clock" as const },
    {
      id: "analytics" as const,
      label: "Analytics",
      icon: "BarChart3" as const,
    },
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start gap-4">
        <div className="bg-muted h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={project.thumbnail}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-text-primary mb-2 text-2xl font-bold">
            {project.name}
          </h2>
          <p className="text-text-secondary mb-2">{project.clientName}</p>
          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                project.status === "completed"
                  ? "text-success bg-success/10"
                  : project.status === "cancelled"
                    ? "text-error bg-error/10"
                    : "text-warning bg-warning/10"
              }`}
            >
              {project.status}
            </span>
            <span className="text-text-secondary text-sm">
              {project.completionPercentage}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="IndianRupee" size={16} color="var(--color-primary)" />
            <span className="text-text-secondary text-sm font-medium">
              Final Cost
            </span>
          </div>
          <p className="text-text-primary text-xl font-bold">
            {formatCurrency(project.finalCost)}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="Calendar" size={16} color="var(--color-primary)" />
            <span className="text-text-secondary text-sm font-medium">
              Duration
            </span>
          </div>
          <p className="text-text-primary text-xl font-bold">
            {Math.ceil(
              (new Date(project.endDate).getTime() -
                new Date(project.startDate).getTime()) /
                (1000 * 60 * 60 * 24),
            )}{" "}
            days
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="Users" size={16} color="var(--color-primary)" />
            <span className="text-text-secondary text-sm font-medium">
              Team Size
            </span>
          </div>
          <p className="text-text-primary text-xl font-bold">
            {project.teamSize}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="FileText" size={16} color="var(--color-primary)" />
            <span className="text-text-secondary text-sm font-medium">
              Reports
            </span>
          </div>
          <p className="text-text-primary text-xl font-bold">
            {project.totalReports}
          </p>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-text-primary mb-3 text-lg font-semibold">
            Project Information
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-text-secondary text-sm">Start Date:</span>
              <p className="text-text-primary font-medium">
                {formatDate(project.startDate)}
              </p>
            </div>
            <div>
              <span className="text-text-secondary text-sm">End Date:</span>
              <p className="text-text-primary font-medium">
                {formatDate(project.endDate)}
              </p>
            </div>
            <div>
              <span className="text-text-secondary text-sm">
                Project Manager:
              </span>
              <p className="text-text-primary font-medium">
                {project.projectManager}
              </p>
            </div>
            <div>
              <span className="text-text-secondary text-sm">Location:</span>
              <p className="text-text-primary font-medium">
                {project.location}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-text-primary mb-3 text-lg font-semibold">
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-text-secondary text-sm">
                  Timeline Adherence
                </span>
                <span className="text-sm font-medium">
                  {project.timelineAdherence}%
                </span>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.timelineAdherence}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-text-secondary text-sm">
                  Budget Adherence
                </span>
                <span className="text-sm font-medium">
                  {project.budgetAdherence}%
                </span>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.budgetAdherence}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-text-secondary text-sm">
                  Quality Score
                </span>
                <span className="text-sm font-medium">
                  {project.qualityScore}%
                </span>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.qualityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-semibold">
          Project Reports
        </h3>
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
        >
          Export All Reports
        </Button>
      </div>

      <div className="space-y-3">
        {project.reports?.map((report) => (
          <div key={report.id} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-text-primary mb-1 font-medium">
                  {report.title}
                </h4>
                <p className="text-text-secondary mb-2 text-sm">
                  {report.description}
                </p>
                <div className="text-text-secondary flex items-center gap-4 text-xs">
                  <span>Submitted: {formatDateTime(report.submittedAt)}</span>
                  <span>By: {report.submittedBy}</span>
                  <span
                    className={`rounded-full px-2 py-1 ${
                      report.status === "approved"
                        ? "bg-success/10 text-success"
                        : report.status === "rejected"
                          ? "bg-error/10 text-error"
                          : "bg-warning/10 text-warning"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" iconName="Eye" />
                <Button variant="ghost" size="sm" iconName="Download" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPhotos = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-semibold">
          Project Photos
        </h3>
        <span className="text-text-secondary text-sm">
          {project.totalPhotos} photos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {project.photos?.map((photo) => (
          <div
            key={photo.id}
            className="bg-muted aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={photo.url}
              alt={photo.description}
              className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <h3 className="text-text-primary text-lg font-semibold">
        Project Timeline
      </h3>

      <div className="relative">
        <div className="bg-border absolute top-0 bottom-0 left-4 w-0.5"></div>

        <div className="space-y-6">
          {project.timeline?.map((event, index) => (
            <div key={index} className="relative flex items-start gap-4">
              <div className="bg-primary relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                <Icon name={event.icon} size={16} color="white" />
              </div>
              <div className="flex-1 pb-6">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-text-primary font-medium">
                    {event.title}
                  </h4>
                  <span className="text-text-secondary text-sm">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="text-text-secondary text-sm">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-text-primary text-lg font-semibold">
        Project Analytics
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-text-primary mb-4 font-medium">
            Completion Progress
          </h4>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Supply</span>
                <span>{project.analytics?.supplyProgress}%</span>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${project.analytics?.supplyProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Installation</span>
                <span>{project.analytics?.installationProgress}%</span>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-success h-2 rounded-full"
                  style={{
                    width: `${project.analytics?.installationProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-text-primary mb-4 font-medium">Key Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">
                Total Blockages:
              </span>
              <span className="font-medium">{project.totalBlockages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">
                Resolved Blockages:
              </span>
              <span className="font-medium">{project.resolvedBlockages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">
                Average Daily Progress:
              </span>
              <span className="font-medium">
                {project.analytics?.avgDailyProgress}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">
                Team Efficiency:
              </span>
              <span className="font-medium">
                {project.analytics?.teamEfficiency}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "reports":
        return renderReports();
      case "photos":
        return renderPhotos();
      case "timeline":
        return renderTimeline();
      case "analytics":
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 z-500 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="bg-background elevation-3 absolute inset-4 flex flex-col rounded-lg md:inset-8">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <h1 className="text-text-primary text-xl font-bold">
              Project Details
            </h1>
            <span className="text-text-secondary text-sm">#{project.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportProject(project)}
              iconName="Download"
              iconPosition="left"
            >
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border flex items-center gap-1 overflow-x-auto border-b px-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`transition-smooth flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:text-text-primary hover:bg-muted"
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
