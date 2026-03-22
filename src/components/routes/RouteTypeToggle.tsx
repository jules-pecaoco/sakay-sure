import type { JSX } from "react";

export type RouteFilter = "all" | "driver" | "commuter";

interface RouteTypeToggleProps {
  value: RouteFilter;
  onChange: (value: RouteFilter) => void;
  driverCount: number;
  commuterCount: number;
}

export default function RouteTypeToggle({ value, onChange, driverCount, commuterCount }: RouteTypeToggleProps): JSX.Element {
  return (
    <div className="flex p-1 bg-surface rounded-lg gap-1">
      <ToggleItem
        active={value === "all"}
        onClick={() => onChange("all")}
        label="All"
        count={driverCount + commuterCount}
      />
      <ToggleItem
        active={value === "driver"}
        onClick={() => onChange("driver")}
        label="Drivers"
        count={driverCount}
      />
      <ToggleItem
        active={value === "commuter"}
        onClick={() => onChange("commuter")}
        label="Community"
        count={commuterCount}
      />
    </div>
  );
}

function ToggleItem({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-[6px] transition-all
        text-[10px] font-display uppercase tracking-widest
        ${active 
          ? "bg-ink text-white shadow-md border border-ink" 
          : "text-muted hover:text-ink hover:bg-white/50"}
      `}
    >
      <span>{label}</span>
      <span className={`
        px-1.5 py-0.5 rounded-md text-[9px] font-bold border
        ${active ? "bg-primary-500 border-primary-600 text-white" : "bg-white border-slate-200 text-slate-400"}
      `}>
        {count}
      </span>
    </button>
  );
}
