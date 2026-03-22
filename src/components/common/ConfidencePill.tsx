import type { ConfidenceLevel } from "@/types";

interface ConfidencePillProps {
  level: ConfidenceLevel;
  layersUsed: string[];
}

export default function ConfidencePill({ level, layersUsed }: ConfidencePillProps) {
  const config = {
    low: { bg: "bg-red-50 text-red-700 border-red-200", icon: "⚠️", label: "Low Confidence" },
    medium: { bg: "bg-yellow-50 text-yellow-800 border-yellow-200", icon: "⚡", label: "Medium Confidence" },
    high: { bg: "bg-green-50 text-green-700 border-green-200", icon: "✨", label: "High Confidence" },
  };

  const { bg, icon, label } = config[level] || config.medium;

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${bg}`}>
        <span>{icon}</span>
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
