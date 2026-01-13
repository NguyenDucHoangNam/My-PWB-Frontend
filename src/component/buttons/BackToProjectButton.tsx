import { Undo2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTER } from "@/routes/router";

interface BackToProjectButtonProps {
  projectId?: string | number | null;
}

export default function BackToProjectButton({
  projectId,
}: BackToProjectButtonProps = {}) {
  const navigate = useNavigate();

  const goBack = () => {
    if (projectId) {
      navigate(`${ROUTER.USER.PROJECTDETAIL}?id=${projectId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(ROUTER.USER.HOME);
    }
  };

  return (
    <div className="flex gap-4 mt-8">
      <button
        className="relative px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-cyan-400/30 backdrop-blur-sm hover:border-cyan-300/50 hover:opacity-90 transition-all"
        onClick={goBack}
      >
        <div className="flex items-center gap-3">
          <Undo2 size={20} className="text-cyan-300" />
          <span className="font-bold text-cyan-200">Quay lại</span>
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>
      </button>
    </div>
  );
}
