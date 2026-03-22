import { AlertTriangle } from "lucide-react";

interface RushHourBannerProps {
  show: boolean;
}

export default function RushHourBanner({ show }: RushHourBannerProps) {
  if (!show) return null;

  return (
    <div className="bg-ink border-[1.5px] border-primary-500 rounded-lg p-3.5 flex items-center gap-3.5 shadow-md">
      <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5 text-accent-500" fill="currentColor" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[11px] font-display text-white uppercase tracking-wider leading-none mb-1">
          Rush Hour Traffic
        </p>
        <p className="text-[10px] font-medium text-white/60 leading-tight">
          Expect delays on major arterial roads.
        </p>
      </div>
    </div>
  );
}
