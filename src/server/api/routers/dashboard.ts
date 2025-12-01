import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { projectVersionSchema } from "@/validators/prisma-schmea.validator";
import { type ProjectStatus, Role, type ReportStatus } from "@prisma/client";
import type z from "zod";

type Sheet1Copy = NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>;

export const dashboardRouter = createTRPCRouter({
  projectMangersProjectProgressNowAnd30DaysBack: protectedProcedure.query(
    async ({ ctx }) => {
      const projectManagers = await ctx.db.user.findMany({
        where: { customRole: Role.PROJECT_MANAGER },
        select: { id: true, name: true },
      });

      const results = await Promise.all(
        projectManagers.map(async (pm) => {
          const projects = await ctx.db.project.findMany({
            include: {
              projectVersions: {
                where: {
                  assignedProjectManagerId: pm.id,
                },
                orderBy: { id: "desc" },
                take: 1,
              },
            },
          });

          const projectsWithLatestVersion = projects
            .filter((project) => project.projectVersions.length > 0)
            .map((project) => ({
              createdById: project.createdById,
              latestProjectVersion: {
                ...project.projectVersions[0],
                sheet1: project?.projectVersions[0]?.sheet1,
              },
            }));

          const currentMonthAvgInstallationProgress =
            projectsWithLatestVersion.reduce(
              (acc, project) =>
                acc +
                (Array.isArray(project.latestProjectVersion.sheet1)
                  ? (
                      project.latestProjectVersion
                        .sheet1 as unknown as Sheet1Copy
                    ).reduce(
                      (acc, item) => acc + (item.percentInstalled ?? 0),
                      0,
                    ) / project.latestProjectVersion.sheet1.length
                  : 0),
              0,
            ) / projectsWithLatestVersion.length;

          const numberOfReportsSubmitted = await ctx.db.projectVersion.count({
            where: {
              assignedProjectManagerId: pm.id,
              sheet1: { has: { dailyReport: { isEmpty: false } } },
            },
          });

          return {
            projectManagerName: pm.name,
            currentMonthAvgInstallationProgress,
            numOfProjects: projects.filter(
              (project) => project.projectVersions.length > 0,
            ).length,
            numberOfReportsSubmitted,
          };
        }),
      );

      return results;
    },
  ),

  recentReportsAndBlockagesListOfProjectsOfManager: protectedProcedure.query(
    async ({ ctx }) => {
      const now = new Date();
      const sevenDaysBackDate = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      );

      const results = (await ctx.db.project.findMany({
        select: {
          projectVersions: {
            where: {
              sheet1: { has: { blockages: { isEmpty: false } } },
              projectVersionCreatedAt: {
                gte: sevenDaysBackDate,
              },
              assignedProjectManagerId: ctx.session.user.id,
            },
            select: {
              yesterdayReportStatus: true,
              yesterdayReportCreatedAt: true,
              projectName: true,
              sheet1: true,
              assignedProjectManager: { select: { name: true } },
            },
            orderBy: { id: "desc" },
            take: 1,
          },
        },
      })) as unknown as {
        projectVersions: {
          yesterdayReportStatus: ReportStatus;
          yesterdayReportCreatedAt: Date;
          projectName: string;
          sheet1: NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>;
          assignedProjectManager: { name: string };
        }[];
      }[];

      if (results.length === 0) {
        return {
          recentBlockagesInProjects: [],
          recentDailyReportsInProjects: [],
          projectDeadlineAlerts: [],
        };
      }

      const projectsWithTheirLatestVersion = results.map((project) => ({
        projectName: project.projectVersions[0]?.projectName,
        yesterdayReportStatus:
          project.projectVersions[0]?.yesterdayReportStatus,
        yesterdayReportCreatedAt:
          project.projectVersions[0]?.yesterdayReportCreatedAt,
        sheet1: project.projectVersions[0]?.sheet1,
        assignedProjectManager:
          project.projectVersions[0]?.assignedProjectManager,
      })) as unknown as {
        projectName: string;
        yesterdayReportStatus: ReportStatus;
        yesterdayReportCreatedAt: Date;
        sheet1: NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>;
        assignedProjectManager: { name: string };
      }[];

      const recentBlockagesInProjects = projectsWithTheirLatestVersion.map(
        (pv) => ({
          projectName: pv.projectName,
          blockages:
            pv.sheet1?.flatMap(
              (item) =>
                item.blockages?.map((blockage) =>
                  blockage
                    ? {
                        status: blockage.status,
                        description: blockage.description,
                        numberOfPhotos: blockage.blockagePhotos?.length ?? 0,
                        openDate: blockage.blockageStartTime,
                      }
                    : null,
                ) ?? [],
            ) ?? [],
          assignedProjectManager: pv.assignedProjectManager,
        }),
      );

      const recentDailyReportsInProjects = projectsWithTheirLatestVersion.map(
        (pv) => ({
          projectName: pv.projectName,
          assignedProjectManager: pv.assignedProjectManager,
          dailyReports:
            pv.sheet1?.flatMap(
              (item) =>
                item?.yesterdayProgressPhotos
                  ?.map((report) =>
                    report
                      ? {
                          status: pv.yesterdayReportStatus,
                          description: report.description,
                          numberOfPhotos: report.photos?.length ?? 0,
                          dailyReportCreatedAt: pv.yesterdayReportCreatedAt,
                        }
                      : null,
                  )
                  .filter(Boolean) ?? [],
            ) ?? [],
        }),
      );

      const results2 = await ctx.db.project.findMany({
        select: {
          projectVersions: {
            where: {
              estimatedEndDate: {
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
              assignedProjectManagerId: ctx.session.user.id,
            },
            select: {
              id: true,
              projectName: true,
              projectDescription: true,
              estimatedEndDate: true,
              projectStatus: true,
              assignedProjectManager: {
                select: { name: true, email: true },
              },
            },
            orderBy: { id: "desc" },
            take: 1,
          },
        },
      });

      const projectDeadlineAlerts = results2.map((project) => ({
        id: project?.projectVersions[0]?.id,
        projectName: project?.projectVersions[0]?.projectName,
        projectDescription: project?.projectVersions[0]?.projectDescription,
        estimatedEndDate: project?.projectVersions[0]?.estimatedEndDate,
        projectStatus: project?.projectVersions[0]?.projectStatus,
        assignedProjectManager:
          project?.projectVersions[0]?.assignedProjectManager,
      })) as unknown as {
        id: number;
        projectName: string;
        projectDescription: string;
        estimatedEndDate: Date;
        projectStatus: ProjectStatus;
        assignedProjectManager: { name: string; email: string };
      }[];

      return {
        recentBlockagesInProjects: recentBlockagesInProjects.slice(0, 3),
        recentDailyReportsInProjects: recentDailyReportsInProjects.slice(0, 3),
        projectDeadlineAlerts: projectDeadlineAlerts.slice(0, 3),
      };
    },
  ),

  recentReportsAndBlockagesList: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const thirtyDaysBackDate = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const results = (await ctx.db.project.findMany({
      select: {
        projectVersions: {
          where: {
            sheet1: { has: { blockages: { isEmpty: false } } },
            projectVersionCreatedAt: {
              gte: thirtyDaysBackDate,
            },
          },
          select: {
            yesterdayReportStatus: true,
            yesterdayReportCreatedAt: true,
            projectName: true,
            sheet1: true,
            assignedProjectManager: { select: { name: true } },
          },
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    })) as unknown as {
      projectVersions: {
        yesterdayReportStatus: ReportStatus;
        yesterdayReportCreatedAt: Date;
        projectName: string;
        sheet1: NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>;
        assignedProjectManager: { name: string };
      }[];
    }[];

    if (results.length === 0) {
      return {
        recentBlockagesInProjects: [],
        recentDailyReportsInProjects: [],
        projectDeadlineAlerts: [],
      };
    }

    const projectsWithTheirLatestVersion = results.map((project) => ({
      projectName: project.projectVersions[0]?.projectName,
      yesterdayReportStatus: project.projectVersions[0]?.yesterdayReportStatus,
      yesterdayReportCreatedAt:
        project.projectVersions[0]?.yesterdayReportCreatedAt,
      sheet1: project.projectVersions[0]?.sheet1,
      assignedProjectManager:
        project.projectVersions[0]?.assignedProjectManager,
    })) as unknown as {
      projectName: string;
      yesterdayReportStatus: ReportStatus;
      yesterdayReportCreatedAt: Date;
      sheet1: NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>;
      assignedProjectManager: { name: string };
    }[];

    const recentBlockagesInProjects = projectsWithTheirLatestVersion.map(
      (pv) => ({
        projectName: pv.projectName,
        blockages:
          pv.sheet1?.flatMap(
            (item) =>
              item.blockages?.map((blockage) =>
                blockage
                  ? {
                      status: blockage.status,
                      description: blockage.description,
                      numberOfPhotos: blockage.blockagePhotos?.length ?? 0,
                      openDate: blockage.blockageStartTime,
                    }
                  : null,
              ) ?? [],
          ) ?? [],
        assignedProjectManager: pv.assignedProjectManager,
      }),
    );

    const recentDailyReportsInProjects = projectsWithTheirLatestVersion.map(
      (pv) => ({
        projectName: pv.projectName,
        assignedProjectManager: pv.assignedProjectManager,
        dailyReports:
          pv.sheet1?.flatMap(
            (item) =>
              item?.yesterdayProgressPhotos
                ?.map((report) =>
                  report
                    ? {
                        status: pv.yesterdayReportStatus,
                        description: report.description,
                        numberOfPhotos: report.photos?.length ?? 0,
                        dailyReportCreatedAt: pv.yesterdayReportCreatedAt,
                      }
                    : null,
                )
                .filter(Boolean) ?? [],
          ) ?? [],
      }),
    );

    const results2 = await ctx.db.project.findMany({
      select: {
        projectVersions: {
          where: {
            estimatedEndDate: {
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            // Remove assignedProjectManagerId filter - HEAD_OF_PLANNING/MANAGING_DIRECTOR should see all projects
          },
          select: {
            id: true,
            projectName: true,
            projectDescription: true,
            estimatedEndDate: true,
            projectStatus: true,
            assignedProjectManager: {
              select: { name: true, email: true },
            },
          },
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });

    const projectDeadlineAlerts = results2
      .filter((project) => project.projectVersions.length > 0)
      .map((project) => ({
        id: project.projectVersions[0]!.id,
        projectName: project.projectVersions[0]!.projectName,
        projectDescription: project.projectVersions[0]!.projectDescription,
        estimatedEndDate: project.projectVersions[0]!.estimatedEndDate,
        projectStatus: project.projectVersions[0]!.projectStatus,
        assignedProjectManager:
          project.projectVersions[0]!.assignedProjectManager,
      })) as unknown as {
        id: number;
        projectName: string;
        projectDescription: string;
        estimatedEndDate: Date;
        projectStatus: ProjectStatus;
        assignedProjectManager: { name: string; email: string };
      }[];

    return {
      recentBlockagesInProjects: recentBlockagesInProjects.slice(0, 3),
      recentDailyReportsInProjects: recentDailyReportsInProjects.slice(0, 3),
      projectDeadlineAlerts: projectDeadlineAlerts.slice(0, 3),
    };
  }),
});
