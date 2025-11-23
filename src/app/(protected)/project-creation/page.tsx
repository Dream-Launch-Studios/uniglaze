"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import { Suspense } from "react";

// Import all form components
import ClientInformationForm from "./components/ClientInformationForm";
import ProjectDetailsForm from "./components/ProjectDetailsForm";
import SiteLocationForm from "./components/SiteLocationForm";
import TimelineForm from "./components/TimelineForm";
import DocumentUpload from "./components/DocumentUpload";
import {
  type projectSchema,
  projectVersionSchema,
} from "@/validators/prisma-schmea.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { useProjectStore } from "@/store/project.store";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { Role } from "@prisma/client";

const formSchema = projectVersionSchema
  .omit({
    projectId: true,
    projectVersionCreatedAt: true,
    projectVersionCreatedByUserId: true,
    sheet1: true,
    yesterdayReportStatus: true,
  })
  .extend({
    projectDocuments: z.array(z.instanceof(File)),
    estimatedBudget: z.coerce
      .number()
      .nullable()
      .transform((val) => val ?? 0),
    floorArea: z.coerce
      .number()
      .nullable()
      .transform((val) => val ?? 0),
    estimatedWorkingDays: z.coerce
      .number()
      .nullable()
      .transform((val) => val ?? 0),
    bufferDays: z.coerce
      .number()
      .nullable()
      .transform((val) => val ?? 0),
  });

type FormData = z.infer<typeof formSchema>;

const ProjectCreation: React.FC = () => {
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setProject = useProjectStore((state) => state.setProject);
  const getProject = useProjectStore((state) => state.getProject);
  const project = getProject();

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

    if (
      session?.user?.customRole !== Role.MANAGING_DIRECTOR &&
      session?.user?.customRole !== Role.HEAD_OF_PLANNING
    ) {
      router.push("/dashboard");
      return;
    }
  }, [session, router, isPending]);

  const searchParams = useSearchParams();
  const edit = searchParams.get("edit");

  const { mutateAsync: getSignedUrl } = api.AWSs3.getSignedUrl.useMutation({
    onSuccess: (data) => {
      toast.success("Signed URL fetched successfully");
      return data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutateAsync: createProject } = api.project.createProject.useMutation({
    onSuccess: (data) => {
      toast.success("Project created successfully");
      setProjectId(data?.latestProjectVersion.projectId ?? -1);
      setIsLoading(false);
      router.push("/sheet-creation-workflow");
      return data;
    },
    onError: (error) => {
      toast.error(error.message);
      setIsLoading(false);
    },
  });

  const { mutateAsync: createProjectVersion } =
    api.project.createProjectVersion.useMutation({
      onSuccess: (data) => {
        toast.success("Project updated successfully");
        setIsLoading(false);
        router.push("/sheet-creation-workflow");
        return data;
      },
      onError: (error) => {
        toast.error(error.message);
        setIsLoading(false);
      },
    });

  // Helper function to convert URL to File
  const urlToFile = async (
    url: string,
    fileName: string,
    fileType: string,
  ): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: fileType });
  };

  // Convert URLs to Files before setting default values
  const convertProjectDocuments = async (
    urls: {
      s3Key: string;
      fileName: string;
      fileType: string;
      url?: string;
    }[],
  ): Promise<File[]> => {
    if (!urls.length) return [];
    const filePromises = urls.map((url) =>
      urlToFile(url.url ?? "", url.fileName, url.fileType),
    );
    return Promise.all(filePromises);
  };

  useEffect(() => {
    const loadFiles = async () => {
      const awsS3urls = project.latestProjectVersion?.projectDocuments ?? [];
      const files = await convertProjectDocuments(awsS3urls);
      if (edit) {
        form.setValue("projectDocuments", files);
      }
    };

    if (edit) {
      loadFiles();
    }
  }, [project, edit]);

  // 1. Define your form.
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    defaultValues: {
      projectName: edit
        ? (project.latestProjectVersion?.projectName ?? "")
        : "",
      projectType: edit
        ? (project.latestProjectVersion?.projectType ?? "")
        : "",
      projectCategory: edit
        ? (project.latestProjectVersion?.projectCategory ?? "")
        : "",
      priorityLevel: edit
        ? (project.latestProjectVersion?.priorityLevel ?? "HIGH_PRIORITY")
        : "HIGH_PRIORITY",
      projectStatus: edit
        ? (project.latestProjectVersion?.projectStatus ?? "ACTIVE")
        : "ACTIVE",
      projectDescription: edit
        ? (project.latestProjectVersion?.projectDescription ?? "")
        : "",
      estimatedBudget: edit
        ? (project.latestProjectVersion?.estimatedBudget ?? undefined)
        : undefined,
      floorArea: edit
        ? (project.latestProjectVersion?.floorArea ?? undefined)
        : undefined,
      msTeamsLink: edit
        ? (project.latestProjectVersion?.msTeamsLink ?? "")
        : "",
      projectDocuments: [],
      projectStartDate: edit
        ? (project.latestProjectVersion?.projectStartDate ?? new Date())
        : new Date(),
      estimatedEndDate: edit
        ? (project.latestProjectVersion?.estimatedEndDate ??
          new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30))
        : new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
      estimatedWorkingDays: edit
        ? (project.latestProjectVersion?.estimatedWorkingDays ?? undefined)
        : undefined,
      bufferDays: edit
        ? (project.latestProjectVersion?.bufferDays ?? undefined)
        : undefined,
      specialInstructions: edit
        ? (project.latestProjectVersion?.specialInstructions ?? "")
        : "",
      assignedProjectManagerId: edit
        ? (project.latestProjectVersion?.assignedProjectManagerId ?? "")
        : "",
      siteLocation: {
        address: edit
          ? (project.latestProjectVersion?.siteLocation.address ?? "")
          : "",
        city: edit
          ? (project.latestProjectVersion?.siteLocation.city ?? "")
          : "",
        state: edit
          ? (project.latestProjectVersion?.siteLocation.state ?? "")
          : "",
        pinCode: edit
          ? (project.latestProjectVersion?.siteLocation.pinCode ?? "")
          : "",
        country: edit
          ? (project.latestProjectVersion?.siteLocation.country ?? "")
          : "",
        latitude: edit
          ? (project.latestProjectVersion?.siteLocation.latitude ?? "")
          : "",
        longitude: edit
          ? (project.latestProjectVersion?.siteLocation.longitude ?? "")
          : "",
      },
      client: {
        clientName: edit
          ? (project.latestProjectVersion?.client.clientName ?? "")
          : "",
        clientType: edit
          ? (project.latestProjectVersion?.client.clientType ?? "")
          : "",
        clientContactPersonName: edit
          ? (project.latestProjectVersion?.client.clientContactPersonName ?? "")
          : "",
        clientContactPersonPhoneNumber: edit
          ? (project.latestProjectVersion?.client
              .clientContactPersonPhoneNumber ?? "")
          : "",
        clientEmail: edit
          ? (project.latestProjectVersion?.client.clientEmail ?? "")
          : "",
        clientCCEmails: edit
          ? (project.latestProjectVersion?.client.clientCCEmails ?? "")
          : "",
        gstNumber: edit
          ? (project.latestProjectVersion?.client.gstNumber ?? "")
          : "",
        billingAddress: edit
          ? (project.latestProjectVersion?.client.billingAddress ?? "")
          : "",
        internalEmail: edit
          ? (project.latestProjectVersion?.client.internalEmail ?? "")
          : "",
        internalCCEmails: edit
          ? (project.latestProjectVersion?.client.internalCCEmails ?? "")
          : "",
      },
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: FormData) {
    try {
      console.log("############################################");
      console.log("values", values);
      console.log("############################################");
      setIsLoading(true);
      const validated = formSchema.safeParse(values);
      if (!validated.success) {
        toast.error(validated.error.message);
        setIsLoading(false);
        return;
      }

      // save the files to AWS S3
      const result = await getSignedUrl({
        files: validated.data.projectDocuments.map((file) => ({
          filename: file.name,
          contentType: file.type,
          folderName: "project-documents",
        })),
      });

      await Promise.all(
        validated.data.projectDocuments.map((file, i) =>
          fetch(result[i]!.uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          }),
        ),
      );

      if (edit) {
        // update project
        const updatedProject = await createProjectVersion({
          ...validated.data,
          projectDocuments: result.map((file, index) => ({
            s3Key: file.s3Key,
            fileName: validated.data.projectDocuments[index]?.name ?? "",
            fileType: validated.data.projectDocuments[index]?.type ?? "",
            url: "",
          })),
          sheet1: project.latestProjectVersion?.sheet1 ?? [],
          // blockages: project.latestProjectVersion?.blockages,
          projectId: project.latestProjectVersion?.projectId,
          yesterdayReportStatus:
            project.latestProjectVersion?.yesterdayReportStatus,
        });

        if (!updatedProject) {
          toast.error("Failed to update project");
          setIsLoading(false);
          return;
        }

        setProject(
          updatedProject as unknown as Partial<z.infer<typeof projectSchema>>,
        );
      } else {
        // create project
        const newProject = await createProject({
          ...validated.data,
          projectDocuments: result.map((file, index) => ({
            s3Key: file.s3Key,
            fileName: validated.data.projectDocuments[index]?.name ?? "",
            fileType: validated.data.projectDocuments[index]?.type ?? "",
            url: "",
          })),
        });

        if (!newProject) {
          toast.error("Failed to create project");
          setIsLoading(false);
          return;
        }

        setProject(newProject);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setIsLoading(false);
    }
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);

  // const handleSaveDraft = async (): Promise<void> => {
  //   setIsLoading(true);
  //   void form.handleSubmit(onSubmit)();

  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsDraftSaved(true);
  //     setIsLoading(false);

  //     // Show success message
  //     setTimeout(() => setIsDraftSaved(false), 3000);
  //   }, 1000);
  // };

  if (
    (!session?.user && isPending) ||
    (session?.user?.customRole !== Role.MANAGING_DIRECTOR &&
      session?.user?.customRole !== Role.HEAD_OF_PLANNING)
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

      <main className="pt-16 pb-20 md:ml-60 md:pb-8">
        <div className="p-6">
          <Breadcrumb />

          {/* Page Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-text-primary mb-2 text-2xl font-bold">
                Create New Project
              </h1>
              <p className="text-text-secondary">
                Set up a new construction project with comprehensive details and
                team assignment
              </p>
            </div>

            <div className="mt-4 flex items-center space-x-3 md:mt-0">
              {isDraftSaved && (
                <div className="text-success flex items-center space-x-2 text-sm">
                  <Icon name="Check" size={16} />
                  <span>Draft saved</span>
                </div>
              )}
              {/* 
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
              </Button> */}
            </div>
          </div>

          {/* Main Content Grid */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* {Object.keys(form.formState.errors).length > 0 && (
                <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
              )} */}
              <div className="mx-auto max-w-4xl">
                <div className="space-y-6">
                  <ClientInformationForm form={form} />
                  <ProjectDetailsForm form={form} />
                  <SiteLocationForm form={form} />
                  <TimelineForm form={form} />
                  <DocumentUpload form={form} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-surface border-border mt-8 flex flex-col items-center justify-between space-y-4 rounded-lg border p-4 md:flex-row md:space-y-0">
                {edit ? (
                  <div className="ml-auto flex items-center space-x-3">
                    <Button
                      type="submit"
                      variant="default"
                      iconName="Plus"
                      iconPosition="left"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating Project..." : "Update Project"}
                    </Button>
                  </div>
                ) : (
                  <div className="ml-auto flex items-center space-x-3">
                    {/* <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/project-management-dashboard")}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button> */}

                    <Button
                      type="submit"
                      variant="default"
                      iconName="Plus"
                      iconPosition="left"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Project..." : "Create Project"}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default function ProjectCreationWithSuspense() {
  return (
    <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin" />}>
      <ProjectCreation />
    </Suspense>
  );
}
