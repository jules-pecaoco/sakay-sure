import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserVote, castVote, type VoteValue } from "@/services/firebase/commuterRoutes";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface RouteVoteButtonsProps {
  routeId: string;
  helpfulVotes: number;
  notHelpfulVotes: number;
}

export default function RouteVoteButtons({ routeId, helpfulVotes, notHelpfulVotes }: RouteVoteButtonsProps) {
  const { user } = useAuth();

  // null  = no vote yet
  // 'helpful' | 'notHelpful' = active vote
  const [currentVote, setCurrentVote] = useState<VoteValue | null>(null);
  const [loadingVote, setLoadingVote] = useState(true);
  const [acting, setActing] = useState(false);

  // Optimistic local counts so the UI updates instantly
  const [counts, setCounts] = useState({
    helpful: helpfulVotes,
    notHelpful: notHelpfulVotes,
  });

  // Keep counts in sync if the parent re-renders with fresh Firestore data
  useEffect(() => {
    setCounts({ helpful: helpfulVotes, notHelpful: notHelpfulVotes });
  }, [helpfulVotes, notHelpfulVotes]);

  // Load the persisted vote for this user on mount
  useEffect(() => {
    if (!user) {
      setLoadingVote(false);
      return;
    }
    getUserVote(user.uid, routeId)
      .then((v) => setCurrentVote(v))
      .finally(() => setLoadingVote(false));
  }, [user, routeId]);

  async function handleVote(value: VoteValue) {
    if (!user || acting || loadingVote) return;

    // Block switching: must undo current vote first
    if (currentVote !== null && currentVote !== value) return;

    setActing(true);

    // Optimistic update
    const isUndo = currentVote === value;
    setCounts((prev) => ({
      ...prev,
      [value === "helpful" ? "helpful" : "notHelpful"]: prev[value === "helpful" ? "helpful" : "notHelpful"] + (isUndo ? -1 : 1),
    }));
    setCurrentVote(isUndo ? null : value);

    try {
      const result = await castVote(user.uid, routeId, value);
      // Sync with server result in case optimistic was off
      setCurrentVote(result);
    } catch (err) {
      console.error("Vote failed:", err);
      // Roll back optimistic update
      setCounts({ helpful: helpfulVotes, notHelpful: notHelpfulVotes });
      setCurrentVote(currentVote);
    } finally {
      setActing(false);
    }
  }

  const isHelpfulActive = currentVote === "helpful";
  const isNotHelpfulActive = currentVote === "notHelpful";

  // A button is disabled if the user has voted the OTHER option
  // (must undo first), or if a request is in flight
  const helpfulDisabled = acting || loadingVote || isNotHelpfulActive;
  const notHelpfulDisabled = acting || loadingVote || isHelpfulActive;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">Helpful?</span>

      {/* Helpful */}
      <button
        type="button"
        onClick={() => handleVote("helpful")}
        disabled={helpfulDisabled}
        title={isNotHelpfulActive ? "Undo your dislike first" : isHelpfulActive ? "Tap to undo" : "Mark as helpful"}
        className={`
          flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
          transition-all
          ${
            isHelpfulActive
              ? "bg-green-100 text-green-700 ring-1 ring-green-300"
              : helpfulDisabled
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : "bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600 cursor-pointer"
          }
        `}
      >
        <ThumbsUp className="w-3 h-3" /> {counts.helpful}
        {isHelpfulActive && <span className="text-[10px] text-green-600 font-semibold">· undo</span>}
      </button>

      {/* Not helpful */}
      <button
        type="button"
        onClick={() => handleVote("notHelpful")}
        disabled={notHelpfulDisabled}
        title={isHelpfulActive ? "Undo your like first" : isNotHelpfulActive ? "Tap to undo" : "Mark as not helpful"}
        className={`
          flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
          transition-all
          ${
            isNotHelpfulActive
              ? "bg-red-100 text-red-600 ring-1 ring-red-300"
              : notHelpfulDisabled
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer"
          }
        `}
      >
        <ThumbsDown className="w-3 h-3" /> {counts.notHelpful}
        {isNotHelpfulActive && <span className="text-[10px] text-red-500 font-semibold">· undo</span>}
      </button>

      {/* Loading indicator */}
      {(loadingVote || acting) && <span className="w-3 h-3 border border-slate-300 border-t-slate-500 rounded-full animate-spin" />}
    </div>
  );
}
