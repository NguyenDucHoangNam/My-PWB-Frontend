// src/types/session.ts

// ==================== ENUMS ====================

export const SessionStatus = {
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED'
} as const;

export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];

export const ParticipantRole = {
  OWNER: 'OWNER',
  COLLABORATOR: 'COLLABORATOR',
  CLIENT: 'CLIENT',
  OBSERVER: 'OBSERVER'
} as const;

export type ParticipantRole = typeof ParticipantRole[keyof typeof ParticipantRole];

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED'
} as const;

export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];

// ✅ WebSocket event types - Support both formats
export const WebSocketEventType = {
  // Standard format
  PARTICIPANT_EVENT: 'PARTICIPANT_EVENT',
  SESSION_STATE_CHANGED: 'SESSION_STATE_CHANGED',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  PLAYBACK_EVENT: 'PLAYBACK_EVENT',
  // Alternative format (backend compatibility)
  PARTICIPANT_JOINED: 'PARTICIPANT_JOINED',
  PARTICIPANT_LEFT: 'PARTICIPANT_LEFT',
  // ✅ NEW: Chat-specific events
  TYPING_START: 'TYPING_START',
  TYPING_STOP: 'TYPING_STOP',
  USER_LEAVING: 'USER_LEAVING',
  // ✅ NEW: Join request events
  JOIN_REQUEST_RECEIVED: 'JOIN_REQUEST_RECEIVED',
  JOIN_REQUEST_APPROVED: 'JOIN_REQUEST_APPROVED',
  JOIN_REQUEST_REJECTED: 'JOIN_REQUEST_REJECTED',
  JOIN_REQUEST_EXPIRED: 'JOIN_REQUEST_EXPIRED',
  JOIN_REQUEST_CANCELLED: 'JOIN_REQUEST_CANCELLED'
} as const;

export type WebSocketEventType = typeof WebSocketEventType[keyof typeof WebSocketEventType];

export const ParticipantAction = {
  JOINED: 'JOINED',
  LEFT: 'LEFT',
  REMOVED: 'REMOVED',
  PERMISSIONS_UPDATED: 'PERMISSIONS_UPDATED',
  MUTED: 'MUTED',
  UNMUTED: 'UNMUTED',
  // ✅ NEW: Chat actions
  TYPING_START: 'TYPING_START',
  TYPING_STOP: 'TYPING_STOP'
} as const;

export type ParticipantAction = typeof ParticipantAction[keyof typeof ParticipantAction];

export const PlaybackAction = {
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  SEEK: 'SEEK',
  STOP: 'STOP',
  NEXT: 'NEXT',
  PREVIOUS: 'PREVIOUS'
} as const;

export type PlaybackAction = typeof PlaybackAction[keyof typeof PlaybackAction];

// ✅ NEW: Chat message types
export const ChatMessageType = {
  TEXT: 'TEXT',
  SYSTEM: 'SYSTEM',
  FILE: 'FILE',
  EMOJI: 'EMOJI',
  IMAGE: 'IMAGE'
} as const;

export type ChatMessageType = typeof ChatMessageType[keyof typeof ChatMessageType];

export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// ==================== JOIN REQUEST TYPES ====================

/**
 * Join request object stored in Redis
 */
export interface JoinRequest {
  requestId: string;
  sessionId: string;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  projectRole: string; // 'OWNER' | 'COLLABORATOR' | 'CLIENT' | 'OBSERVER'
  requestedAt: string;
  expiresAt: string;
  wsSessionId: string;
}

/**
 * Join request notification sent to owner
 */
export interface JoinRequestNotification {
  requestId: string;
  sessionId: string;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  projectRole: string;
  requestedAt: string;
  expiresAt: string;
  secondsRemaining: number;
}

/**
 * Join request response sent to member
 */
export interface JoinRequestResponse {
  requestId: string;
  sessionId: string;
  approved: boolean;
  reason: string;
  shouldCallJoinAPI: boolean;
  shouldRetry: boolean;
}

/**
 * Approve join request payload (owner → backend)
 */
export interface ApproveJoinRequest {
  requestId: string;
}

/**
 * Reject join request payload (owner → backend)
 */
export interface RejectJoinRequest {
  requestId: string;
  reason: string;
}

// ==================== MAIN ENTITIES ====================

export interface Session {
  id: string;                    // ✅ Backend trả về "id", không phải "sessionId"
  sessionId?: string;            // Alias cho backward compatibility
  title: string;
  description?: string;
  hostId: number;
  hostName: string;
  status: SessionStatus;
  currentParticipants: number;
  isPublic: boolean;             // ✅ NEW: true = PUBLIC (anyone can see), false = PRIVATE (invited only)
  projectId: number;
  projectTitle: string;
  scheduledStart?: string;
  actualStart?: string;
  actualEnd?: string;
  agoraChannelName: string;
  agoraAppId: string;
  createdAt?: string;
  updatedAt?: string;
  currentUserId?: number;        // Current user ID (from backend response)
  sessionType?: string;          // Session type (from backend response)
}

export interface Participant {
  id?: number;
  userId: number;
  userName: string;
  userEmail?: string;
  userAvatarUrl?: string;
  participantRole: ParticipantRole;
  invitationStatus?: InvitationStatus;
  isOnline: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  canShareAudio: boolean;
  canShareVideo: boolean;
  canControlPlayback: boolean;
  canApproveFiles?: boolean;
  joinedAt?: string;
  leftAt?: string;
  invitedAt?: string;
  agoraUid?: number;
}

// ✅ NEW: Available member for invitation
export interface AvailableMember {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  projectRole: 'OWNER' | 'COLLABORATOR' | 'CLIENT';
}

// ==================== CHAT & MESSAGING ====================

// ✅ NEW: Chat message interface
export interface ChatMessage {
  messageId: string;
  sessionId: string;
  senderId: number;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  type: ChatMessageType;
  timestamp: string; // ISO string
  // Optional file attachment
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

// ✅ NEW: Typing indicator interface
export interface TypingIndicator {
  userId: number;
  userName: string;
  isTyping: boolean;
  startedAt?: string;
}

// ✅ NEW: Chat event from backend
export interface ChatEvent {
  type: 'CHAT_MESSAGE' | 'TYPING_START' | 'TYPING_STOP';
  data: ChatMessage | TypingIndicator;
  sessionId: string;
  timestamp: string;
}

// ==================== WEBSOCKET EVENTS ====================

/**
 * Main WebSocket event wrapper - Updated for chat
 */
export interface WebSocketEvent<T = any> {
  eventType?: WebSocketEventType; // Legacy format
  type?: string;                  // New format from backend
  sessionId?: string;
  timestamp?: string;
  payload?: T;
  data?: T;                       // Alternative data field
}

/**
 * ParticipantEvent payload
 */
export interface ParticipantEventPayload {
  action?: ParticipantAction;
  userId: number;
  userName: string;
  userAvatarUrl?: string;
  role?: ParticipantRole;
  isOnline: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  hasAudio?: boolean;    // ✅ Add for real-time sync
  hasVideo?: boolean;    // ✅ Add for real-time sync
  currentParticipants?: number;
}

/**
 * SessionStateChangeEvent payload
 */
export interface SessionStateChangePayload {
  sessionId: string;
  oldStatus: SessionStatus;
  newStatus: SessionStatus;
  triggeredBy: string;
  triggeredByUserId: number;
  message?: string;
}

/**
 * SystemNotification payload
 */
export interface SystemNotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  requiresAction: boolean;
  actionUrl?: string;
}

/**
 * ChatMessage payload - Matches backend ChatMessage DTO
 */
export interface ChatMessagePayload extends ChatMessage {
  // Inherits all ChatMessage fields
}

/**
 * PlaybackEvent payload
 */
export interface PlaybackEventPayload {
  action: PlaybackAction;
  fileId?: number;
  fileName?: string;
  fileUrl?: string;
  position?: number;
  duration?: number;
  playbackRate?: number;
  triggeredByUserId: number;
  triggeredByUserName: string;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface JoinSessionResponse {
  sessionId: string;
  channelName: string;
  appId: string;
  token: string;
  uid: number;
  role: string;
  expiresIn: number;
  sessionTitle: string;
  currentParticipants: number;
}

export interface CreateSessionRequest {
  projectId: number;
  title: string;
  description?: string;
  scheduledStart?: string;
  invitedMemberIds?: number[];  // ✅ NEW: Danh sách user IDs được mời
  inviteRoles?: ('OWNER' | 'COLLABORATOR' | 'CLIENT')[];  // ✅ NEW: Hoặc mời theo roles
}

export interface UpdateSessionRequest {
  title?: string;
  description?: string;
  scheduledStart?: string;
}

export interface InviteParticipantRequest {
  userId: number;
}

export interface UpdateParticipantPermissionsRequest {
  canShareAudio?: boolean;
  canShareVideo?: boolean;
  canControlPlayback?: boolean;
  canApproveFiles?: boolean;
}

export interface SessionSummaryResponse {
  sessionId: string;
  title: string;
  scheduledStart?: string;
  actualStart?: string;
  actualEnd?: string;
  duration: string;
  totalParticipants: number;
}

export interface SessionListResponse {
  content: Session[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  code?: number;
  message: string;
  result: T;
}

// ==================== HELPER TYPES ====================

export interface AgoraCredentials {
  appId: string;
  channel: string;
  token: string;
  uid: number;
}

export interface RemoteUser {
  uid: number;
  hasAudio: boolean;
  hasVideo: boolean;
  audioTrack?: any;
  videoTrack?: any;
}

// ✅ NEW: Hook interfaces for chat functionality
export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  addMessage: (message: ChatMessage) => void;
  addSystemMessage: (content: string) => void;
  handleTypingStart: (userId: number, userName: string) => void;
  handleTypingStop: (userId: number) => void;
  clearMessages: () => void;
}

export interface UseSessionEventsProps {
  sessionId: string | undefined;
  currentUserId: number;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  addSystemMessage: (message: string) => void;
  addChatMessage: (message: ChatMessage) => void;       // ✅ NEW
  handleTypingStart: (userId: number, userName: string) => void;  // ✅ NEW
  handleTypingStop: (userId: number) => void;           // ✅ NEW
  handleLeave: () => void;
}

// ==================== TYPE GUARDS ====================

export function isParticipantEvent(event: WebSocketEvent): event is WebSocketEvent<ParticipantEventPayload> {
  return (event.eventType === WebSocketEventType.PARTICIPANT_EVENT
    || event.eventType === WebSocketEventType.PARTICIPANT_JOINED
    || event.eventType === WebSocketEventType.PARTICIPANT_LEFT)
    || (event.type === 'PARTICIPANT_EVENT'
      || event.type === 'PARTICIPANT_JOINED'
      || event.type === 'PARTICIPANT_LEFT');
}

export function isSessionStateChanged(event: WebSocketEvent): event is WebSocketEvent<SessionStateChangePayload> {
  return event.eventType === WebSocketEventType.SESSION_STATE_CHANGED
    || event.type === 'SESSION_STATE_CHANGED';
}

export function isSystemNotification(event: WebSocketEvent): event is WebSocketEvent<SystemNotificationPayload> {
  return event.eventType === WebSocketEventType.SYSTEM_NOTIFICATION
    || event.type === 'SYSTEM_NOTIFICATION';
}

// ✅ NEW: Chat message type guards
export function isChatMessage(event: WebSocketEvent): event is WebSocketEvent<ChatMessagePayload> {
  return event.eventType === WebSocketEventType.CHAT_MESSAGE
    || event.type === 'CHAT_MESSAGE';
}

export function isTypingEvent(event: WebSocketEvent): boolean {
  return (event.eventType === WebSocketEventType.TYPING_START
    || event.eventType === WebSocketEventType.TYPING_STOP)
    || (event.type === 'TYPING_START' || event.type === 'TYPING_STOP');
}

export function isPlaybackEvent(event: WebSocketEvent): event is WebSocketEvent<PlaybackEventPayload> {
  return event.eventType === WebSocketEventType.PLAYBACK_EVENT
    || event.type === 'PLAYBACK_EVENT';
}

// ✅ NEW: Utility type guards for better event handling
export function getChatMessageFromEvent(event: WebSocketEvent): ChatMessage | null {
  if (!isChatMessage(event)) return null;

  // Handle both payload and data fields
  const chatData = event.payload || event.data;
  if (!chatData) return null;

  return chatData as ChatMessage;
}

export function getTypingDataFromEvent(event: WebSocketEvent): { userId: number; userName: string } | null {
  if (!isTypingEvent(event)) return null;

  const typingData = event.payload || event.data;
  if (!typingData) return null;

  return typingData as { userId: number; userName: string };
}

// ✅ NEW: Chat message factory for system messages
export function createSystemMessage(sessionId: string, content: string): ChatMessage {
  return {
    messageId: `system-${Date.now()}`,
    sessionId,
    senderId: 0,
    senderName: 'System',
    senderAvatarUrl: undefined,
    content,
    type: 'SYSTEM',
    timestamp: new Date().toISOString()
  };
}

// ✅ NEW: Validate chat message
export function isValidChatMessage(message: any): message is ChatMessage {
  return (
    typeof message === 'object' &&
    typeof message.messageId === 'string' &&
    typeof message.sessionId === 'string' &&
    typeof message.senderId === 'number' &&
    typeof message.senderName === 'string' &&
    typeof message.content === 'string' &&
    typeof message.type === 'string' &&
    typeof message.timestamp === 'string'
  );
}

// ==================== MILESTONES & TRACKS ====================

/**
 * Session track response from backend
 */
export interface SessionTrackResponse {
  trackId: number;
  trackName: string;
  version: string; // v1, v2, ...
  hlsPlaybackUrl: string;
  duration: number; // seconds
  roomType: 'INTERNAL' | 'CLIENT';
  voiceTagEnabled: boolean;
}

/**
 * Milestone with tracks response from backend
 */
export interface MilestoneWithTracksResponse {
  id: number;
  title: string;
  description: string;
  status: string; // IN_PROGRESS, PENDING, COMPLETED, ...
  sequence: number;
  productCount: number;
  editCount: number;
  amount: number;
  paymentStatus?: string;
  contractProductCount: number;
  contractFpEditCount: number;
  contractTotalAmount: number;
  projectTitle: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  internalTracks: SessionTrackResponse[];
  clientTracks: SessionTrackResponse[];
}

/**
 * Session milestones with tracks response
 */
export interface SessionMilestonesWithTracksResponse {
  milestones: MilestoneWithTracksResponse[];
}

// ==================== TRACK NOTES ====================

export type RoomType = 'INTERNAL' | 'CLIENT';

export interface TrackNote {
  id: number;
  trackId: number;
  content: string;
  roomType: RoomType;
  userId: number;
  userName: string;
  userAvatar?: string;
  timestamp?: number; // Thời điểm trong bài hát (giây)
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackNoteRequest {
  content: string;
  roomType: RoomType;
  timestamp?: number; // Thời điểm trong bài hát (giây)
  sessionId?: string; // Session ID for real-time broadcast
}

export interface UpdateTrackNoteRequest {
  content: string;
  sessionId?: string; // Session ID for real-time broadcast
}

export interface NotePermissionResponse {
  canNote: boolean;
  isHost: boolean;
  isClient: boolean;
}