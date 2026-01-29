/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import type * as LucideIcons from "lucide-react";

// Import sheet creation components
import Sheet1Creation from "./components/Sheet1Creation";
import Sheet2Creation from "./components/Sheet2Creation";
import SheetPreview from "./components/SheetPreview";
import { useProjectStore } from "@/store/project.store";
import { projectVersionSchema } from "@/validators/prisma-schmea.validator";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { Role } from "@prisma/client";

interface WorkflowStep {
  id: string;
  label: string;
  icon: string;
  description: string;
  completed: boolean;
}

interface ValidationErrors {
  sheet1?: string | null;
  sheet2?: string | null;
  assignment?: string | null;
}

const SheetCreationWorkflow: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const projectData = useProjectStore.getState();

  const isHydrated = useProjectStore?.persist?.hasHydrated();

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

    if (session?.user?.customRole === Role.PROJECT_MANAGER) {
      router.push("/dashboard");
      return;
    }
  }, [session, router, isPending]);

  // Get project data from zustand store
  useEffect(() => {
    if (!isHydrated) return;
    // If no project data, redirect back to project creation
    if (!projectData) router.push("/project-creation");
  }, [isHydrated]);

  const { mutateAsync: createProjectVersion } =
    api.project.createProjectVersion.useMutation({
      onSuccess: () => {
        useProjectStore.getState().resetProject();
        toast.success("Project created successfully with Sheet 1 & Sheet 2");
        setIsLoading(false);
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(error.message);
        setIsLoading(false);
      },
    });

  // Workflow steps configuration
  const workflowSteps: WorkflowStep[] = [
    {
      id: "sheet1",
      label: "Sheet 1 - Master Data",
      icon: "Table",
      description: "Create main project structure and items",
      completed: (projectData?.latestProjectVersion?.sheet1?.length ?? 0) > 0,
    },
    {
      id: "sheet2",
      label: "Sheet 2 - Detailed Breakdown",
      icon: "List",
      description: "Break down items into sub-tasks",
      completed:
        projectData?.latestProjectVersion?.sheet1?.some(
          (item) => item?.sheet2?.length > 0,
        ) ?? false,
    },
    {
      id: "preview",
      label: "Preview & Review",
      icon: "Eye",
      description: "Review both sheets before finalizing",
      completed: false,
    },
  ];

  const validateCurrentStep = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (
      currentStep === 0 &&
      useProjectStore.getState().latestProjectVersion?.sheet1?.length === 0
    ) {
      newErrors.sheet1 = "At least one item must be added to Sheet 1";
    }

    if (
      currentStep === 1 &&
      !useProjectStore
        .getState()
        .latestProjectVersion?.sheet1?.some((item) => item.sheet2.length > 0)
    ) {
      newErrors.sheet2 = "At least one sub-task must be added to Sheet 2";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (): void => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < workflowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async (): Promise<void> => {
    setIsLoading(true);

    // TODO: Simulate API call to save draft
    setTimeout(() => {
      setIsLoading(false);
      // Show success message
      toast.success("Draft saved successfully");
    }, 1000);
  };

  const handleFinalizeProject = async (): Promise<void> => {
    if (!validateCurrentStep()) {
      return;
    }
    setIsLoading(true);
    // Save completed project data and navigate to project dashboard
    try {
      const projectData = useProjectStore.getState().getProject();
      // console.log("######################################################");
      // console.log("######################################################");
      // console.log("PROJECT DATA BRO", projectData.latestProjectVersion!);
      // console.log("######################################################");
      // console.log("######################################################");
      const validated = projectVersionSchema.safeParse(
        projectData.latestProjectVersion,
      );
      if (!validated.success) {
        toast.error(validated.error.message);
        setIsLoading(false);
        return;
      }
      // console.log("######################################################");
      // console.log("######################################################");
      // console.log("VALIDATED DATA BRO", validated.data);
      // console.log("######################################################");
      // console.log("######################################################");
      const updatedProject = await createProjectVersion({
        ...validated.data,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to finalize project. Check that all required fields in Sheet 1 and Sheet 2 are filled correctly and try again. If the problem continues, contact support.");
      setIsLoading(false);
    }
  };

  const canProgressToStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) return true;
    if (stepIndex - 1 >= 0 && stepIndex - 1 < workflowSteps.length) {
      const previousStep = workflowSteps[stepIndex - 1];
      return previousStep?.completed ?? false;
    }
    return false;
  };

  const handleStepChange = (stepIndex: number): void => {
    if (canProgressToStep(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const renderCurrentStep = (): React.ReactNode => {
    if (!projectData) return null;

    switch (currentStep) {
      case 0:
        return (
          <Sheet1Creation
            onNext={handleNextStep}
            error={errors.sheet1 ?? undefined}
          />
        );
      case 1:
        return (
          <Sheet2Creation
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            error={errors.sheet2 ?? undefined}
          />
        );
      case 2:
        return (
          <SheetPreview
            onFinalize={handleFinalizeProject}
            onPrevious={handlePreviousStep}
            loading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  if (!isHydrated) return null;

  if (!projectData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={48} className="mx-auto mb-4 animate-spin" />
          <p className="text-text-secondary">Loading project data...</p>
        </div>
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

          {/* Page Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-text-primary mb-2 text-2xl font-bold">
                Sheet Creation Workflow
              </h1>
              <p className="text-text-secondary">
                Set up Sheet 1 & Sheet 2 for project:{" "}
                {projectData.latestProjectVersion?.projectName}
              </p>
            </div>

            {/* <div className="mt-4 flex items-center space-x-3 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                iconName="Save"
                iconPosition="left"
                onClick={handleSaveDraft}
                loading={isLoading}
                disabled={isLoading}
              >
                Save Draft
              </Button>
            </div> */}
          </div>

          {/* Workflow Progress */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-text-primary text-lg font-semibold">
                Workflow Progress
              </h2>
              <span className="text-text-secondary text-sm">
                Step {currentStep + 1} of {workflowSteps.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    index === currentStep
                      ? "border-primary bg-primary/5"
                      : index < currentStep
                        ? "border-success bg-success/5"
                        : "border-border bg-surface"
                  } ${canProgressToStep(index) ? "hover:border-primary/50" : "cursor-not-allowed opacity-50"}`}
                  onClick={() =>
                    canProgressToStep(index) && handleStepChange(index)
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        index === currentStep
                          ? "bg-primary text-white"
                          : index < currentStep
                            ? "bg-success text-white"
                            : "bg-muted text-text-secondary"
                      }`}
                    >
                      {index < currentStep ? (
                        <Icon name="Check" size={16} />
                      ) : (
                        <Icon
                          name={step.icon as keyof typeof LucideIcons}
                          size={16}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-text-primary text-sm font-medium">
                        {step.label}
                      </h3>
                      <p className="text-text-secondary text-xs">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`absolute top-1/2 -right-2 h-0.5 w-4 ${
                        index < currentStep ? "bg-success" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="bg-surface border-border rounded-lg border p-6">
            {renderCurrentStep()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SheetCreationWorkflow;
