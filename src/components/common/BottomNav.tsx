import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Search, Sun, PlusCircle, User, LayoutGrid } from "lucide-react";
import type { JSX } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
}

const COMMUTER_NAV: NavItem[] = [
  {
    to: "/explore",
    label: "Explore",
    icon: (active) => <Search className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    to: "/predict",
    label: "Predict",
    icon: (active) => <Sun className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    to: "/commuter/add-route",
    label: "Add Route",
    icon: (active) => <PlusCircle className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (active) => <User className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
];

const DRIVER_NAV: NavItem[] = [
  {
    to: "/driver",
    label: "Dashboard",
    icon: (active) => <LayoutGrid className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    to: "/driver/add-route",
    label: "Add Route",
    icon: (active) => <PlusCircle className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
  {
    to: "/driver/profile",
    label: "Profile",
    icon: (active) => <User className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />,
  },
];

export default function BottomNav() {
  const { user } = useAuth();
  const items = user?.role === "driver" ? DRIVER_NAV : COMMUTER_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-ink safe-area-inset-bottom border-t border-white/5">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/driver"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-all min-w-14 relative
              ${isActive ? "text-white" : "text-muted hover:text-white/80"}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`transition-transform duration-200 ${isActive ? "-translate-y-1" : ""}`}>
                  {item.icon(isActive)}
                </div>
                <span className={`text-[10px] font-medium tracking-tight ${isActive ? "text-white opacity-100" : "text-muted opacity-80"}`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(232,50,26,0.6)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
