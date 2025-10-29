import { Role } from "@prisma/client";
import { Action, Resource } from "./enums.permission";
import type { Permission } from "./types.permission";

export const PERMISSIONS: Record<Role, Permission[]> = {
  [Role.MANAGING_DIRECTOR]: [
    `${Action.Read}:${Resource.Role}`,
    `${Action.Create}:${Resource.Role}`,
    `${Action.Update}:${Resource.Role}`,
    `${Action.Delete}:${Resource.Role}`,
  ],
  [Role.HEAD_OF_PLANNING]: [
    `${Action.Read}:${Resource.Role}`,
    `${Action.Update}:${Resource.Role}`,
    `${Action.Delete}:${Resource.Role}`,
  ],
  [Role.PROJECT_MANAGER]: [],
};
