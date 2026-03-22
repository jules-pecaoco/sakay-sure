import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAllRoutes } from "@/hooks/useAllRoutes";
import { updateCommuterRoute } from "@/services/firebase/commuterRoutes";
import { fetchRouteGeometry } from "@/services/mapbox/directions";
import { useUserLocation } from "@/hooks/useUserLocation";
import FormField from "@/components/common/FormField";
import StopSearchInput from "@/components/map/StopSearchInput";
import RouteMapPreview from "@/components/map/RouteMapPreview";
import LocationPermissionBanner from "@/components/common/LocationPermissionBanner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Lock, X } from "lucide-react";
import type { Stop, CommuterRouteTips } from "@/types";
import TopBar from "@/components/common/TopBar";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-primary-500" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

export default function EditCommuterRoutePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { commuterRoutes, loading } = useAllRoutes();
  const { location: userLocation, status: locationStatus, request: requestLocation } = useUserLocation();

  const route = commuterRoutes.find((r) => r.id === id);

  const [name, setName] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [geometry, setGeometry] = useState<GeoJSON.LineString | null>(null);
  const [fare, setFare] = useState("");
  const [notes, setNotes] = useState("");
  const [isCashOnly, setIsCashOnly] = useState(false);
  const [hasAC, setHasAC] = useState(false);
  const [hazards, setHazards] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!route) return;
    setName(route.name);
    setStops(route.stops);
    setGeometry(route.geometry);
    setFare(route.tips.fare);
    setNotes(route.tips.notes);
    setIsCashOnly(route.tips.isCashOnly);
    setHasAC(route.tips.hasAC);
    setHazards(route.tips.hazards);
  }, [route]);

  async function handleAddStop(partial: Omit<Stop, "id">) {
    const stop: Stop = { id: crypto.randomUUID(), ...partial };
    const newStops = [...stops, stop];
    setStops(newStops);
    if (newStops.length >= 2) {
      const geo = await fetchRouteGeometry(newStops.map((s) => s.coordinates));
      setGeometry(geo);
    }
  }

  function handleRemoveStop(stopId: string) {
    const newStops = stops.filter((s) => s.id !== stopId);
    setStops(newStops);
    if (newStops.length < 2) setGeometry(null);
  }

  async function handleSave() {
    if (!route || !user) return;
    if (route.authorId !== user.uid) {
      setError("You can only edit your own routes.");
      return;
    }
    if (stops.length < 2) {
      setError("Add at least 2 stops.");
      return;
    }
    if (!name.trim()) {
      setError("Route name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const tips: CommuterRouteTips = {
      fare: fare.trim(),
      notes: notes.trim(),
      isCashOnly,
      hasAC,
      hazards: hazards.trim(),
    };
    try {
      await updateCommuterRoute(route.id, { name: name.trim(), stops, geometry, tips });
      navigate("/explore");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const proximity = userLocation ? ([userLocation.lng, userLocation.lat] as [number, number]) : undefined;

  if (loading) return <LoadingSpinner fullScreen message="Loading route…" />;

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-slate-500">Route not found.</p>
        <button onClick={() => navigate("/explore")} className="text-primary-600 text-sm font-semibold">
          Back to Explore
        </button>
      </div>
    );
  }

  // Block if not the author
  if (user && route.authorId !== user.uid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <Lock className="w-7 h-7 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700">Not your route</p>
        <p className="text-sm text-slate-400">You can only edit routes you've submitted.</p>
        <button onClick={() => navigate("/explore")} className="text-primary-600 text-sm font-semibold">
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar 
        title="Edit Guide" 
      />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        <FormField label="Route name" value={name} onChange={(e) => setName(e.target.value)} />

        {/* Stops */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Stops</p>
          <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />
          <StopSearchInput onSelect={handleAddStop} proximity={proximity} />

          {stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5">
              <span
                className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0
                ${i === 0 ? "bg-green-100 text-green-700" : i === stops.length - 1 ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-600"}`}
              >
                {i === 0 ? "S" : i === stops.length - 1 ? "E" : i}
              </span>
              <span className="flex-1 text-sm text-slate-700 truncate">{stop.name.split(",")[0]}</span>
              <button type="button" onClick={() => handleRemoveStop(stop.id)} className="p-1 text-red-400 hover:text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <RouteMapPreview stops={stops} geometry={geometry} userLocation={userLocation} />
        </div>

        {/* Tips */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700">Tips & info</p>
          <FormField label="Typical fare (₱)" type="number" placeholder="e.g. 13" value={fare} onChange={(e) => setFare(e.target.value)} />

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <Toggle label="Cash only" description="No GCash or card" checked={isCashOnly} onChange={setIsCashOnly} />
            <div className="h-px bg-slate-100" />
            <Toggle label="Air-conditioned" description="Vehicle has working A/C" checked={hasAC} onChange={setHasAC} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Hazards or warnings</label>
            <input
              type="text"
              placeholder="e.g. Flooded at Colon during rain"
              value={hazards}
              onChange={(e) => setHazards(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Additional notes</label>
            <textarea
              placeholder="e.g. Jeepneys only run until 9 PM."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 resize-none"
            />
          </div>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 active:scale-[.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
}
