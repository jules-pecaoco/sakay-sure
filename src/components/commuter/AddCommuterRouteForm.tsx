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
import type { Stop, CommuterRouteTips } from "@/types";

// ─── Step bar ─────────────────────────────────────────────────────────────────

const STEPS = ["Route", "Stops", "Tips"] as const;
type StepIndex = 0 | 1 | 2;

function StepBar({ current }: { current: StepIndex }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`
                flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0
                ${done ? "bg-sky-500 text-white" : active ? "bg-sky-100 text-sky-600 ring-2 ring-sky-500" : "bg-slate-100 text-slate-400"}
              `}
            >
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium ${active ? "text-sky-600" : done ? "text-slate-500" : "text-slate-400"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? "bg-sky-300" : "bg-slate-200"}`} />}
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
        className={`
          relative w-11 h-6 rounded-full transition-colors shrink-0
          ${checked ? "bg-sky-500" : "bg-slate-200"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
            transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0"}
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

  function handleRemoveStop(id: string) {
    const newStops = stops.filter((s) => s.id !== id);
    setStops(newStops);
    if (newStops.length < 2) setGeometry(null);
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
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <StepBar current={step} />

      {/* ── Step 1: Route basics ─────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-sky-700 mb-1">📣 Community route</p>
            <p className="text-xs text-sky-600 leading-relaxed">
              Share a route you regularly take. Other commuters will see it and can vote if it's helpful — even when no drivers are registered yet.
            </p>
          </div>

          <FormField
            label="Route name"
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
            className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white hover:bg-sky-600 active:scale-[.98] transition-all"
          >
            Next: Add stops →
          </button>
        </div>
      )}

      {/* ── Step 2: Stops ────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Search & add stops</p>
            <p className="text-xs text-slate-400">Add stops in order — start to end. You can reorder them after adding.</p>
            <LocationPermissionBanner status={locationStatus} onRequest={requestLocation} />
            <StopSearchInput onSelect={handleAddStop} proximity={userLocation ? [userLocation.lng, userLocation.lat] : undefined} />
            {stopError && <p className="text-xs text-red-500">{stopError}</p>}
          </div>

          {stops.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stops.length} stop{stops.length !== 1 ? "s" : ""} added
              </p>
              {stops.map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <span
                    className={`
                      text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0
                      ${i === 0 ? "bg-green-100 text-green-700" : i === stops.length - 1 ? "bg-red-100 text-red-600" : "bg-sky-100 text-sky-600"}
                    `}
                  >
                    {i === 0 ? "S" : i === stops.length - 1 ? "E" : i}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 truncate">{stop.name.split(",")[0]}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveStop(stop.id, "up")}
                      disabled={i === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25 text-xs"
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStop(stop.id, "down")}
                      disabled={i === stops.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25 text-xs"
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(stop.id)}
                      className="p-1 text-red-400 hover:text-red-600 text-xs"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {fetchingGeometry && <p className="text-xs text-slate-400 text-center animate-pulse">Drawing route line…</p>}

          <RouteMapPreview stops={stops} geometry={geometry} userLocation={userLocation} />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setStep(2);
              }}
              className="flex-1 rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white hover:bg-sky-600 active:scale-[.98] transition-all"
            >
              Next: Add tips →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Tips & useful info ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="text-xs text-slate-400 leading-relaxed">
            All fields are optional, but the more info you share, the more useful this route becomes for other commuters.
          </p>

          {/* Fare */}
          <FormField label="Typical fare (₱)" type="number" placeholder="e.g. 13" value={fare} onChange={(e) => setFare(e.target.value)} />

          {/* Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <Toggle label="Cash only" description="No GCash or card — bring exact change" checked={isCashOnly} onChange={setIsCashOnly} />
            <div className="h-px bg-slate-100" />
            <Toggle label="Air-conditioned" description="Vehicle has working A/C" checked={hasAC} onChange={setHasAC} />
          </div>

          {/* Hazards */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Hazards or warnings</label>
            <input
              type="text"
              placeholder="e.g. Flooded at Colon during rain"
              value={hazards}
              onChange={(e) => setHazards(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Additional notes</label>
            <textarea
              placeholder="e.g. Jeepneys only run until 9 PM. Ask driver for Carbon stop."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Summary</p>
            <p className="text-sm font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-500">{stops.length} stops</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {fare && <span className="text-xs bg-white rounded-full px-2 py-0.5 text-slate-600 border border-sky-200">₱{fare}</span>}
              {isCashOnly && <span className="text-xs bg-white rounded-full px-2 py-0.5 text-amber-600 border border-amber-200">💵 Cash only</span>}
              {hasAC && <span className="text-xs bg-white rounded-full px-2 py-0.5 text-sky-600 border border-sky-200">❄️ A/C</span>}
              {hazards && <span className="text-xs bg-white rounded-full px-2 py-0.5 text-amber-700 border border-amber-200">⚠️ {hazards}</span>}
            </div>
          </div>

          {submitError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{submitError}</div>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white hover:bg-sky-600 active:scale-[.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sharing…
                </>
              ) : (
                "Share route ✓"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
