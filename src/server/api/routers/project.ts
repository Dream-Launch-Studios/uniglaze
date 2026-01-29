import { getS3FileUrls } from "@/config/aws-s3.config";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  projectSchema,
  projectVersionSchema,
} from "@/validators/prisma-schmea.validator";
import { Role } from "@prisma/client";
import { url } from "inspector";
import z from "zod";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(projectVersionSchema)
    .mutation(async ({ input: projectVersion, ctx }) => {
      const { client, siteLocation, sheet1, ...projectVersionData } =
        projectVersion;

      const createdById = ctx.session.user.id;
      const assignedProjectManagerId =
        projectVersionData.assignedProjectManagerId || ctx.session.user.id;

      const createdProject = await ctx.db.project.create({
        data: {
          createdById,
          projectVersions: {
            create: {
              ...projectVersionData,
              assignedProjectManagerId,
              siteLocation: siteLocation,
              client: client,
              sheet1: sheet1,
              projectVersionCreatedByUserId: createdById,
            },
          },
        },
        include: {
          projectVersions: true,
        },
      });

      if (Array.isArray(createdProject?.projectVersions)) {
        const latestProjectVersion = projectVersionSchema.parse(
          createdProject.projectVersions[0],
        );

        const currentProject = projectSchema.parse({
          ...createdProject,
          latestProjectVersion,
        });

        return currentProject;
      }
      return null;
    }),

  createProjectVersion: protectedProcedure
    .input(projectVersionSchema)
    .mutation(async ({ input: projectVersion, ctx }) => {
      const { projectId, ...rest } = projectVersion;

      // console.log("##########################################################");
      // console.log("PROJECT VERSION", projectVersion);
      // console.log("PROJECT VERSION", projectVersion);
      // console.log("##########################################################");

      if (!projectId) return null;

      const latest = (await ctx.db.projectVersion.create({
        data: {
          ...rest,
          projectId: projectId,
          projectVersionCreatedByUserId: ctx.session.user.id,
        },
      })) as unknown as z.infer<typeof projectVersionSchema>;

      const s3Keys = latest.projectDocuments.map((document) => document.s3Key);
      const urls = await getS3FileUrls(s3Keys, 60000);
      latest.projectDocuments = latest.projectDocuments.map(
        (document, index) => ({ ...document, url: urls[index] ?? "" }),
      );

      if (latest?.sheet1) {
        latest.sheet1 = await Promise.all(
          latest.sheet1.map(async (item) => {
            if (item?.yesterdayProgressPhotos?.length) {
              item.yesterdayProgressPhotos = await Promise.all(
                (item.yesterdayProgressPhotos ?? []).map(async (report) => {
                  const s3Keys = report.photos.map((photo) => photo.s3Key);
                  const urls = await getS3FileUrls(s3Keys, 60000);
                  report.photos = report.photos.map((photo, index) => ({
                    ...photo,
                    url: urls[index] ?? "",
                  }));
                  return report;
                }),
              );
            }
            if (item.blockages) {
              item.blockages = await Promise.all(
                item.blockages.map(async (blockage) => {
                  const s3Keys = blockage.blockagePhotos.map(
                    (photo) => photo.s3Key,
                  );
                  const urls = await getS3FileUrls(s3Keys, 60000);
                  blockage.blockagePhotos = blockage.blockagePhotos.map(
                    (photo, index) => ({
                      ...photo,
                      url: urls[index] ?? "",
                    }),
                  );
                  return blockage;
                }),
              );
            }
            return item;
          }),
        );
      }

      return {
        createdById: ctx.session.user.id,
        latestProjectVersion: latest,
        assignedProjectManager: ctx.session.user.id,
      };

      // // console.log("##########################################################");
      // // console.log("NEW PROJECT VERSION", newProjectVersion);
      // // console.log("##########################################################");

      // return {
      //   latestProjectVersion: newProjectVersion,
      //   createdById: ctx.session.user.id,
      //   createdAt: newProjectVersion.projectVersionCreatedAt,
      // };
    }),

  getProjectManagersNameWithId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const projectManagers = await ctx.db.user.findMany({
        where: { customRole: Role.PROJECT_MANAGER },
      });

      const projectManagersNameWithId = projectManagers.map((manager) => ({
        id: manager.id,
        name: manager.name,
      }));

      return {
        success: true,
        data: projectManagersNameWithId,
        message: "Project managers fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to load project managers. Check your internet connection and try refreshing the page.",
        data: [],
      };
    }
  }),

  getAllProjectsWithLatestVersion: protectedProcedure.query(async ({ ctx }) => {
    try {
      let projects;
      if (ctx.session.user.customRole === Role.PROJECT_MANAGER) {
        projects = await ctx.db.project.findMany({
          include: {
            projectVersions: {
              orderBy: { id: "desc" },
              include: {
                projectVersionCreatedByUser: true,
                assignedProjectManager: true,
              },
              take: 1,
            },
            // projectVersions: true,
            createdBy: true,
          },
          where: {
            projectVersions: {
              some: {
                assignedProjectManagerId: ctx.session.user.id,
              },
            },
          },
          // orderBy: { createdAt: "desc" },
        });
      } else {
        projects = await ctx.db.project.findMany({
          include: {
            projectVersions: {
              orderBy: { id: "desc" },
              include: {
                projectVersionCreatedByUser: true,
                assignedProjectManager: true,
              },
              take: 1,
            },
            // projectVersions: true,
            createdBy: true,
          },
          // orderBy: { createdAt: "desc" },
        });
      }

      const projectsWithLatestVersion = await Promise.all(
        projects
          .filter((project) => project.projectVersions.length > 0)
          .map(async (project) => {
            const latest = project.projectVersions[0] as unknown as z.infer<
              typeof projectVersionSchema
            >;
            if (!latest) throw new Error("Project data is incomplete. The project exists but has no version data. Please contact support.");

            // Convert all project documents to signed URLs
            const s3Keys = latest.projectDocuments.map(
              (document) => document.s3Key,
            );
            const urls = await getS3FileUrls(s3Keys, 60000);
            latest.projectDocuments = latest.projectDocuments.map(
              (document, index) => ({ ...document, url: urls[index] ?? "" }),
            );

            if (latest?.sheet1) {
              latest.sheet1 = await Promise.all(
                latest.sheet1.map(async (item) => {
                  if (item?.yesterdayProgressPhotos?.length) {
                    item.yesterdayProgressPhotos = await Promise.all(
                      (item.yesterdayProgressPhotos ?? []).map(
                        async (report) => {
                          const s3Keys = report.photos.map(
                            (photo) => photo.s3Key,
                          );
                          const urls = await getS3FileUrls(s3Keys, 60000);
                          report.photos = report.photos.map((photo, index) => ({
                            ...photo,
                            url: urls[index] ?? "",
                          }));
                          return report;
                        },
                      ),
                    );
                  }
                  if (item.blockages) {
                    item.blockages = await Promise.all(
                      item.blockages.map(async (blockage) => {
                        const s3Keys = blockage.blockagePhotos.map(
                          (photo) => photo.s3Key,
                        );
                        const urls = await getS3FileUrls(s3Keys, 60000);
                        blockage.blockagePhotos = blockage.blockagePhotos.map(
                          (photo, index) => ({
                            ...photo,
                            url: urls[index] ?? "",
                          }),
                        );
                        return blockage;
                      }),
                    );
                  }
                  return item;
                }),
              );
            }

            return {
              createdById: project.createdById,
              latestProjectVersion: latest,
              assignedProjectManager:
                project.projectVersions[0]?.assignedProjectManager,
            };
          }),
      );

      return {
        success: true,
        data: projectsWithLatestVersion,
        message: "All projects with latest version fetched successfully",
      };
    } catch (error) {
      console.log("##########################################################");
      console.log("ERROR", error);
      console.log("##########################################################");
      return {
        success: false,
        message: "Failed to load projects. Check your internet connection and try refreshing the page. If the problem continues, contact support.",
        data: [],
      };
    }
  }),

  getAllProjectsAssignedToProjectManager: protectedProcedure.query(
    async ({ ctx }) => {
      try {
        const projectManagerId = ctx.session.user.id;

        const projects = await ctx.db.project.findMany({
          include: {
            projectVersions: {
              where: {
                assignedProjectManagerId: projectManagerId,
                // sheet1: { isEmpty: false },
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

        return {
          success: true,
          data: projectsWithLatestVersion,
          message: "Projects assigned to project manager fetched successfully",
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to load your assigned projects. Check your internet connection and try refreshing the page.",
          data: [],
        };
      }
    },
  ),

  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user has permission (only MD or HOP can delete)
        if (
          ctx.session.user.customRole !== Role.MANAGING_DIRECTOR &&
          ctx.session.user.customRole !== Role.HEAD_OF_PLANNING
        ) {
          throw new Error("You don't have permission to delete projects. Only Managing Directors and Head of Planning can delete projects.");
        }

        // Check if project exists and was created by the user or user is MD
        const project = await ctx.db.project.findUnique({
          where: { id: input.projectId },
          include: {
            projectVersions: true,
          },
        });

        if (!project) {
          throw new Error("Project not found. The project may have been deleted or the ID is incorrect.");
        }

        // Only allow deletion if user created it or is MD
        if (
          project.createdById !== ctx.session.user.id &&
          ctx.session.user.customRole !== Role.MANAGING_DIRECTOR
        ) {
          throw new Error("You can only delete projects that you created. If you need to delete someone else's project, contact a Managing Director.");
        }

        // Delete all project versions first (due to foreign key constraint)
        await ctx.db.projectVersion.deleteMany({
          where: { projectId: input.projectId },
        });

        // Then delete the project
        await ctx.db.project.delete({
          where: { id: input.projectId },
        });

        return {
          success: true,
          message: "Project deleted successfully",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to delete project. Check your permissions and try again. If the problem continues, contact support.",
        };
      }
    }),

  getProjectVersionsHistory: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const where: any = {
          projectId: input.projectId,
        };

        // Fetch a wider range to ensure we get all relevant versions
        // We'll filter by actual report date in the component
        if (input.startDate || input.endDate) {
          // Fetch versions where either date field might be in range
          // We'll do precise filtering in the component
          const startDate = input.startDate ? new Date(input.startDate) : undefined;
          const endDate = input.endDate ? new Date(input.endDate) : undefined;
          
          // If we have dates, expand the range slightly to catch edge cases
          if (startDate) {
            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(startDate.getDate() - 1); // Include day before
          }
          if (endDate) {
            endDate.setHours(23, 59, 59, 999);
            endDate.setDate(endDate.getDate() + 1); // Include day after
          }
          
          where.OR = [
            {
              projectVersionCreatedAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            },
            {
              yesterdayReportCreatedAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            },
          ];
        }

        const versions = await ctx.db.projectVersion.findMany({
          where,
          orderBy: { projectVersionCreatedAt: "asc" },
          select: {
            id: true,
            projectVersionCreatedAt: true,
            yesterdayReportCreatedAt: true,
            yesterdayReportStatus: true,
            projectName: true,
            sheet1: true,
            client: true,
            siteLocation: true,
            assignedProjectManager: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          success: true,
          data: versions,
        };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to load project history. Check your internet connection and try refreshing the page.",
          data: [],
        };
      }
    }),
});
