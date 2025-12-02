import { ProjectStatus, ReportStatus } from "@prisma/client";
import { PriorityLevel } from "@prisma/client";
import { z } from "zod";

export const BlockageSeverity = ["LOW", "MEDIUM", "HIGH"] as const;
export type BlockageSeverity = (typeof BlockageSeverity)[number];

export const BlockageStatus = ["PENDING", "RESOLVED", "IGNORED"] as const;
export type BlockageStatus = (typeof BlockageStatus)[number];

export const BlockageType = ["CLIENT", "INTERNAL"] as const;
export type BlockageType = (typeof BlockageType)[number];

export const projectVersionSchema = z
  .object({
    // sheet 1 data
    projectId: z.number().optional(),
    projectName: z.string().min(2),
    projectType: z.string().min(2),
    projectCategory: z.string().min(2),
    priorityLevel: z.enum(PriorityLevel),
    projectStatus: z.enum(ProjectStatus),
    projectDescription: z.string().min(2),
    estimatedBudget: z.coerce.number(),
    floorArea: z.coerce.number(),
    msTeamsLink: z.string(),
    projectDocuments: z.array(
      z.object({
        s3Key: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        url: z.string(),
      }),
    ),
    projectStartDate: z.coerce.date(),
    estimatedEndDate: z.coerce.date(),
    estimatedWorkingDays: z.coerce.number(),
    bufferDays: z.coerce.number(),
    specialInstructions: z.string(),
    projectVersionCreatedAt: z.coerce.date().optional(),
    siteLocation: z.object({
      address: z.string().min(2),
      city: z.string().min(2),
      state: z.string().min(2),
      pinCode: z.string().min(2),
      country: z.string().min(2),
      latitude: z.string(),
      longitude: z.string(),
    }),
    client: z.object({
      clientName: z.string().min(2),
      clientType: z.string().min(2),
      clientContactPersonName: z.string().min(2),
      clientContactPersonPhoneNumber: z.string().min(2),
      clientEmail: z.string().min(2),
      clientCCEmails: z.string().min(2),
      gstNumber: z.string(),
      billingAddress: z.string(),
      internalEmail: z.string().min(2),
      internalCCEmails: z.string().min(2),
    }),
    projectVersionCreatedByUserId: z.string().optional(),
    assignedProjectManagerId: z.string(),
    // Sheet 2 data
    sheet1: z
      .array(
        z.object({
          itemName: z.string().min(2),
          unit: z.string().min(2),
          actualStartDate: z.coerce.date().optional(),
          actualEndDate: z.coerce.date().optional(),
          plannedStartDate: z.coerce.date().optional(),
          plannedEndDate: z.coerce.date().optional(),
          revisedStartDate: z.coerce.date().optional(),
          revisedEndDate: z.coerce.date().optional(),
          totalQuantity: z.number(),
          totalSupplied: z.number(),
          yetToSupply: z.number(),
          totalInstalled: z.number(),
          yetToInstall: z.number(),
          percentSupplied: z.number(),
          percentInstalled: z.number(),
          yesterdayProgressPhotos: z
            .array(
              z.object({
                photos: z.array(
                  z.object({
                    s3Key: z.string(),
                    fileName: z.string(),
                    fileType: z.string(),
                    url: z.string(),
                  }),
                ),
                description: z.string(),
              }),
            )
            .optional(),
          blockages: z
            .array(
              z.object({
                type: z.enum(BlockageType),
                category: z.string(),
                severity: z.enum(BlockageSeverity),
                status: z.enum(BlockageStatus),
                description: z.string().min(2),
                weatherReport: z.string().min(2),
                manPower: z.number(),
                blockageStartTime: z.coerce.date(),
                blockageEndTime: z.coerce.date().optional(),
                // openDate: z.coerce.date(),
                // estimatedCloseDate: z.coerce.date(),
                blockagePhotos: z.array(
                  z.object({
                    s3Key: z.string(),
                    fileName: z.string(),
                    fileType: z.string(),
                    url: z.string(),
                  }),
                ),
              }),
            )
            .optional(),
          sheet2: z.array(
            z.object({
              subItemName: z.string().min(2),
              unit: z.string().min(2),
              totalQuantity: z.number(),
              totalSupplied: z.number(),
              totalInstalled: z.number(),
              percentSupplied: z.number(),
              percentInstalled: z.number(),
              connectWithSheet1Item: z.boolean(),
              yesterdayProgressReport: z
                .object({
                  yesterdaySupplied: z.coerce.number(),
                  yesterdayInstalled: z.coerce.number(),
                })
                .optional(),
            }),
          ),
        }),
      )
      .optional(),
    yesterdayReportStatus: z.enum(ReportStatus).optional(),
    yesterdayReportCreatedAt: z.coerce.date().optional(),
    comments: z
      .array(
        z.object({
          comment: z.string(),
          createdAt: z.coerce.date(),
          author: z.string(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.estimatedEndDate) return true;
      const start = new Date(data.projectStartDate).setHours(0, 0, 0, 0);
      const end = new Date(data.estimatedEndDate).setHours(0, 0, 0, 0);
      return end >= start;
    },
    {
      message:
        "Project End Date must be after Start Date or Same as Start Date",
      path: ["estimatedEndDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.sheet1) return true;

      return data.sheet1.every((item) => {
        const itemTotal = item.totalQuantity;

        // Sheet1-level totals must never exceed totalQuantity
        if (
          item.totalSupplied > itemTotal ||
          item.totalInstalled > itemTotal
        ) {
          return false;
        }

        // Sheet2-level totals (and yesterday + today) must never exceed totalQuantity
        return item.sheet2.every((sub) => {
          const subTotal = sub.totalQuantity;

          if (
            sub.totalSupplied > subTotal ||
            sub.totalInstalled > subTotal
          ) {
            return false;
          }

          if (!sub.yesterdayProgressReport) return true;

          const nextSupplied =
            sub.totalSupplied + sub.yesterdayProgressReport.yesterdaySupplied;
          const nextInstalled =
            sub.totalInstalled + sub.yesterdayProgressReport.yesterdayInstalled;

          return nextSupplied <= subTotal && nextInstalled <= subTotal;
        });
      });
    },
    {
      message:
        "Supplied/installed quantities (including yesterday's entries) cannot exceed total quantity.",
      path: ["sheet1"],
    },
  );

export const projectSchema = z.object({
  createdById: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  latestProjectVersion: projectVersionSchema,
});
