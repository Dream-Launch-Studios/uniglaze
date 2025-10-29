enum Action {
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

enum Resource {
  RSVP = "rsvp",
  VenderManagement = "vender-management",
  BudgetManagement = "budget-management",
  EventManagement = "event-management",
}

enum Role {
  EVENT_MANAGER = "EVENT_MANAGER",
  GROOM = "GROOM",
  BRIDE = "BRIDE",
}

type Permission = `${Action}:${Resource}`;

const PERMISSIONS: Record<Role, Permission[]> = {
  [Role.EVENT_MANAGER]: [
    `${Action.Read}:${Resource.RSVP}`,
    `${Action.Create}:${Resource.RSVP}`,
    `${Action.Update}:${Resource.RSVP}`,
    `${Action.Delete}:${Resource.RSVP}`,
  ],
  [Role.GROOM]: [
    `${Action.Read}:${Resource.RSVP}`,
    `${Action.Update}:${Resource.RSVP}`,
    `${Action.Delete}:${Resource.RSVP}`,
  ],
  [Role.BRIDE]: [
    `${Action.Read}:${Resource.RSVP}`,
    `${Action.Update}:${Resource.RSVP}`,
    `${Action.Delete}:${Resource.RSVP}`,
  ],
};

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

const rbacService = new RBACService();

rbacService.checkPermission(Role.BRIDE, Action.Read, Resource.BudgetManagement);
