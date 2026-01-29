import { ProjectStatus, ReportStatus } from "@prisma/client";
import { PriorityLevel } from "@prisma/client";
import { z } from "zod";

export const BlockageSeverity = ["LOW", "MEDIUM", "HIGH"] as const;
export type BlockageSeverity = (typeof BlockageSeverity)[number];

export const BlockageStatus = ["OPEN", "CLOSED"] as const;
export type BlockageStatus = (typeof BlockageStatus)[number];

export const BlockageType = ["CLIENT", "INTERNAL"] as const;
export type BlockageType = (typeof BlockageType)[number];

export const projectVersionSchema = z
  .object({
    // sheet 1 data
    projectId: z.number().optional(),
    projectName: z.string().min(2, "Project name is required. Enter at least 2 characters (e.g. Prestige Tech Park Phase 2)."),
    projectType: z.string().min(2, "Project type is required. Enter the type of project (e.g. Commercial, Residential)."),
    projectCategory: z.string().min(2, "Project category is required. Enter the category (e.g. Glass Installation, Facade Work)."),
    priorityLevel: z.enum(PriorityLevel, { message: "Priority level is required. Select Low, Medium, or High priority." }),
    projectStatus: z.enum(ProjectStatus, { message: "Project status is required. Select the current status of the project." }),
    projectDescription: z.string().min(2, "Project description is required. Enter a brief description of the project (at least 2 characters)."),
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
      address: z.string().min(2, "Site address is required. Enter the complete site address (at least 2 characters)."),
      city: z.string().min(2, "City is required. Enter the city name (e.g. Hyderabad, Bangalore)."),
      state: z.string().min(2, "State is required. Enter the state name (e.g. Telangana, Karnataka)."),
      pinCode: z.string().min(2, "PIN code is required. Enter the 6-digit PIN code (e.g. 500001)."),
      country: z.string().min(2, "Country is required. Enter the country name (e.g. India)."),
      latitude: z.string(),
      longitude: z.string(),
    }),
    client: z.object({
      clientName: z.string().min(2, "Client name is required. Enter the client's company or individual name (at least 2 characters)."),
      clientType: z.string().min(2, "Client type is required. Enter the type (e.g. Corporate, Individual)."),
      clientContactPersonName: z.string().min(2, "Contact person name is required. Enter the name of the primary contact (at least 2 characters)."),
      clientContactPersonPhoneNumber: z.string().min(2, "Phone number is required. Enter the contact person's phone number (include country code if outside India)."),
      clientEmail: z.string().min(2, "Client email is required. Enter ONE email address only (e.g. client@company.com)."),
      clientCCEmails: z.string().min(2, "Client CC emails are required. Enter comma-separated email addresses (e.g. a@x.com, b@x.com)."),
      gstNumber: z.string(),
      billingAddress: z.string(),
      internalEmail: z.string().min(2, "Internal team email is required. Enter ONE email address only (e.g. team@company.com)."),
      internalCCEmails: z.string().min(2, "Internal CC emails are required. Enter comma-separated email addresses (e.g. a@x.com, b@x.com)."),
    }),
    projectVersionCreatedByUserId: z.string().optional(),
    assignedProjectManagerId: z.string(),
    // Sheet 2 data
    sheet1: z
      .array(
        z.object({
          itemName: z.string().min(2, "Item name is required. Enter the name of the item (e.g. UCW, Glass Panels) - at least 2 characters."),
          unit: z.string().min(2, "Unit of measurement (UOM) is required. Enter the unit (e.g. sqm, units, pieces) - at least 2 characters."),
          supplyTargetDate: z.coerce.date().optional(),
          installationTargetDate: z.coerce.date().optional(),
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
                description: z.string().min(2, "Blockage description is required. Explain what the blockage is and how it affects the project (at least 2 characters)."),
                weatherReport: z.string().min(2, "Weather report is required. Describe the weather conditions (e.g. clear, rain, wind speed) - at least 2 characters."),
                manPower: z.number(),
                blockageStartTime: z.coerce.date(),
                blockageEndTime: z.coerce.date().optional(),
                closureRemarks: z.string().optional(),
                closureDate: z.coerce.date().optional(),
                closedByUserId: z.string().optional(),
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
              subItemName: z.string().min(2, "Sub-task name is required. Enter the name of this sub-task (e.g. North Face Installation) - at least 2 characters."),
              unit: z.string().min(2, "Unit is required. Enter the unit of measurement (e.g. sqm, units, pieces) - at least 2 characters."),
              totalQuantity: z.number(),
              totalSupplied: z.number(),
              totalInstalled: z.number(),
              percentSupplied: z.number(),
              percentInstalled: z.number(),
              connectWithSheet1Item: z.boolean(),
              supplyTargetDate: z.coerce.date().optional(),
              installationTargetDate: z.coerce.date().optional(),
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
        "Project End Date must be on or after the Start Date. Please select an end date that is the same as or later than the start date.",
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
