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
    icon: (active) => <Search className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />,
  },
  {
    to: "/predict",
    label: "Predict",
    icon: (active) => <Sun className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />,
  },
  {
    to: "/commuter/add-route",
    label: "Add Route",
    icon: (active) => <PlusCircle className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (active) => <User className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />,
  },
];

const DRIVER_NAV: NavItem[] = [
  {
    to: "/driver",
    label: "Dashboard",
    icon: (active) => <LayoutGrid className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />,
  },
  {
    to: "/driver/add-route",
    label: "Add Route",
    icon: (active) => <PlusCircle className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />,
  },
  {
    to: "/driver/profile",
    label: "Profile",
    icon: (active) => <User className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />,
  },
];

export default function BottomNav() {
  const { user } = useAuth();
  const items = user?.role === "driver" ? DRIVER_NAV : COMMUTER_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/driver"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors min-w-14
              ${isActive ? "text-primary-600" : "text-slate-400 hover:text-slate-600"}`
            }
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span className={`text-[10px] font-medium ${isActive ? "text-primary-600" : "text-slate-400"}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
