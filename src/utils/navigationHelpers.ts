import { ROUTER } from '../routes/router.tsx';

/**
 * Navigate to Live Sessions list for a project
 */
export const navigateToLiveSessions = (projectId: number) => {
  return ROUTER.USER.LIVESESSIONS.replace(':projectId', String(projectId));
};

/**
 * Navigate to Live Session room
 */
export const navigateToSessionRoom = (sessionId: string) => {
  return ROUTER.USER.LIVESESSIONROOM.replace(':sessionId', sessionId);
};

/**
 * Navigate back to project detail
 */
export const navigateToProjectDetail = (_projectId: number) => {
  return ROUTER.USER.PROJECTDETAIL; // Add projectId param if needed
};
