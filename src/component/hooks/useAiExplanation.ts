import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ExplanationRequest,
  ExplanationResponse,
  AiExplanationError,
} from '../../types/aiExplanation';
import { aiExplanationService } from '../../services/aiExplanationService';
import { aiExplanationCache } from '../../utils/aiExplanationCache';

interface UseAiExplanationReturn {
  isLoading: boolean;
  explanation: ExplanationResponse | null;
  error: AiExplanationError | null;
  getExplanation: (request: ExplanationRequest) => Promise<void>;
  clearExplanation: () => void;
  retryLastRequest: () => Promise<void>;
}

export function useAiExplanation(): UseAiExplanationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [error, setError] = useState<AiExplanationError | null>(null);

  const lastRequestRef = useRef<ExplanationRequest | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ========================================
  // Cleanup on unmount
  // ========================================
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ========================================
  // Main Function: Get Explanation
  // ========================================
  const getExplanation = useCallback(async (request: ExplanationRequest) => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Save for retry
    lastRequestRef.current = request;

    // Reset state
    setError(null);
    setExplanation(null);

    // Check cache first
    const cached = aiExplanationCache.get(request.highlightedText);
    if (cached) {
      console.log('[AiExplanation] Using cached result');
      setExplanation(cached);
      // TODO: Integrate CosmicToast for cache hit notification
      return;
    }

    // Call API
    setIsLoading(true);

    try {
      const result = await aiExplanationService.getExplanation(request);

      // Save to cache
      aiExplanationCache.set(request.highlightedText, result);

      setExplanation(result);
      setError(null);
    } catch (err) {
      const aiError = err as AiExplanationError;
      setError(aiError);
      setExplanation(null);

      // TODO: Integrate CosmicToast for error notification
      console.error('[AiExplanation] Error:', aiError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // Clear State
  // ========================================
  const clearExplanation = useCallback(() => {
    setExplanation(null);
    setError(null);
    setIsLoading(false);
    abortControllerRef.current?.abort();
  }, []);

  // ========================================
  // Retry Last Request
  // ========================================
  const retryLastRequest = useCallback(async () => {
    if (lastRequestRef.current) {
      await getExplanation(lastRequestRef.current);
    }
  }, [getExplanation]);

  return {
    isLoading,
    explanation,
    error,
    getExplanation,
    clearExplanation,
    retryLastRequest,
  };
}
