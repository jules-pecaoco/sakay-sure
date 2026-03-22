import { useNavigate } from "react-router-dom";
import AddRouteForm from "@/components/driver/AddRouteForm";
import { ArrowLeft } from "lucide-react";

export default function DriverAddRoutePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white px-4 pt-14 pb-4 shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/driver")}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors -ml-1"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Add route</h1>
          <p className="text-xs text-slate-400">3 steps to publish</p>
        </div>
      </div>

      <AddRouteForm />
    </div>
  );
}
