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
  color: string;
  activeColor: string;
}[] = [
  {
    value: "commuter",
    label: "Commuter",
    description: "Find routes, view ETAs, and share tips with the community.",
    icon: <User className="w-7 h-7" />,
    color: "border-slate-200 bg-white text-slate-700",
    activeColor: "border-primary-500 bg-primary-50 text-primary-800 ring-2 ring-primary-500/20",
  },
  {
    value: "driver",
    label: "Driver",
    description: "Register your route, set your schedule, and go active.",
    icon: <TramFront className="w-7 h-7" />,
    color: "border-slate-200 bg-white text-slate-700",
    activeColor: "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20",
  },
];

export default function RoleSelector({ selected, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-600">I am a…</p>
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((role) => {
          const isSelected = selected === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`
                flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center
                transition-all duration-150 cursor-pointer select-none
                ${isSelected ? role.activeColor : role.color}
                hover:border-slate-300
              `}
            >
              <span className={isSelected && role.value === "commuter" ? "text-primary-600" : isSelected ? "text-amber-600" : "text-slate-400"}>
                {role.icon}
              </span>
              <span className="text-sm font-semibold">{role.label}</span>
              <span className="text-xs leading-snug opacity-70">{role.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
