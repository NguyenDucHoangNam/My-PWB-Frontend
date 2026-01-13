import apiInstance from "@/config/axiosCustom";

export type InspirationType = "IMAGE" | "AUDIO" | "VIDEO" | "NOTE";

export interface InspirationItemResponse {
  id: number;
  type: InspirationType;
  title?: string;
  noteContent?: string;
  fileKey?: string;
  viewUrl: string;
  mimeType?: string;
  sizeBytes?: number;
  uploaderId: number;
  uploaderName: string;
  createdAt: string;
}

export interface InspirationListResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ApiResponse<T> {
  result: T;
  message?: string;
  status?: string;
}

export interface InspirationNoteCreateRequest {
  title?: string;
  content: string;
}

export interface TrackUploadUrlRequest {
  projectId: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  expectedSizeBytes?: number;
}

export interface TrackUploadUrlResponse {
  objectKey: string;
  presignedPutUrl: string;
  expiresInSeconds: number;
}

export interface TrackUploadDirectResponse {
  trackId: number;
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
}

export interface TrackSuggestionResponse {
  trackId: number;
  status: "SUGGESTING" | "TRANSCRIBING" | "COMPLETED" | "FAILED";
  lyricsText?: string;
  aiSuggestions?: string;
  transcribeJobName?: string;
}

export interface CompleteAndSuggestRequest {
  waitSeconds?: number;
}

export interface BeatToLyricsRequest {
  projectId: number;
  topic: string;
  keywords: string[];
  mood: string;
  structure: string[];
  temperature: number;
}

export interface TrackListItemResponse {
  id: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: "SUGGESTING" | "TRANSCRIBING" | "COMPLETED" | "FAILED"; // TrackStatus
  lyricsText?: string;
  aiSuggestions?: string;
}


/** Upload file asset (image/audio/video) */
export async function uploadInspirationAsset(
  projectId: number,
  type: InspirationType,
  file: File
): Promise<InspirationItemResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await apiInstance.post<ApiResponse<InspirationItemResponse>>(
    `/api/v1/projects/${projectId}/inspirations/asset`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.result;
}

/** Create a note-only inspiration */
export async function createInspirationNote(
  projectId: number,
  data: InspirationNoteCreateRequest
): Promise<InspirationItemResponse> {
  const response = await apiInstance.post<ApiResponse<InspirationItemResponse>>(
    `/api/v1/projects/${projectId}/inspirations/note`,
    data
  );
  return response.data.result;
}

/** List inspirations for a project */
export async function getProjectInspirations(
  projectId: number,
  type?: InspirationType,
  page: number = 0,
  size: number = 20
): Promise<InspirationListResponse<InspirationItemResponse>> {
  const params: any = { page, size };
  if (type) params.type = type;

  const response = await apiInstance.get<
    ApiResponse<InspirationListResponse<InspirationItemResponse>>
  >(`/api/v1/projects/${projectId}/inspirations`, { params });

  const data = response.data.result;

  // Lấy viewUrl riêng cho các file (IMAGE/AUDIO/VIDEO)
  const itemsWithViewUrl = await Promise.all(
    data.items.map(async (item) => {
      if (item.type !== "NOTE") {
        try {
          const res = await apiInstance.get<ApiResponse<string>>(
            `/api/v1/projects/${projectId}/inspirations/${item.id}/view-url`
          );
          item.viewUrl = res.data.result;
        } catch (err) {
          console.error("Lấy viewUrl thất bại cho item", item.id, err);
          item.viewUrl = "";
        }
      }
      return item;
    })
  );

  return { ...data, items: itemsWithViewUrl };
}

/** Optional: Get view URL for a single item */
export async function getInspirationViewUrl(
  projectId: number,
  itemId: number
): Promise<string> {
  const response = await apiInstance.get<ApiResponse<string>>(
    `/api/v1/projects/${projectId}/inspirations/${itemId}/view-url`
  );
  return response.data.result;
}

/** Get download URL for a single inspiration item */
export async function getInspirationDownloadUrl(
  projectId: number,
  itemId: number,
  fileName?: string
): Promise<string> {
  const params: any = {};
  if (fileName) params.fileName = fileName;

  const response = await apiInstance.get<ApiResponse<string>>(
    `/api/v1/projects/${projectId}/inspirations/${itemId}/download-url`,
    { params }
  );

  return response.data.result;
}

/** Delete an inspiration item */
export async function deleteInspirationItem(
  projectId: number,
  itemId: number
): Promise<void> {
  await apiInstance.delete<ApiResponse<void>>(
    `/api/v1/projects/${projectId}/inspirations/${itemId}`
  );
}

export async function uploadTrackMultipart(
  projectId: number,
  file: File,
  mimeType?: string
): Promise<TrackUploadDirectResponse> {
  const formData = new FormData();
  formData.append("projectId", String(projectId));
  formData.append("file", file);
  if (mimeType) formData.append("mimeType", mimeType);

  const res = await apiInstance.post<ApiResponse<TrackUploadDirectResponse>>(
    "/api/v1/tracks/upload-direct",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data.result;
}

export async function uploadTrackRaw(
  projectId: number,
  data: ArrayBuffer | Uint8Array,
  filename?: string,
  mimeType?: string
): Promise<TrackUploadDirectResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/octet-stream",
  };

  if (filename) headers["X-Filename"] = filename;
  if (mimeType) headers["X-Mime-Type"] = mimeType;

  const res = await apiInstance.post<ApiResponse<TrackUploadDirectResponse>>(
    "/api/v1/tracks/upload-direct",
    data,
    {
      headers,
      params: { projectId },
    }
  );

  return res.data.result;
}

export async function completeAndSuggestTrack(
  trackId: number,
  body?: CompleteAndSuggestRequest
): Promise<TrackSuggestionResponse> {
  const response = await apiInstance.post<ApiResponse<TrackSuggestionResponse>>(
    `/api/v1/tracks/${trackId}/complete-and-suggest`,
    body || {}
  );
  return response.data.result;
}

/** Lấy suggestion hiện tại của track (GET /tracks/{trackId}/suggestion) */
export async function getTrackSuggestion(
  trackId: number
): Promise<TrackSuggestionResponse> {
  const response = await apiInstance.get<ApiResponse<TrackSuggestionResponse>>(
    `/api/v1/tracks/${trackId}/suggestion`
  );
  return response.data.result;
}

/** Trigger re-suggest AI lyrics */
export async function resuggestTrack(trackId: number): Promise<void> {
  await apiInstance.post(`/api/v1/tracks/${trackId}/resuggest`);
}

/** Delete a track by trackId */
export async function deleteTrack(trackId: number): Promise<void> {
  await apiInstance.delete(`/api/v1/tracks/${trackId}`);
}

export async function generateLyricsFromBeat(
  trackId: number,
  req: BeatToLyricsRequest
): Promise<TrackSuggestionResponse> {
  const response = await apiInstance.post<ApiResponse<TrackSuggestionResponse>>(
    `/api/v1/tracks/${trackId}/generate-lyrics`,
    req
  );

  return response.data.result;
}
export async function getTracksByProject(
  projectId: number
): Promise<TrackListItemResponse[]> {
  const res = await apiInstance.get<ApiResponse<TrackListItemResponse[]>>(
    `/api/v1/tracks/project/${projectId}`
  );
  return res.data.result;
}

