"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";

import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import WorkflowSidebar from "./components/WorkflowSidebar";
import ProjectSelectionStep from "./components/ProjectSelectionStep";
import YesterdayProgressStep from "./components/YesterdayProgressStep";
import Icon from "@/components/rocket/components/AppIcon";
import type { IconName } from "@/components/rocket/components/AppIcon";
import { api } from "@/trpc/react";
import {
  projectVersionSchema,
  type projectSchema,
} from "@/validators/prisma-schmea.validator";
import type { z } from "zod";
import { useProjectStore } from "@/store/project.store";
import { toast } from "sonner";
import { ReportStatus, Role } from "@prisma/client";

interface ProgressData {
  suppliedYesterday: number;
  installedYesterday: number;
}

interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

interface PhotoData {
  id: number;
  file: File;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  gpsCoordinates: GPSCoordinates;
  locationName: string;
  description: string;
  itemId: string;
  itemName: string;
  thumbnail: string;
}

interface BlockagePhotoData {
  id: number;
  file: File;
  thumbnail: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

interface BlockageData {
  id: number;
  type: string;
  category: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  photos: BlockagePhotoData[];
  projectId: string;
  projectName: string;
  reportedAt: string;
  status: string;
}

interface WorkflowData {
  selectedProjectId: number | null;
  // supplyInstallData: SupplyInstallFormData;
  yesterdayProgress: Record<string, ProgressData>;
  photos: Record<string, PhotoData[]>;
  blockages: Record<string, BlockageData[]>;
  currentItemIndex: number;
  isWorkflowComplete: boolean;
}

interface WorkflowStep {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  completed: boolean;
}

const ProjectManagerDailyWorkflow: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };

  const { updateSupplyAndInstallationsFromYesterdayProgressReport } =
    useProjectStore.getState();

  const { mutateAsync: createProjectVersion } =
    api.project.createProjectVersion.useMutation({
      onSuccess: () => {
        // useProjectStore.getState().resetProject();
        toast.success("Daily Report created successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { data: projects } =
    api.project.getAllProjectsAssignedToProjectManager.useQuery(undefined, {});

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    selectedProjectId: null,

    // supplyInstallData: {},
    yesterdayProgress: {},
    photos: {},
    blockages: {},

    currentItemIndex: 0,
    isWorkflowComplete: false,
  });

  // Check authentication and customRole
  useEffect(() => {
    if (isPending) return;

    if (session && !session?.user) {
      router.push("/login");
      return;
    }

    if (session?.user?.customRole !== Role.PROJECT_MANAGER) {
      router.push("/dashboard");
      return;
    }
  }, [session, router, isPending]);

  // Workflow steps configuration
  const workflowSteps: WorkflowStep[] = [
    {
      id: "select-project",
      label: "Select Project",
      icon: "FolderOpen",
      description: "Choose assigned project",
      completed: !!workflowData.selectedProjectId,
    },
    {
      id: "yesterday-progress",
      label: "Yesterday's Progress",
      icon: "Clock",
      description: "Record yesterday's work progress",
      completed: Object.keys(workflowData.yesterdayProgress).length > 0,
    },
    // {
    //   id: "final-review",
    //   label: "Final Review",
    //   icon: "CheckCircle",
    //   description: "Review and submit workflow",
    //   completed: workflowData.isWorkflowComplete,
    // },
  ];

  const updateWorkflowData = (stepData: Partial<WorkflowData>): void => {
    setWorkflowData((prev) => ({
      ...prev,
      ...stepData,
    }));

    // Auto-save to localStorage
    const updatedData = { ...workflowData, ...stepData };
    localStorage.setItem("pmWorkflowData", JSON.stringify(updatedData));
  };

  const canProgressToStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) return true;
    return workflowSteps[stepIndex - 1]?.completed ?? false;
  };

  const handleStepChange = (stepIndex: number): void => {
    if (canProgressToStep(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleNextStep = (): void => {
    if (currentStep < workflowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteWorkflow = async (): Promise<void> => {
    updateWorkflowData({ isWorkflowComplete: true });

    // updateSupplyAndInstallationsFromYesterdayProgressReport();

    // Get fresh state after mutation
    const currentProjectData = useProjectStore.getState().getProject();
    const validated = projectVersionSchema.safeParse(
      currentProjectData.latestProjectVersion,
    );
    if (!validated.success) {
      toast.error(validated.error.message);
      return;
    }

    const projectVersion = await createProjectVersion({
      ...validated.data,
      yesterdayReportStatus: ReportStatus.NOT_CREATED,
      yesterdayReportCreatedAt: new Date(),
    });

    if (projectVersion) {
      useProjectStore.getState().setProject(projectVersion);
      // resetProject();
      router.push("/pm-final-report-preview");
    } else {
      toast.error("Failed to save the daily report. Check that all required fields are filled correctly and that quantities don't exceed totals. Try again or contact support.");
    }
  };

  const renderCurrentStep = (): React.ReactNode => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectSelectionStep
            assignedProjects={
              (projects?.data?.filter((p) => p.latestProjectVersion != null) ??
                []) as unknown as z.infer<typeof projectSchema>[]
            }
            onNext={handleNextStep}
          />
        );
      case 1:
        return (
          <YesterdayProgressStep
            onNext={handleCompleteWorkflow}
            onPrevious={handlePreviousStep}
          />
        );
      // case 2:
      //   return (
      //     <FinalReviewStep
      //       onComplete={handleCompleteWorkflow}
      //       onPrevious={handlePreviousStep}
      //     />
      //   );
      default:
        return null;
    }
  };

  if (
    (!session?.user && isPending) ||
    session?.user?.customRole !== Role.PROJECT_MANAGER
  ) {
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

      <main className="pt-24 pb-8 md:ml-60 md:pt-20">
        <div className="p-6">
          <Breadcrumb />

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-text-primary mb-2 text-3xl font-bold">
              Daily Workflow
            </h1>
            <p className="text-text-secondary">
              Complete your daily reporting tasks step by step
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Desktop Sidebar - 3 columns */}
            <div className="hidden lg:col-span-3 lg:block">
              <WorkflowSidebar
                steps={workflowSteps}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                canProgressToStep={canProgressToStep}
              />
            </div>

            {/* Mobile Step Indicator */}
            <div className="col-span-full lg:hidden">
              <div className="bg-surface border-border mb-6 rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-text-primary font-semibold">
                    Step {currentStep + 1} of {workflowSteps.length}
                  </h3>
                  <span className="text-text-secondary text-sm">
                    {(((currentStep + 1) / workflowSteps.length) * 100).toFixed(
                      2,
                    )}
                    % Complete
                  </span>
                </div>
                <div className="bg-muted mb-3 h-2 w-full rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentStep + 1) / workflowSteps.length) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Icon
                    name={workflowSteps[currentStep]?.icon ?? "HelpCircle"}
                    size={16}
                    color="var(--color-primary)"
                  />
                  <span className="text-text-primary text-sm font-medium">
                    {workflowSteps[currentStep]?.label ?? "Unknown Step"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content - 9 columns */}
            <div className="lg:col-span-9">
              <div className="bg-surface border-border rounded-lg border">
                {renderCurrentStep()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectManagerDailyWorkflow;
