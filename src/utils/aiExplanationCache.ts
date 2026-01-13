import {
  AiExplanationCache,
  ExplanationResponse,
} from '../types/aiExplanation';
import { AI_EXPLANATION_CONFIG } from '../config/aiExplanationConfig';

const STORAGE_KEY = AI_EXPLANATION_CONFIG.cache.storageKey;
const TTL = AI_EXPLANATION_CONFIG.cache.ttl;
const MAX_SIZE = AI_EXPLANATION_CONFIG.cache.maxSize;

// ========================================
// Cache Helper Functions
// ========================================

export const aiExplanationCache = {
  /**
   * Get cached explanation
   */
  get(text: string): ExplanationResponse | null {
    if (!AI_EXPLANATION_CONFIG.cache.enabled) return null;

    try {
      const cache = this.getCache();
      const key = this.generateKey(text);
      const cached = cache[key];

      if (!cached) return null;

      // Check if expired
      if (Date.now() - cached.timestamp > cached.ttl) {
        this.remove(text);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('[AiCache] Error reading cache:', error);
      return null;
    }
  },

  /**
   * Save to cache
   */
  set(text: string, data: ExplanationResponse): void {
    if (!AI_EXPLANATION_CONFIG.cache.enabled) return;

    try {
      const cache = this.getCache();
      const key = this.generateKey(text);

      // Check cache size limit
      const keys = Object.keys(cache);
      if (keys.length >= MAX_SIZE) {
        // Remove oldest entry
        const oldestKey = keys.reduce((oldest, currentKey) => {
          return cache[currentKey].timestamp < cache[oldest].timestamp
            ? currentKey
            : oldest;
        }, keys[0]);
        delete cache[oldestKey];
      }

      cache[key] = {
        data,
        timestamp: Date.now(),
        ttl: TTL,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('[AiCache] Error writing cache:', error);
    }
  },

  /**
   * Remove from cache
   */
  remove(text: string): void {
    try {
      const cache = this.getCache();
      const key = this.generateKey(text);
      delete cache[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('[AiCache] Error removing from cache:', error);
    }
  },

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[AiCache] Error clearing cache:', error);
    }
  },

  /**
   * Get cache stats
   */
  getStats(): { size: number; oldestTimestamp: number | null } {
    const cache = this.getCache();
    const keys = Object.keys(cache);

    if (keys.length === 0) {
      return { size: 0, oldestTimestamp: null };
    }

    const oldestTimestamp = Math.min(...keys.map((k) => cache[k].timestamp));

    return {
      size: keys.length,
      oldestTimestamp,
    };
  },

  // ========================================
  // Private Helpers
  // ========================================

  getCache(): AiExplanationCache {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  generateKey(text: string): string {
    // Normalize: lowercase + trim + remove extra spaces
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  },
};
