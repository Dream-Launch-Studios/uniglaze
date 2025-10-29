import type { Role } from "@prisma/client";
import type { Action, Resource } from "./enums.permission";
import { PERMISSIONS } from "./permission";

class RBACService {
  constructor(private permissions = PERMISSIONS) {}

  checkPermission(
    customRole: Role,
    action: Action,
    resource: Resource,
  ): boolean {
    const perms = this.permissions[customRole] || [];
    return perms.includes(`${action}:${resource}`);
  }
}

export const RBACservice = new RBACService();
