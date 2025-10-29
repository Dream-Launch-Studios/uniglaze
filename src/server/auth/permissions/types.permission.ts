import type { Action, Resource } from "./enums.permission";

export type Permission = `${Action}:${Resource}`;
