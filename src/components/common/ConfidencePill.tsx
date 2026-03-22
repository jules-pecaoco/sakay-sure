import { AlertTriangle, Zap, Sparkles } from "lucide-react";
import type { ConfidenceLevel } from "@/types";
import type { ReactNode } from "react";

interface ConfidencePillProps {
  level: ConfidenceLevel;
  layersUsed: string[];
}

export default function ConfidencePill({ level, layersUsed }: ConfidencePillProps) {
  const config: Record<ConfidenceLevel, { bg: string; icon: ReactNode; label: string }> = {
    low: { bg: "bg-red-50 text-red-700 border-red-200", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Low Confidence" },
    medium: { bg: "bg-yellow-50 text-yellow-800 border-yellow-200", icon: <Zap className="w-3.5 h-3.5" />, label: "Medium Confidence" },
    high: { bg: "bg-green-50 text-green-700 border-green-200", icon: <Sparkles className="w-3.5 h-3.5" />, label: "High Confidence" },
  };

  const { bg, icon, label } = config[level] || config.medium;

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${bg}`}>
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      
      {layersUsed && layersUsed.length > 0 && (
        <p className="text-[11px] text-slate-500">
          Based on data from: {layersUsed.join(", ")}
        </p>
      )}
    </div>
  );
}
