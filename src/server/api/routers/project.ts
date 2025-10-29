import { getS3FileUrls } from "@/config/aws-s3.config";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  projectSchema,
  projectVersionSchema,
} from "@/validators/prisma-schmea.validator";
import { Role } from "@prisma/client";
import { url } from "inspector";
import type z from "zod";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(projectVersionSchema)
    .mutation(async ({ input: projectVersion, ctx }) => {
      const { client, siteLocation, sheet1, ...projectVersionData } =
        projectVersion;

      const createdById = ctx.session.user.id;

      const createdProject = await ctx.db.project.create({
        data: {
          createdById,
          projectVersions: {
            create: {
              ...projectVersionData,
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
        message: "Failed to fetch project managers",
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
            if (!latest) throw new Error("Latest project version not found");

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
        message: "Failed to fetch projects",
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
          message: "Failed to fetch projects assigned to project manager",
          data: [],
        };
      }
    },
  ),
});
