"use client";

import React, { useEffect } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";
import Button from "@/components/rocket/components/ui/Button";
import { useProjectStore } from "@/store/project.store";
import Header from "@/components/rocket/components/ui/Header";
import Sidebar from "@/components/rocket/components/ui/Sidebar";
import Breadcrumb from "@/components/rocket/components/ui/Breadcrumb";
import { ReportStatus, Role } from "@prisma/client";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { projectVersionSchema } from "@/validators/prisma-schmea.validator";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { cn } from "@/lib/utils";
import {
  Table,
  TableCell,
  TableBody,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table";

const ReportPreview = () => {
  const project = useProjectStore.getState().getProject();
  const router = useRouter();

  const formatDate = (date: string | Date): string => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleString();
  };

  // Calculate remaining days from target date to report generation date
  const calculateRemainingDays = (targetDate: string | Date | null | undefined): number => {
    if (!targetDate) return 0;
    const target = new Date(targetDate);
    const reportDate = new Date(); // Report generation date
    if (isNaN(target.getTime())) return 0;
    const diffTime = target.getTime() - reportDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Return 0 if target date is in the past
  };

  // Calculate per-day target (rounded to whole number)
  const calculatePerDayTarget = (balance: number, remainingDays: number): number => {
    if (remainingDays <= 0) return 0;
    return Math.round(balance / remainingDays);
  };

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

    if (session?.user?.customRole !== Role.PROJECT_MANAGER) {
      router.push("/dashboard");
      return;
    }
  }, [session, router, isPending]);

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

  const handleSubmitReport = async () => {
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
      yesterdayReportStatus: ReportStatus.PENDING,
      yesterdayReportCreatedAt: new Date(),
    });

    if (projectVersion) {
      useProjectStore.getState().setProject(projectVersion);
      router.push("/project-manager-daily-workflow");
    } else {
      toast.error("Failed to create project version");
    }
  };

  if (!project) {
    return (
      <div className="bg-surface flex h-full items-center justify-center">
        <div className="text-center">
          <Icon
            name="FileText"
            size={48}
            className="text-text-secondary mx-auto mb-4"
          />
          <h3 className="text-text-primary mb-2 text-lg font-medium">
            No Report Selected
          </h3>
          <p className="text-text-secondary">
            Select a report from the list given to preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-x-4">
      <Header />
      <Sidebar />

      <main className="bg-surface min-h-screen overflow-y-auto pt-24 pb-20 md:ml-60 md:pt-20 md:pb-8">
        <div className="p-6">
          <Breadcrumb />
          {/* Header */}
          <div className="border-border border-b p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-text-primary text-xl font-semibold">
                  {project.latestProjectVersion?.projectName}
                </h2>
                <p className="text-text-secondary text-sm">
                  Report Date: {formatDate(new Date())}
                </p>
                <p className="text-text-secondary text-sm">
                  Client Name:{" "}
                  {project.latestProjectVersion?.client?.clientName}
                </p>
                <p className="text-text-secondary text-sm">
                  Site Address:{" "}
                  {project.latestProjectVersion?.siteLocation.city}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Progress Details */}
            <div className="mb-6">
              <h3 className="text-text-primary mx-auto mb-3 flex w-fit items-center text-center text-lg font-medium">
                <Icon name="BarChart3" size={20} className="mr-2" />
                Daily Progress Report
              </h3>

              {/* Sheet 1 */}
              <div className="flex flex-col">
                <h2 className="text-text-primary text-lg font-medium">
                  Sheet 1
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Main Task</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Total Supplied</TableHead>
                      <TableHead>Total Installed Quantity of Units</TableHead>
                      <TableHead>Balance to Supply</TableHead>
                      <TableHead>Balance to Install</TableHead>
                      <TableHead>Supply Target Date</TableHead>
                      <TableHead>Installation Target Date</TableHead>
                      <TableHead>Remaining Days (Supply)</TableHead>
                      <TableHead>Remaining Days (Install)</TableHead>
                      <TableHead>Per Day Supply Target</TableHead>
                      <TableHead>Per Day Install Target</TableHead>
                      <TableHead>% Supplied in logarithmic quanity</TableHead>
                      <TableHead>% Installed in logarithmic quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.latestProjectVersion?.sheet1?.map(
                      (item, index) => {
                        const remainingDaysSupply = calculateRemainingDays(item.supplyTargetDate);
                        const remainingDaysInstall = calculateRemainingDays(item.installationTargetDate);
                        const perDaySupplyTarget = calculatePerDayTarget(item.yetToSupply, remainingDaysSupply);
                        const perDayInstallTarget = calculatePerDayTarget(item.yetToInstall, remainingDaysInstall);

                        return (
                          <TableRow key={index}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell className="text-center">
                              {item.unit}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.totalQuantity}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.totalSupplied}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.totalInstalled}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.yetToSupply}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.yetToInstall}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.supplyTargetDate
                                ? formatDate(item.supplyTargetDate).split(",")[0]
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.installationTargetDate
                                ? formatDate(item.installationTargetDate).split(",")[0]
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              {remainingDaysSupply > 0 ? remainingDaysSupply : "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              {remainingDaysInstall > 0 ? remainingDaysInstall : "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              {perDaySupplyTarget > 0 ? perDaySupplyTarget : "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              {perDayInstallTarget > 0 ? perDayInstallTarget : "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              {Math.min(item.percentSupplied, 100)}%
                            </TableCell>
                            <TableCell className="text-center">
                              {Math.min(item.percentInstalled, 100)}%
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Sheet 2 */}
              <div className="mt-8 flex flex-col">
                <h2 className="text-text-primary text-lg font-medium">
                  Sheet 2
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Main Task</TableHead>
                      <TableHead>Sub Task</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Total Supplied</TableHead>
                      <TableHead>Total Installed</TableHead>
                      <TableHead>Yesterday Installed</TableHead>
                      <TableHead>Yesterday Supplied</TableHead>
                      <TableHead>% Installed</TableHead>
                      <TableHead>% Supplied</TableHead>
                      {/* <TableHead>Connected To Sheet 1</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.latestProjectVersion?.sheet1?.flatMap((item) =>
                      item.sheet2.map((subItem) => (
                        <TableRow
                          key={`${item.itemName}-${subItem.subItemName}`}
                        >
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{subItem.subItemName}</TableCell>
                          <TableCell className="text-center">
                            {subItem.unit}
                          </TableCell>
                          <TableCell className="text-center">
                            {subItem.totalQuantity}
                          </TableCell>
                          <TableCell className="text-center">
                            {subItem.totalSupplied}
                          </TableCell>
                          <TableCell className="text-center">
                            {subItem.totalInstalled}
                          </TableCell>
                          <TableCell className="text-center">
                            {subItem.yesterdayProgressReport
                              ?.yesterdayInstalled ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {subItem.yesterdayProgressReport
                              ?.yesterdaySupplied ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {Math.min(subItem.percentInstalled, 100)}%
                          </TableCell>
                          <TableCell className="text-center">
                            {Math.min(subItem.percentSupplied, 100)}%
                          </TableCell>
                          {/* <TableCell className="text-center">
                            {subItem.connectWithSheet1Item ? "Yes" : "No"}
                          </TableCell> */}
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Progress Photos & Description */}
              <div className="mt-8 flex flex-col">
                <p className="text-text-primary mt-8 text-center font-medium">
                  Progress Photos & Description
                </p>
                {project.latestProjectVersion?.sheet1?.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div key={index} className="group relative mt-4">
                      <p className="text-text-primary mb-4 font-medium">
                        {index + 1}. {item.itemName}
                      </p>
                      <div className="flex w-full flex-wrap gap-4 overflow-hidden">
                        {item.yesterdayProgressPhotos?.length === 0 ? (
                          <div className="flex items-center justify-center">
                            <p className="text-text-secondary text-center text-lg font-medium">
                              No progress photos available
                            </p>
                          </div>
                        ) : (
                          item.yesterdayProgressPhotos?.map(
                            (progressPhoto, index) => {
                              return (
                                <div
                                  key={index}
                                  className="flex w-[48%] flex-col justify-between gap-2 overflow-hidden rounded-lg border border-neutral-500 p-4"
                                >
                                  {progressPhoto.photos.length > 0 ? (
                                    progressPhoto.photos.map((photo, index) => (
                                      <div
                                        key={index}
                                        className="overflow-hidden rounded-lg"
                                      >
                                        <Image
                                          key={photo?.s3Key}
                                          src={photo?.url ?? ""}
                                          alt={photo?.fileName}
                                          className="size-60 object-cover"
                                        />
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-text-secondary mt-2 line-clamp-2 text-xl">
                                      No photos
                                    </p>
                                  )}
                                  <p className="text-text-secondary mt-2 line-clamp-2 text-xl">
                                    Progress Description :{" "}
                                    {progressPhoto.description ??
                                      "No description"}
                                  </p>
                                </div>
                              );
                            },
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Client Blockages */}
              <div className="mt-16 flex flex-col">
                <h3 className="text-text-primary flex items-center justify-center text-center text-lg font-medium">
                  <Icon
                    name="AlertTriangle"
                    size={20}
                    className="text-warning mr-2"
                  />
                  Client-Side Blockages & Issues
                </h3>
                {project.latestProjectVersion?.sheet1?.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="mt-6">
                      <p className="text-text-primary mb-4 font-medium">
                        {index + 1}. {item.itemName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.blockages?.length === 0 ? (
                          <div className="flex items-center justify-center">
                            <p className="text-text-secondary text-center text-lg font-medium">
                              No client-side blockages available
                            </p>
                          </div>
                        ) : (
                          item.blockages?.map((blockage, index) => (
                            <div
                              key={index}
                              className={cn(
                                blockage?.type === "CLIENT"
                                  ? "bg-warning/5 border-warning/20 w-[48%] rounded-lg border p-4"
                                  : "hidden",
                              )}
                            >
                              <div className="flex flex-col justify-between">
                                {blockage.type === "CLIENT" && (
                                  <>
                                    <div className="mb-2 flex items-center justify-between">
                                      <h4 className="text-text-primary font-medium">
                                        {blockage?.type === "CLIENT"
                                          ? "Client"
                                          : "Internal"}
                                      </h4>
                                      <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                          blockage?.type === "CLIENT"
                                            ? "bg-warning/10 text-warning"
                                            : "bg-error/10 text-error"
                                        }`}
                                      >
                                        {blockage?.type === "CLIENT"
                                          ? "Client"
                                          : "Internal"}
                                      </span>
                                    </div>
                                    <div className="flex flex-col justify-between">
                                      <div className="flex flex-col gap-1">
                                        <p className="text-text-primary text-sm">
                                          Blockage Description:{" "}
                                          {blockage?.description}
                                        </p>
                                        <p className="text-text-primary text-sm">
                                          Weather Report:{" "}
                                          {blockage?.weatherReport}
                                        </p>
                                        <p className="text-text-primary text-sm">
                                          Reported on{" "}
                                          {formatDate(
                                            blockage?.blockageStartTime,
                                          )}
                                        </p>
                                        <p className="text-text-primary text-sm">
                                          Closed on{" "}
                                          {blockage?.blockageEndTime
                                            ? formatDate(
                                                blockage?.blockageEndTime,
                                              )
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <div className="flex flex-col gap-2 overflow-hidden">
                                        {blockage?.blockagePhotos
                                          .slice(0, 1)
                                          .map((photo, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center gap-2 overflow-hidden rounded-lg"
                                            >
                                              <Image
                                                src={photo.url}
                                                alt={photo.fileName}
                                                className="mt-12 size-60 object-contain"
                                              />
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Internal Blockages */}
              <div className="mt-16 flex flex-col">
                <h3 className="text-text-primary flex items-center justify-center text-center text-lg font-medium">
                  <Icon
                    name="AlertTriangle"
                    size={20}
                    className="text-warning mr-2"
                  />
                  Internal Blockages & Issues
                </h3>
                {project.latestProjectVersion?.sheet1?.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="mt-6">
                      <p className="text-text-primary mb-4 font-medium">
                        {index + 1}. {item.itemName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.blockages?.length === 0 ? (
                          <div className="flex items-center justify-center">
                            <p className="text-text-secondary text-center text-lg font-medium">
                              No internal blockages available
                            </p>
                          </div>
                        ) : (
                          item.blockages?.map((blockage, index) => (
                            <div
                              key={index}
                              className={cn(
                                blockage?.type === "INTERNAL"
                                  ? "bg-warning/5 border-warning/20 w-[48%] rounded-lg border p-4"
                                  : "hidden",
                              )}
                            >
                              <div className="flex flex-col justify-between">
                                {blockage.type === "INTERNAL" && (
                                  <>
                                    <div className="mb-2 flex items-center justify-between">
                                      <h4 className="text-text-primary font-medium">
                                        {blockage?.type === "INTERNAL"
                                          ? "Internal"
                                          : "Client"}
                                      </h4>
                                      <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                          blockage?.type === "INTERNAL"
                                            ? "bg-error/10 text-error"
                                            : "bg-warning/10 text-warning"
                                        }`}
                                      >
                                        {blockage?.type === "INTERNAL"
                                          ? "Internal"
                                          : "Client"}
                                      </span>
                                    </div>
                                    <div className="flex flex-col justify-between">
                                      <div className="flex flex-col gap-1">
                                        <p className="text-text-primary text-sm">
                                          Blockage Description:{" "}
                                          {blockage?.description}
                                        </p>
                                        <p className="text-text-primary text-sm">
                                          Weather Report:{" "}
                                          {blockage?.weatherReport}
                                        </p>
                                        <p className="text-text-primary text-sm">
                                          Reported on{" "}
                                          {formatDate(
                                            blockage?.blockageStartTime,
                                          )}
                                        </p>
                                        <p className="text-text-primary text-sm">
                                          Closed on{" "}
                                          {blockage?.blockageEndTime
                                            ? formatDate(
                                                blockage?.blockageEndTime,
                                              )
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <div className="flex flex-col gap-2 overflow-hidden">
                                        {blockage?.blockagePhotos
                                          .slice(0, 1)
                                          .map((photo, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center gap-2 overflow-hidden rounded-lg"
                                            >
                                              <Image
                                                src={photo.url}
                                                alt={photo.fileName}
                                                className="mt-12 size-60 object-contain"
                                              />
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end p-4">
            <Button
              onClick={() => handleSubmitReport()}
              className="bg-primary text-center text-lg font-medium text-white"
            >
              Submit Report
            </Button>
          </div>
        </div>

        <div className="border-border border-t p-4">
          <p className="text-text-secondary text-center text-sm">
            Report generated from daily workflow • {formatDate(new Date())}
          </p>
        </div>
      </main>
    </div>
  );
};

export default ReportPreview;
