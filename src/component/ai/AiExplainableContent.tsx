import { useState, useCallback, useRef, useEffect } from 'react';
import { TextSelection, AiButtonPosition } from '../../types/aiExplanation';
import { AI_EXPLANATION_CONFIG } from '../../config/aiExplanationConfig';
import { useAiExplanation } from '../hooks/useAiExplanation';
import { FloatingAiButton } from './FloatingAiButton';
import { AiExplanationPopover } from './AiExplanationPopover';

interface Props {
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
}

export function AiExplainableContent({
  children,
  enabled = true,
  className = ''
}: Props) {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [buttonPosition, setButtonPosition] = useState<AiButtonPosition | null>(null);
  const [showPopover, setShowPopover] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isLoading,
    explanation,
    error,
    getExplanation,
    clearExplanation,
    retryLastRequest,
  } = useAiExplanation();

  // ========================================
  // Handle Text Selection
  // ========================================
  const handleMouseUp = useCallback(() => {
    if (!enabled) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce to avoid flickering
    debounceTimerRef.current = setTimeout(() => {
      const windowSelection = window.getSelection();
      const selectedText = windowSelection?.toString().trim();

      if (
        !selectedText ||
        selectedText.length < AI_EXPLANATION_CONFIG.ui.minTextLength ||
        selectedText.length > AI_EXPLANATION_CONFIG.ui.maxTextLength
      ) {
        setSelection(null);
        setButtonPosition(null);
        return;
      }

      // Get selection position
      const range = windowSelection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (!rect) return;

      // Calculate button position (above selection)
      // Using fixed positioning, so NO scrollY/scrollX needed
      const position: AiButtonPosition = {
        top: rect.top - 60, // 60px above selection (fixed position)
        left: rect.left + rect.width / 2, // centered horizontally
      };

      // Get context (surrounding text) - optional
      const contextText = getContextText(range);

      setSelection({
        text: selectedText,
        position: {
          x: rect.left,
          y: rect.top,
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
        },
        context: contextText,
      });
      setButtonPosition(position);
    }, AI_EXPLANATION_CONFIG.ui.buttonDelay);
  }, [enabled]);

  // ========================================
  // Handle Click AI Button
  // ========================================
  const handleAskAi = useCallback(async () => {
    if (!selection) return;

    setShowPopover(true);

    await getExplanation({
      highlightedText: selection.text,
      contextText: selection.context,
      maxRelatedTerms: AI_EXPLANATION_CONFIG.features.maxRelatedTerms,
      language: 'vi',
    });
  }, [selection, getExplanation]);

  // ========================================
  // Handle Close Popover
  // ========================================
  const handleClosePopover = useCallback(() => {
    setShowPopover(false);
    setSelection(null);
    setButtonPosition(null);
    clearExplanation();
  }, [clearExplanation]);

  // ========================================
  // Keyboard Shortcuts
  // ========================================
  useEffect(() => {
    if (!AI_EXPLANATION_CONFIG.features.keyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+E or Cmd+Shift+E
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        if (selection) {
          handleAskAi();
        }
      }

      // Escape to close
      if (e.key === 'Escape' && showPopover) {
        handleClosePopover();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, showPopover, handleAskAi, handleClosePopover]);

  // ========================================
  // Helper: Get Context Text
  // ========================================
  function getContextText(range: Range | undefined): string | undefined {
    if (!range) return undefined;

    const container = range.commonAncestorContainer;
    const parentText = container.parentElement?.textContent || '';

    // Return up to 200 chars of surrounding text
    return parentText.slice(0, 200);
  }

  // ========================================
  // Render
  // ========================================
  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseUp={handleMouseUp}
    >
      {children}

      {/* Floating AI Button */}
      {buttonPosition && !showPopover && (
        <FloatingAiButton
          position={buttonPosition}
          onClick={handleAskAi}
        />
      )}

      {/* Explanation Popover */}
      {showPopover && (
        <AiExplanationPopover
          selectedText={selection?.text || ''}
          isLoading={isLoading}
          explanation={explanation}
          error={error}
          onClose={handleClosePopover}
          onRetry={retryLastRequest}
          position={selection?.position}
        />
      )}
    </div>
  );
}
