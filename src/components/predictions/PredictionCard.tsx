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
    <div className="bg-white rounded-xl border-[1.5px] border-ink overflow-hidden shadow-[6px_6px_0px_0px_rgba(26,18,8,0.05)]">
      <div className="px-5 pt-5 pb-4 border-b-[1.5px] border-slate-100 bg-surface/30">
        <p className="section-label mb-1">Estimation For</p>
        <h3 className="font-display text-xl text-ink leading-tight uppercase tracking-tight">{routeName}</h3>
      </div>

      {isRushHour && (
        <div className="px-5 pt-4">
          <RushHourBanner show={isRushHour} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-[1.5px] bg-ink/10 mt-4 border-y-[1.5px] border-ink/10">
        <MetricTile 
          icon={<Timer className="w-4 h-4" strokeWidth={2.5} />} 
          label="ETA Window" 
          value={`${etaRange.min}–${etaRange.max} min`} 
          sub="Estimated Arrival" 
          highlight={isRushHour} 
        />
        <MetricTile 
          icon={<TramFront className="w-4 h-4" strokeWidth={2.5} />} 
          label="Vehicles Near" 
          value={`${vehicleRange.min}–${vehicleRange.max}`} 
          sub="Next 30 Mins" 
        />
        <MetricTile 
          icon={<Clock className="w-4 h-4" strokeWidth={2.5} />} 
          label="Off-Peak Window" 
          value={`${bestTimeWindow.from} – ${bestTimeWindow.to}`} 
          sub="Best Time To Leave" 
          colSpan 
        />
      </div>

      <div className="px-5 py-4 bg-surface/10">
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
    <div className={`bg-white px-5 py-4 flex flex-col gap-1.5 ${colSpan ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="text-primary-500">{icon}</span>
        <span className="section-label !text-muted">{label}</span>
      </div>
      <p className={`text-2xl font-display uppercase tracking-tighter leading-none ${highlight ? "text-primary-500" : "text-ink"}`}>
        {value}
      </p>
      <p className="text-[10px] font-bold text-muted uppercase tracking-tight">{sub}</p>
    </div>
  );
}
