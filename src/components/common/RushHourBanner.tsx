import { AlertTriangle } from "lucide-react";

export default function RushHourBanner({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
      <span className="text-orange-800 text-sm font-medium">Rush hour conditions detected. Expect delays and crowded vehicles.</span>
    </div>
  );
}
