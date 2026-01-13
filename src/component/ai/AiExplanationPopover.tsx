import { X, Sparkles, Copy, RefreshCw } from "lucide-react";
import {
  ExplanationResponse,
  AiExplanationError,
} from "../../types/aiExplanation";
import { AiLoadingSkeleton } from "./AiLoadingSkeleton";
import { useState } from "react";

interface Props {
  selectedText: string;
  isLoading: boolean;
  explanation: ExplanationResponse | null;
  error: AiExplanationError | null;
  onClose: () => void;
  onRetry: () => void;
  position?: {
    x: number;
    y: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}

export function AiExplanationPopover({
  selectedText,
  isLoading,
  explanation,
  error,
  onClose,
  onRetry,
  position,
}: Props) {
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // ========================================
  // Handle Copy Explanation
  // ========================================
  const handleCopy = () => {
    if (!explanation) return;

    const text = `${selectedText}\n\n${explanation.explanation}`;
    navigator.clipboard.writeText(text);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  // ========================================
  // Calculate Popover Position
  // ========================================
  const getPopoverStyle = (): React.CSSProperties => {
    if (!position) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const popoverWidth = 400; // đúng theo class w-[400px]
    const popoverHeight = 500; // ước lượng, sẽ clamp lại sau
    const padding = 16;

    // Vị trí đầu tiên: phía dưới text
    let top = position.bottom + 10;
    let left = position.left;

    // Nếu popover nằm thấp hơn màn hình → FLIP lên trên
    if (top + popoverHeight > window.innerHeight - padding) {
      top = position.top - popoverHeight - 10;
    }

    // Nếu vẫn vượt quá top màn hình → ép vào trong
    if (top < padding) {
      top = padding;
    }

    // Giới hạn theo chiều ngang
    const maxLeft = window.innerWidth - popoverWidth - padding;

    if (left < padding) left = padding;
    if (left > maxLeft) left = maxLeft;

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  // ========================================
  // Render
  // ========================================
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Popover Card */}
      <div
        className="fixed z-50 w-[400px] max-w-[90vw] max-h-[80vh] overflow-auto
                   bg-gray-900/95
                   border border-purple-500/30 rounded-2xl 
                   shadow-2xl shadow-purple-900/50"
        style={getPopoverStyle()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 border-b border-purple-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            <h3 className="text-white font-semibold">AI Explanation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close explanation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Selected Text */}
          <div>
            <p className="text-xs text-gray-400 mb-1">📌 Selected:</p>
            <p className="text-white font-medium bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20">
              {selectedText}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && <AiLoadingSkeleton />}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm mb-3">{error.message}</p>
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 
                           border border-red-500/40 rounded-lg text-red-400 text-sm"
              >
                <RefreshCw size={14} />
                Thử lại
              </button>
            </div>
          )}

          {/* Explanation */}
          {explanation && (
            <>
              <div>
                <p className="text-xs text-gray-400 mb-2">🇻🇳 Giải thích:</p>
                <div className="text-gray-200 text-sm leading-relaxed bg-gray-800/50 px-4 py-3 rounded-lg">
                  {explanation.explanation}
                </div>
              </div>

              {/* Related Terms */}
              {explanation.relatedTerms.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    📚 Thuật ngữ liên quan:
                  </p>
                  <div className="space-y-2">
                    {explanation.relatedTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 bg-gray-800/30 px-3 py-2 rounded-lg 
                                   hover:bg-gray-800/50"
                      >
                        <span className="text-cyan-400 text-sm">•</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {term.term}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Tương đồng: {(term.similarity * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                <div className="text-xs text-gray-500">
                  ⚡ {explanation.processingTimeMs}ms • {explanation.model}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 
                             border border-purple-500/40 rounded-lg text-purple-400 text-sm"
                >
                  <Copy size={14} />
                  {showCopySuccess ? "Copied!" : "Copy"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}