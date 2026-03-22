import { User, TramFront } from "lucide-react";
import type { UserRole } from "@/types";
import type { ReactNode } from "react";

interface RoleSelectorProps {
  selected: UserRole | null;
  onChange: (role: UserRole) => void;
}

const ROLES: {
  value: UserRole;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    value: "commuter",
    label: "Commuter",
    description: "Look for routes and real-time ETAs.",
    icon: <User className="w-8 h-8" />,
  },
  {
    value: "driver",
    label: "Driver",
    description: "Share your route and go active.",
    icon: <TramFront className="w-8 h-8" />,
  },
];

export default function RoleSelector({ selected, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="section-label pl-1">I am a...</p>
      <div className="grid grid-cols-2 gap-4">
        {ROLES.map((role) => {
          const isSelected = selected === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`
                flex flex-col items-start gap-4 rounded-xl border-[2px] p-5 text-left
                transition-all duration-200 cursor-pointer select-none relative overflow-hidden
                ${isSelected 
                  ? "border-primary-500 bg-white shadow-[6px_6px_0px_0px_rgba(232,50,26,0.1)]" 
                  : "border-slate-200 bg-white hover:border-ink hover:bg-surface/50 opacity-100"}
              `}
            >
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                ${isSelected ? "bg-primary-500 text-white" : "bg-surface text-muted"}
              `}>
                {role.icon}
              </div>
              <div>
                <span className={`block text-lg font-display uppercase tracking-tight leading-none mb-1 ${isSelected ? "text-primary-500" : "text-ink"}`}>
                  {role.label}
                </span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-tight leading-tight block">
                  {role.description}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
