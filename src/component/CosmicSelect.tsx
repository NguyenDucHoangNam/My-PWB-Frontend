import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const CosmicSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative group min-w-[11rem]">
      <label className="absolute -top-4 left-2 text-xs font-semibold tracking-wide text-purple-400/80">
        {label}
      </label>

      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-gradient-to-br from-[#1a0026]/80 via-[#2a0044]/60 to-[#1a0026]/80
          border border-purple-700/50 text-white rounded-xl px-4 py-3 pr-10 text-left
          backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]
          hover:shadow-[0_0_25px_rgba(192,132,252,0.25)]
          focus:shadow-[0_0_35px_rgba(236,72,153,0.4)]
          hover:border-purple-400/70 focus:ring-2 focus:ring-fuchsia-500/50 focus:outline-none
          transition-all duration-500 ease-in-out font-medium text-sm relative z-10"
      >
        {options.find((o) => o.value === value)?.label}
        <ChevronDown
          className={`absolute right-3 top-3 w-4 h-4 text-purple-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 🌠 Dropdown animation */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[100] mt-2 w-full rounded-xl overflow-hidden 
              border border-purple-800/40 bg-gradient-to-br from-[#140026]/95 via-[#220044]/90 to-[#1a0035]/95
              backdrop-blur-xl shadow-[0_0_25px_rgba(192,132,252,0.3)]"
          >
            {options.map((opt) => (
              <motion.li
                key={opt.value}
                whileHover={{ backgroundColor: "rgba(168,85,247,0.15)" }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 text-sm text-white/90 transition-all ${
                  value === opt.value ? "text-fuchsia-400" : "hover:text-purple-300"
                }`}
              >
                {opt.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* 🌈 Glow */}
      <motion.div
        className="absolute pointer-events-none inset-0 rounded-xl bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 blur-xl"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
};
export default CosmicSelect