import { Sparkles } from "lucide-react";
import { AiButtonPosition } from "../../types/aiExplanation";

interface Props {
  position: AiButtonPosition;
  onClick: () => void;
}

export function FloatingAiButton({ position, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed z-[9999] flex items-center gap-1.5 px-3 py-1.5 
                 bg-purple-600/95 hover:bg-purple-500 
                 border border-purple-400/50 
                 rounded-full shadow-lg shadow-purple-500/50 
                 hover:shadow-purple-500/70
                 text-white text-sm font-medium"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <Sparkles size={16} />
      <span>Ask AI</span>
    </button>
  );
}
