import ConfidencePill from "@/components/common/ConfidencePill";
import RushHourBanner from "@/components/common/RushHourBanner";
import { Timer, TramFront, Clock } from "lucide-react";
import type { PredictionResult } from "@/types";
import type { ReactNode } from "react";

interface PredictionCardProps {
  prediction: PredictionResult;
  routeName: string;
}

export default function PredictionCard({ prediction, routeName }: PredictionCardProps) {
  const { etaRange, vehicleRange, bestTimeWindow, isRushHour, confidence, layersUsed } = prediction;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Prediction for</p>
        <h3 className="font-bold text-slate-800 text-base leading-tight">{routeName}</h3>
      </div>

      {isRushHour && (
        <div className="px-4 pt-3">
          <RushHourBanner show={isRushHour} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-px bg-slate-100 mt-3">
        <MetricTile icon={<Timer className="w-4 h-4" />} label="ETA range" value={`${etaRange.min}–${etaRange.max} min`} sub="estimated wait" highlight={isRushHour} />
        <MetricTile icon={<TramFront className="w-4 h-4" />} label="Vehicles arriving" value={`${vehicleRange.min}–${vehicleRange.max}`} sub="in next 30 min" />
        <MetricTile icon={<Clock className="w-4 h-4" />} label="Best time to leave" value={`${bestTimeWindow.from} – ${bestTimeWindow.to}`} sub="off-peak window" colSpan />
      </div>

      <div className="px-4 py-3">
        <ConfidencePill level={confidence} layersUsed={layersUsed} />
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  sub,
  highlight = false,
  colSpan = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  colSpan?: boolean;
}) {
  return (
    <div className={`bg-white px-4 py-3.5 flex flex-col gap-1 ${colSpan ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-primary-500">{icon}</span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold tracking-tight ${highlight ? "text-orange-600" : "text-slate-800"}`}>{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}
