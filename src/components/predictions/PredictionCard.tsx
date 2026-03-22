import { useState } from "react";
import { motion } from "framer-motion";
import ConfidencePill from "@/components/common/ConfidencePill";
import RushHourBanner from "@/components/common/RushHourBanner";
import { Timer, TramFront, Clock, Sparkles, RefreshCcw, Loader2 } from "lucide-react";
import type { PredictionResult, Stop } from "@/types";
import type { ReactNode } from "react";
import { generatePredictionFeedback } from "@/services/ai/gemini";
import { useUserLocation } from "@/hooks/useUserLocation";

interface PredictionCardProps {
  prediction: PredictionResult;
  routeName: string;
  stops?: Stop[];
}

export default function PredictionCard({ prediction, routeName, stops = [] }: PredictionCardProps) {
  const { etaRange, vehicleRange, bestTimeWindow, isRushHour, confidence, layersUsed } = prediction;
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  
  // Try to grab user location silently if already requested somewhere else in the app
  const { location } = useUserLocation(false);

  const handleFlip = async () => {
    setIsFlipped(!isFlipped);
    
    // If turning to back but we haven't fetched feedback yet
    if (!isFlipped && !aiFeedback) {
      setIsPredicting(true);
      try {
        const feedback = await generatePredictionFeedback({
          routeName,
          prediction,
          userLocation: location,
          stops,
        });
        setAiFeedback(feedback);
      } catch {
        setAiFeedback("Failed to load AI prediction.");
      } finally {
        setIsPredicting(false);
      }
    }
  };

  return (
    <div className="relative w-full" style={{ perspective: "1000px" }}>
      <motion.div
        className="w-full relative preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front of Card */}
        <div 
          className="w-full bg-white rounded-xl border-[1.5px] border-ink overflow-hidden shadow-[6px_6px_0px_0px_rgba(26,18,8,0.05)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="px-5 pt-5 pb-4 border-b-[1.5px] border-slate-100 bg-surface/30 flex justify-between items-start">
            <div>
              <p className="section-label mb-1">Estimation For</p>
              <h3 className="font-display text-xl text-ink leading-tight uppercase tracking-tight">{routeName}</h3>
            </div>
            <button 
              onClick={handleFlip}
              className="group flex flex-col items-center justify-center gap-1 hover:bg-primary-50 active:bg-primary-100 transition-colors p-2 rounded-lg border-[1.5px] border-transparent hover:border-primary-100"
              title="Ask AI for Prediction Insights"
            >
              <Sparkles className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-tight">AI Advice</span>
            </button>
          </div>

          {isRushHour && (
            <div className="px-5 pt-4">
              <RushHourBanner show={isRushHour} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-[1.5px] bg-ink/10 mt-4 border-y-[1.5px] border-ink/10">
            <MetricTile
              icon={<Timer className="w-4 h-4" strokeWidth={2.5} />}
              label="ETA Window"
              value={`${etaRange.min}–${etaRange.max} min`}
              sub="Estimated Arrival"
              highlight={isRushHour}
            />
            <MetricTile
              icon={<TramFront className="w-4 h-4" strokeWidth={2.5} />}
              label="Vehicles Near"
              value={`${vehicleRange.min}–${vehicleRange.max}`}
              sub="Next 30 Mins"
            />
            <MetricTile
              icon={<Clock className="w-4 h-4" strokeWidth={2.5} />}
              label="Off-Peak Window"
              value={`${bestTimeWindow.from} – ${bestTimeWindow.to}`}
              sub="Best Time To Leave"
              colSpan
            />
          </div>

          <div className="px-5 py-4 bg-surface/10">
            <ConfidencePill level={confidence} layersUsed={layersUsed} />
          </div>
        </div>

        {/* Back of Card (AI Side) */}
        <div 
          className="absolute inset-0 w-full h-full bg-white rounded-xl border-[1.5px] border-ink overflow-hidden shadow-[6px_6px_0px_0px_rgba(26,18,8,0.05)] flex flex-col"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 px-5 pt-5 pb-4 border-b-[1.5px] border-primary-200/50 flex justify-between items-start">
            <div>
              <p className="flex items-center gap-1.5 section-label mb-1 text-primary-600">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini AI Insights
              </p>
              <h3 className="font-display text-xl text-ink leading-tight uppercase tracking-tight">{routeName}</h3>
            </div>
            <button 
              onClick={handleFlip}
              className="text-ink/60 hover:text-ink hover:bg-white/50 active:bg-white/80 p-2 rounded-lg transition-colors"
              title="Back to normal prediction"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-5 flex flex-col justify-center">
            {isPredicting ? (
              <div className="flex flex-col items-center justify-center gap-3 text-primary-500 py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium animate-pulse text-ink/70">Generating helpful advice...</p>
              </div>
            ) : (
              <div className="prose prose-p:text-ink/80 prose-p:leading-relaxed prose-p:text-[15px] prose-strong:text-ink prose-strong:font-semibold">
                {aiFeedback ? (
                  <p>{aiFeedback}</p>
                ) : (
                  <p className="text-muted italic">Click to generate prediction advice.</p>
                )}
              </div>
            )}
          </div>
          
          <div className="px-5 py-4 bg-surface/10 border-t-[1.5px] border-ink/5 mt-auto">
            <p className="text-xs font-semibold text-muted text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI predictions may not be 100% accurate
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  sub,
  highlight = false,
  colSpan = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  colSpan?: boolean;
}) {
  return (
    <div className={`bg-white px-5 py-4 flex flex-col gap-1.5 ${colSpan ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="text-primary-500">{icon}</span>
        <span className="section-label text-muted!">{label}</span>
      </div>
      <p className={`text-2xl font-display uppercase tracking-tighter leading-none ${highlight ? "text-primary-500" : "text-ink"}`}>{value}</p>
      <p className="text-[10px] font-bold text-muted uppercase tracking-tight">{sub}</p>
    </div>
  );
}
