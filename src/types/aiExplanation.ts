// ========================================
// Request/Response Types (Match Backend)
// ========================================

export interface ExplanationRequest {
  highlightedText: string;
  contextText?: string;
  maxRelatedTerms?: number;  // default: 3
  language?: 'vi' | 'en';    // default: 'vi'
}

export interface RelatedTerm {
  term: string;
  definition: string;
  similarity: number;      // 0.0 to 1.0
  category?: string;
  examples?: string[];
}

export interface ExplanationResponse {
  originalText: string;
  explanation: string;
  relatedTerms: RelatedTerm[];
  processingTimeMs: number;
  foundInDatabase: boolean;
  model: string;           // "gemini-2.5-flash"
}

// ========================================
// API Response Wrapper (Backend format)
// ========================================

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ========================================
// UI State Types
// ========================================

export interface TextSelection {
  text: string;
  position: {
    x: number;
    y: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  context?: string;  // Surrounding text for context
}

export interface AiButtonPosition {
  top: number;
  left: number;
}

// ========================================
// Cache Types
// ========================================

export interface CachedExplanation {
  data: ExplanationResponse;
  timestamp: number;
  ttl: number;  // Time to live in ms
}

export interface AiExplanationCache {
  [key: string]: CachedExplanation;  // key = lowercase(highlightedText)
}

// ========================================
// Error Types
// ========================================

export interface AiExplanationError {
  code: number;
  message: string;
  type: 'RATE_LIMIT' | 'SERVICE_UNAVAILABLE' | 'NETWORK_ERROR' | 'UNKNOWN';
}
