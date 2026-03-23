import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { createCommuterRoute } from "@/services/firebase/commuterRoutes";
import { fetchRouteGeometry } from "@/services/mapbox/directions";
import { useUserLocation } from "@/hooks/useUserLocation";
import FormField from "@/components/common/FormField";
import StopSearchInput from "@/components/map/StopSearchInput";
import RouteMapPreview from "@/components/map/RouteMapPreview";
import LocationPermissionBanner from "@/components/common/LocationPermissionBanner";
import { Check, X, ChevronUp, ChevronDown, Megaphone, Banknote, Snowflake, AlertTriangle, Navigation, CreditCard, MapPin } from "lucide-react";
import { reverseGeocode } from "@/services/mapbox/geocoder";
import type { Stop, CommuterRouteTips } from "@/types";

// ─── Step bar ─────────────────────────────────────────────────────────────────

const STEPS = ["Basics", "Stops", "Tips"] as const;
type StepIndex = 0 | 1 | 2;

function StepBar({ current }: { current: StepIndex }) {
  return (
    <div className="flex items-center gap-3 mb-8 bg-white border-[1.5px] border-slate-200 rounded-xl p-3 shadow-sm">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1 relative">
             <div className={`
              flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-display shrink-0 border-[1.5px] transition-all
              ${done ? 'bg-primary-500 border-ink text-white shadow-sm' : active ? 'bg-white border-primary-500 text-primary-500 shadow-md scale-110' : 'bg-surface border-slate-200 text-muted'}
            `}>
              {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-[9px] font-display uppercase tracking-widest hidden sm:block ${active ? 'text-ink' : done ? 'text-muted' : 'text-muted/50'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full mx-1 ${done ? 'bg-primary-500' : "bg-slate-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

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
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border-[1.5px] border-slate-100 bg-surface/30">
      <div>
        <p className="text-[10px] font-display uppercase tracking-widest text-ink leading-tight mb-1">{label}</p>
        {description && <p className="text-[10px] font-bold text-muted uppercase tracking-tight leading-none">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-12 h-7 rounded-lg transition-all shrink-0 border-[1.5px]
          ${checked ? "bg-primary-500 border-ink" : "bg-slate-200 border-slate-300"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-sm shadow-sm
            transition-transform duration-200
            ${checked ? "translate-x-5 bg-accent-500" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function AddCommuterRouteForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { location: userLocation, status: locationStatus, request: requestLocation } = useUserLocation();

  const [step, setStep] = useState<StepIndex>(0);

  // Step 1 — Route basics
  const [name, setName] = useState("");
  const [step1Errors, setStep1Errors] = useState<{ name?: string }>({});

  // Step 2 — Stops
  const [stops, setStops] = useState<Stop[]>([]);
  const [geometry, setGeometry] = useState<GeoJSON.LineString | null>(null);
  const [stopError, setStopError] = useState<string | null>(null);
  const [fetchingGeometry, setFetchingGeometry] = useState(false);
  const [pendingPin, setPendingPin] = useState<{lng: number, lat: number} | null>(null);
  const [isResolvingPin, setIsResolvingPin] = useState(false);

  // Step 3 — Tips & useful info
  const [fare, setFare] = useState("");
  const [notes, setNotes] = useState("");
  const [isCashOnly, setIsCashOnly] = useState(false);
  const [hasAC, setHasAC] = useState(false);
  const [hazards, setHazards] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Step 1 validation ───────────────────────────────────────────────────────
  function validateStep1() {
    if (!name.trim()) {
      setStep1Errors({ name: "Route name is required." });
      return false;
    }
    setStep1Errors({});
    return true;
  }

  // ── Stop handlers ────────────────────────────────────────────────────────────
  async function handleAddStop(partial: Omit<Stop, "id">) {
    setStopError(null);
    const stop: Stop = { id: crypto.randomUUID(), ...partial };
    const newStops = [...stops, stop];
    setStops(newStops);

    if (newStops.length >= 2) {
      setFetchingGeometry(true);
      const geo = await fetchRouteGeometry(newStops.map((s) => s.coordinates));
      setGeometry(geo);
      setFetchingGeometry(false);
    }
  }

  function handleMapClick(lngLat: { lng: number; lat: number }) {
    setPendingPin(lngLat);
  }

  async function confirmPin() {
    if (!pendingPin) return;
    setIsResolvingPin(true);
    try {
      const placeName = await reverseGeocode(pendingPin.lng, pendingPin.lat);
      await handleAddStop({ name: placeName, coordinates: pendingPin });
    } finally {
      setIsResolvingPin(false);
      setPendingPin(null);
    }
  }

  function handleRemoveStop(id: string) {
    const newStops = stops.filter((s) => s.id !== id);
    setStops(newStops);
    if (newStops.length < 2) setGeometry(null);
  }

  function handleRenameStop(id: string, newName: string) {
    setStops(stops.map(s => s.id === id ? { ...s, name: newName } : s));
  }

  function handleMoveStop(id: string, dir: "up" | "down") {
    const idx = stops.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const next = [...stops];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setStops(next);
  }

  function validateStep2() {
    if (stops.length < 2) {
      setStopError("Add at least 2 stops.");
      return false;
    }
    return true;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const tips: CommuterRouteTips = {
      fare: fare.trim(),
      notes: notes.trim(),
      isCashOnly,
      hasAC,
      hazards: hazards.trim(),
    };

    try {
      await createCommuterRoute({
        authorId: user.uid,
        name: name.trim(),
        stops,
        geometry,
        tips,
      });
      navigate("/explore");
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to save route. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <StepBar current={step} />

      {/* ── Step 1: Route basics ─────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-ink border-[1.5px] border-accent-500 rounded-xl p-5 shadow-lg">
            <p className="text-[11px] font-display text-accent-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4" fill="currentColor" /> Community Signboard
            </p>
            <p className="text-[10px] font-medium text-white/70 leading-relaxed uppercase tracking-tight">
              Share a route you regularly take. Other commuters can vote for this guide!
            </p>
          </div>

          <FormField
            label="Route Signage"
            placeholder="e.g. IT Park – Carbon Market"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={step1Errors.name}
          />

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setStep(1);
            }}
            className="
              w-full rounded-xl bg-primary-500 py-4 text-[12px] font-display uppercase tracking-widest text-white
              border-b-4 border-primary-700 shadow-md transition-all mt-4
              hover:bg-primary-600 active:border-b-0 active:translate-y-1 active:shadow-none
            "
          >
            Add Stops
          </button>
        </div>
      )}

      {/* ── Step 2: Stops ────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
           <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />
          
          <div className="space-y-3">
            <p className="section-label pl-1">Search Landmarks</p>
            <div className="border-[1.5px] border-slate-200 rounded-xl focus-within:border-ink transition-all">
              <StopSearchInput onSelect={handleAddStop} proximity={userLocation ? [userLocation.lng, userLocation.lat] : undefined} />
            </div>
            {stopError && <p className="text-[10px] font-bold text-primary-500 uppercase tracking-tight pl-1">{stopError}</p>}
          </div>

          {stops.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider pl-1 font-display">
                {stops.length} Signboard{stops.length !== 1 ? "s" : ""} added
              </p>
              <div className="space-y-3">
                {stops.map((stop, i) => (
                  <div key={stop.id} className="flex items-center gap-3 bg-white rounded-xl border-[1.5px] border-ink px-4 py-3.5 shadow-[4px_4px_0px_0px_rgba(26,18,8,0.05)]">
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-display shrink-0 shadow-sm
                      ${i === 0 ? 'bg-primary-500 border-ink text-white' : i === stops.length - 1 ? 'bg-accent-500 border-ink text-ink font-bold' : 'bg-surface border-slate-200 text-ink'}`}>
                      {i === 0 ? 'START' : i === stops.length - 1 ? 'END' : i}
                    </div>
                    <input
                      type="text"
                      value={stop.name.split(',')[0]}
                      onChange={(e) => handleRenameStop(stop.id, e.target.value)}
                      placeholder="Stop name"
                      title="Click to rename stop"
                      className="flex-1 min-w-0 text-sm font-bold text-ink bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 -ml-2 border-none outline-none truncate uppercase tracking-tight transition-all"
                    />
                    <div className="flex items-center gap-1.5 pl-2">
                      <button
                        type="button"
                        onClick={() => handleMoveStop(stop.id, "up")}
                        disabled={i === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-surface hover:text-ink disabled:opacity-25 transition-all"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStop(stop.id, "down")}
                        disabled={i === stops.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-surface hover:text-ink disabled:opacity-25 transition-all"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-0.5" />
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.id)}
                        className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-50 hover:text-primary-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fetchingGeometry && (
             <div className="flex justify-center items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">Drawing route line…</p>
             </div>
          )}

          <div className="border-[2.5px] border-ink rounded-xl overflow-hidden shadow-md">
            <RouteMapPreview stops={stops} geometry={geometry} userLocation={userLocation} className="h-60" interactive={true} onMapClick={handleMapClick} />
          </div>

          {pendingPin && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary-600" />
                   </div>
                   <h3 className="text-xl font-display text-ink uppercase tracking-tight leading-none">Add this stop?</h3>
                 </div>
                 <p className="text-sm font-medium text-slate-600 leading-relaxed">
                   Are you sure you want to add this location as a stop? Is this pin another stop/place where people commonly disembark?
                 </p>
                 <div className="flex gap-3 pt-2">
                   <button
                      type="button"
                      disabled={isResolvingPin}
                      onClick={() => setPendingPin(null)}
                      className="flex-1 py-3.5 rounded-xl border-[1.5px] border-slate-200 text-[11px] font-display uppercase tracking-widest text-muted hover:bg-slate-50 hover:text-ink transition-all"
                   >
                      Cancel
                   </button>
                   <button
                      type="button"
                      disabled={isResolvingPin}
                      onClick={confirmPin}
                      className="flex-1 bg-primary-500 py-3.5 rounded-xl text-[11px] font-display uppercase tracking-widest text-white shadow-md border-b-[4px] border-primary-700 active:border-b-0 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                   >
                      {isResolvingPin ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Yes, add stop"
                      )}
                   </button>
                 </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 rounded-xl border-[1.5px] border-slate-200 py-4 text-[11px] font-display uppercase tracking-widest text-muted hover:bg-white hover:border-ink hover:text-ink transition-all"
            >
              Balik
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setStep(2);
              }}
              className="
                flex-1 rounded-xl bg-ink py-4 text-[11px] font-display uppercase tracking-widest text-white shadow-md
                border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 active:shadow-none transition-all
              "
            >
              Tips/Suggestions
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Tips & useful info ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest text-center px-4 leading-relaxed">
            All fields are optional, but sharing specific tips helps the community!
          </p>

          {/* Fare */}
          <FormField label="Typical Fare (₱)" type="number" placeholder="e.g. 13" value={fare} onChange={(e) => setFare(e.target.value)} />

          {/* Toggles */}
          <div className="space-y-3">
             <Toggle label="Cash Only sa App" description="No GCash - exact change lang" checked={isCashOnly} onChange={setIsCashOnly} />
             <Toggle label="Air-conditioned" description="May A/C ang unit" checked={hasAC} onChange={setHasAC} />
          </div>

          {/* Hazards */}
          <div className="space-y-1.5">
            <label className="section-label pl-1">Hazards or Warnings</label>
            <input
              type="text"
              placeholder="e.g. Flooded at Colon during rain"
              value={hazards}
              onChange={(e) => setHazards(e.target.value)}
              className="w-full rounded-xl border-[1.5px] border-slate-200 bg-surface/30 px-4 py-3.5 text-sm font-bold text-ink outline-none focus:border-ink focus:bg-white transition-all uppercase placeholder:normal-case placeholder:font-medium"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="section-label pl-1">Additional Notes</label>
            <textarea
              placeholder="e.g. Jeepneys only run until 9 PM. Ask driver for Carbon stop."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-[1.5px] border-slate-200 bg-surface/30 px-4 py-3.5 text-sm font-bold text-ink outline-none focus:border-ink focus:bg-white transition-all resize-none placeholder:font-medium"
            />
          </div>

          {/* Summary Signboard */}
          <div className="bg-accent-500 border-2 border-ink rounded-xl p-5 space-y-4 shadow-[6px_6px_0px_0px_rgba(26,18,8,0.05)]">
            <p className="section-label text-ink! font-display!">Community Guide Summary</p>
            <div className="space-y-3">
               <h3 className="text-2xl font-display text-ink uppercase tracking-tight leading-tight">{name}</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  <SummaryItem icon={<Navigation className="w-3 h-3" />} text={`${stops.length} STOPS`} />
                  {fare && <SummaryItem icon={<Banknote className="w-3 h-3" />} text={`₱${fare}`} />}
                  {isCashOnly && <SummaryItem icon={<CreditCard className="w-3 h-3" />} text="CASH ONLY" />}
                  {hasAC && <SummaryItem icon={<Snowflake className="w-3 h-3" />} text="A/C" />}
                  {hazards && <SummaryItem icon={<AlertTriangle className="w-3 h-3" />} text="WARNING" />}
                </div>
            </div>
          </div>

          {submitError && <div className="rounded-xl bg-primary-100 border-[1.5px] border-primary-500 px-4 py-3 text-[10px] font-bold text-primary-600 uppercase tracking-tight">{submitError}</div>}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border-[1.5px] border-slate-200 py-4 text-[11px] font-display uppercase tracking-widest text-muted hover:bg-white hover:border-ink hover:text-ink transition-all"
            >
              Balik
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
               className="
                flex-1 rounded-xl bg-primary-500 py-4 text-[11px] font-display uppercase tracking-widest text-white shadow-md
                border-b-4 border-primary-700 active:border-b-0 active:translate-y-1 active:shadow-none transition-all
                disabled:opacity-60 flex items-center justify-center gap-2
              "
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sige lang…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" strokeWidth={3} /> Show in app
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white/30 border border-ink/10 rounded-lg px-2 py-1 flex items-center gap-1.5">
      <span className="text-ink">{icon}</span>
      <span className="text-[9px] font-bold text-ink uppercase tracking-tight">{text}</span>
    </div>
  )
}
