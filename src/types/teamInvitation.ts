/**
 * Team Invitation Types
 * Re-export types from projectService for better organization
 */

export type {
  Invitation,
  ProjectMember,
  CreateInvitationPayload,
  InvitationSuggestion,
  MembersResponse,
  GetMembersParams,
  GetInvitationSuggestionsParams,
} from "../services/projectService";

export type { ProjectPermissionResponse } from "./permission";

/**
 * Tab types for Team Invitation page
 */
export type TeamInvitationTab = "invite" | "pending" | "members";

/**
 * Role types for invitations
 */
export type InvitationRole = "COLLABORATOR" | "CLIENT" | "OBSERVER";

/**
 * Project role types
 */
export type ProjectRole = "OWNER" | "CLIENT" | "COLLABORATOR" | "OBSERVER";

