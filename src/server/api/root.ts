import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { AWSs3Router } from "./routers/AWSs3";
import { projectRouter } from "./routers/project";
// import { newDashboardRouter } from "./routers/new-dashboard";
import { dashboardRouter } from "./routers/dashboard";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  AWSs3: AWSs3Router,
  project: projectRouter,
  // newDashboard: newDashboardRouter,
  dashboard: dashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
