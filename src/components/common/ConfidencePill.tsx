import { AlertTriangle, Zap, Sparkles } from "lucide-react";
import type { ConfidenceLevel } from "@/types";
import type { ReactNode } from "react";

interface ConfidencePillProps {
  level: ConfidenceLevel;
  layersUsed: string[];
}

export default function ConfidencePill({ level, layersUsed }: ConfidencePillProps) {
  const config: Record<ConfidenceLevel, { color: string; icon: ReactNode; label: string }> = {
    low: { color: "bg-primary-500 text-white border-ink", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Low Confidence" },
    medium: { color: "bg-accent-500 text-ink border-ink", icon: <Zap className="w-3.5 h-3.5" />, label: "Average Info" },
    high: { color: "bg-green-500 text-white border-ink", icon: <Sparkles className="w-3.5 h-3.5" />, label: "High Accuracy" },
  };

  const { color, icon, label } = config[level] || config.medium;

  return (
    <div className="flex flex-col gap-2.5">
      <div className={`inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-[6px] text-[10px] font-display uppercase tracking-wider border-[1.5px] shadow-sm ${color}`}>
        {icon}
        <span>{label}</span>
      </div>
      
      {layersUsed && layersUsed.length > 0 && (
        <p className="text-[10px] font-bold text-muted uppercase tracking-tight pl-0.5">
          Based on: <span className="text-ink">{layersUsed.join(", ")}</span>
        </p>
      )}
    </div>
  );
}
