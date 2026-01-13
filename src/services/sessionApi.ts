import apiInstance from '../config/axiosCustom';
import type {
  Session,
  Participant,
  JoinSessionResponse,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionListResponse,
  ApiResponse,
  SessionStatus,
  AvailableMember,
  NotePermissionResponse
} from '../types/session';


// ==================== SESSION MANAGEMENT ====================


/**
 * Create a new live session
 */
export const createSession = async (
  data: CreateSessionRequest
): Promise<Session> => {
  const response = await apiInstance.post<ApiResponse<Session>>('/api/sessions', data);
  return response.data.result;
};


/**
 * Get session by ID
 */
export const getSession = async (sessionId: string): Promise<Session> => {
  const response = await apiInstance.get<ApiResponse<Session>>(`/api/sessions/${sessionId}`);
  return response.data.result;
};


/**
 * Update a session (only host, only SCHEDULED/ENDED status)
 */
export const updateSession = async (
  sessionId: string,
  data: UpdateSessionRequest
): Promise<Session> => {
  const response = await apiInstance.put<ApiResponse<Session>>(
    `/api/sessions/${sessionId}`,
    data
  );
  return response.data.result;
};


/**
 * Delete a session (only host, only SCHEDULED/ENDED status)
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  await apiInstance.delete(`/api/sessions/${sessionId}`);
};


/**
 * Get sessions by project ID
 */
export const getProjectSessions = async (
  projectId: number,
  status?: SessionStatus,
  page: number = 0,
  size: number = 20
): Promise<SessionListResponse> => {
  const params = new URLSearchParams();

  if (status) {
    params.append('status', status);
  }
  params.append('page', page.toString());
  params.append('size', size.toString());

  const response = await apiInstance.get<ApiResponse<SessionListResponse>>(
    `/api/sessions/projects/${projectId}?${params.toString()}`
  );
  return response.data.result;
};


/**
 * Get sessions hosted by current user
 */
export const getMyHostedSessions = async (
  page: number = 0,
  size: number = 10
): Promise<SessionListResponse> => {
  const response = await apiInstance.get<ApiResponse<SessionListResponse>>(
    `/api/sessions/host?page=${page}&size=${size}`
  );
  return response.data.result;
};


/**
 * Start a scheduled session (only host)
 */
export const startSession = async (sessionId: string): Promise<Session> => {
  const response = await apiInstance.post<ApiResponse<Session>>(
    `/api/sessions/${sessionId}/start`
  );
  return response.data.result;
};


/**
 * End an active session (only host)
 */
export const endSession = async (sessionId: string): Promise<{
  sessionId: string;
  title: string;
  scheduledStart: string;
  actualStart: string;
  actualEnd: string;
  duration: string;
  totalParticipants: number;
}> => {
  const response = await apiInstance.post<ApiResponse<any>>(
    `/api/sessions/${sessionId}/end`
  );
  return response.data.result;
};


/**
 * Cancel a scheduled session (only host)
 */
export const cancelSession = async (
  sessionId: string,
  reason?: string
): Promise<Session> => {
  const response = await apiInstance.post<ApiResponse<Session>>(
    `/api/sessions/${sessionId}/cancel`,
    { reason }
  );
  return response.data.result;
};


// ==================== PARTICIPANT MANAGEMENT ====================


/**
 * Join a session and get Agora credentials
 */
export const joinSession = async (sessionId: string): Promise<JoinSessionResponse> => {
  const response = await apiInstance.post<ApiResponse<JoinSessionResponse>>(
    `/api/sessions/${sessionId}/participants/join`
  );
  return response.data.result;
};


/**
 * Leave the current session
 */
export const leaveSession = async (sessionId: string): Promise<void> => {
  await apiInstance.post(`/api/sessions/${sessionId}/participants/leave`);
};


/**
 * Get all participants in a session
 * @deprecated Use getOnlineParticipants for live session participants
 */
export const getParticipants = async (sessionId: string): Promise<Participant[]> => {
  const response = await apiInstance.get<ApiResponse<Participant[]>>(
    `/api/sessions/${sessionId}/participants`
  );
  return response.data.result;
};


/**
 * ✅ CORRECT: Get only ONLINE participants (for live session)
 * This is the primary method to get participants list in live session room
 */
export const getOnlineParticipants = async (sessionId: string): Promise<Participant[]> => {
  const response = await apiInstance.get<ApiResponse<Participant[]>>(
    `/api/sessions/${sessionId}/participants/online`
  );
  return response.data.result;
};


/**
 * ✅ ALIAS: Use this in LiveSessionRoom component
 */
export const getSessionParticipants = async (sessionId: string): Promise<Participant[]> => {
  return getOnlineParticipants(sessionId);
};


/**
 * Invite a user to join the session (only host)
 */
export const inviteParticipant = async (
  sessionId: string,
  userId: number
): Promise<Participant> => {
  const response = await apiInstance.post<ApiResponse<Participant>>(
    `/api/sessions/${sessionId}/participants/invite`,
    { userId }
  );
  return response.data.result;
};


/**
 * Update participant permissions (only host)
 */
export const updateParticipantPermissions = async (
  sessionId: string,
  userId: number,
  permissions: {
    canShareAudio?: boolean;
    canShareVideo?: boolean;
    canControlPlayback?: boolean;
    canApproveFiles?: boolean;
  }
): Promise<Participant> => {
  const response = await apiInstance.patch<ApiResponse<Participant>>(
    `/api/sessions/${sessionId}/participants/${userId}/permissions`,
    permissions
  );
  return response.data.result;
};


/**
 * Remove a participant from session (only host)
 */
export const removeParticipant = async (
  sessionId: string,
  userId: number
): Promise<void> => {
  await apiInstance.delete(`/api/sessions/${sessionId}/participants/${userId}`);
};


/**
 * Refresh Agora token when it's about to expire
 */
export const refreshAgoraToken = async (sessionId: string): Promise<{
  token: string;
  expiresIn: number;
}> => {
  const response = await apiInstance.post<ApiResponse<any>>(
    `/api/sessions/${sessionId}/participants/token/refresh`
  );
  return response.data.result;
};


// ==================== HELPER FUNCTIONS ====================


/**
 * Check if user is host of a session
 */
export const isSessionHost = (session: Session, userId: number): boolean => {
  return session.hostId === userId;
};


/**
 * Check if session is active (can join)
 */
export const isSessionActive = (session: Session): boolean => {
  return session.status === 'ACTIVE';
};


/**
 * ✅ FIXED: Check if session is joinable
 * Không giới hạn số người tham gia - chỉ check status ACTIVE
 */
export const canJoinSession = (session: Session): boolean => {
  return session.status === 'ACTIVE';
};


/**
 * Get available members for invitation (exclude already invited)
 */
export const getAvailableMembers = async (sessionId: string): Promise<AvailableMember[]> => {
  const response = await apiInstance.get(`/api/sessions/${sessionId}/available-members`);
  return response.data.result;
};

/**
 * Invite more members to SCHEDULED PRIVATE session
 */
export const inviteMoreMembers = async (
  sessionId: string,
  memberIds: number[],
  roles: ('OWNER' | 'COLLABORATOR' | 'CLIENT')[]
): Promise<Session> => {
  const response = await apiInstance.post(`/api/sessions/${sessionId}/invite-more`, {
    memberIds,
    roles
  });
  return response.data.result;
};

/**
 * Format session duration
 */
export const formatSessionDuration = (start?: string, end?: string): string => {
  if (!start || !end) return '-';

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const durationMs = endTime - startTime;

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// ==================== MILESTONES & TRACKS ====================

/**
 * Get milestones with tracks for a session
 */
export const getSessionMilestones = async (
  sessionId: string
): Promise<import('../types/session').SessionMilestonesWithTracksResponse> => {
  const response = await apiInstance.get<ApiResponse<import('../types/session').SessionMilestonesWithTracksResponse>>(
    `/api/sessions/${sessionId}/milestones`
  );
  return response.data.result;
};

// ==================== TRACK NOTES ====================

import type {
  TrackNote,
  CreateTrackNoteRequest,
  UpdateTrackNoteRequest,
  RoomType
} from '../types/session';

/**
 * Get notes for a track
 */
export const getTrackNotes = async (
  trackId: number,
  roomType?: RoomType
): Promise<TrackNote[]> => {
  const params = roomType ? `?roomType=${roomType}` : '';
  const response = await apiInstance.get<ApiResponse<TrackNote[]>>(
    `/api/tracks/${trackId}/notes${params}`
  );
  return response.data.result;
};

/**
 * Create a note for a track
 */
export const createTrackNote = async (
  trackId: number,
  request: CreateTrackNoteRequest
): Promise<TrackNote> => {
  const response = await apiInstance.post<ApiResponse<TrackNote>>(
    `/api/tracks/${trackId}/notes`,
    request
  );
  return response.data.result;
};

/**
 * Update a track note
 */
export const updateTrackNote = async (
  trackId: number,
  noteId: number,
  request: UpdateTrackNoteRequest
): Promise<TrackNote> => {
  const response = await apiInstance.put<ApiResponse<TrackNote>>(
    `/api/tracks/${trackId}/notes/${noteId}`,
    request
  );
  return response.data.result;
};

/**
 * Delete a track note
 */
export const deleteTrackNote = async (
  trackId: number,
  noteId: number,
  sessionId?: string
): Promise<void> => {
  const params = sessionId ? { sessionId } : {};
  await apiInstance.delete(`/api/tracks/${trackId}/notes/${noteId}`, { params });
};

/**
 * Check if user can note on a track
 */
export const checkCanNote = async (
  trackId: number
): Promise<NotePermissionResponse> => {
  const response = await apiInstance.get<ApiResponse<NotePermissionResponse>>(
    `/api/tracks/${trackId}/notes/can-note`
  );
  return response.data.result;
};