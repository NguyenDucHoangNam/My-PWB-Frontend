// src/pages/project/live-room/KeyboardShortcuts.tsx

import React from "react";

const KeyboardShortcuts: React.FC = () => {
  return (
    <div className="fixed top-20 right-4 w-44 text-xs text-white/90 bg-[#0B0E1E]/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-purple-500/40 shadow-2xl z-[9999]">
      {/* Holographic Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-[1px] -z-10">
        <div className="w-full h-full rounded-2xl bg-[#0B0E1E]/95"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <h4 className="text-purple-300 font-bold text-sm mb-3 tracking-wide drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
          Phím tắt
        </h4>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <kbd className="bg-purple-600/30 text-purple-200 px-2.5 py-1 rounded-lg font-mono text-xs border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              S
            </kbd>
            <span className="truncate text-gray-300">Tắt/bật mic</span>
          </div>
          <div className="flex items-center gap-2.5">
            <kbd className="bg-purple-600/30 text-purple-200 px-2.5 py-1 rounded-lg font-mono text-xs border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              V
            </kbd>
            <span className="truncate text-gray-300">Tắt/bật video</span>
          </div>
          <div className="flex items-center gap-2.5">
            <kbd className="bg-purple-600/30 text-purple-200 px-2.5 py-1 rounded-lg font-mono text-xs border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              ESC
            </kbd>
            <span className="truncate text-gray-300">Ẩn/hiện sidebar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;

