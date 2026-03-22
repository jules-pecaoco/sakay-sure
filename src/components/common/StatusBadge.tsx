interface StatusBadgeProps {
  status: "active" | "offline" | "community" | "warning";
  label?: string;
  animate?: boolean;
}

export default function StatusBadge({ status, label, animate = false }: StatusBadgeProps) {
  const configs = {
    active: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      dot: "bg-green-500",
      defaultLabel: "Live",
    },
    offline: {
      bg: "bg-slate-500/10",
      text: "text-slate-500",
      dot: "bg-slate-400",
      defaultLabel: "Offline",
    },
    community: {
      bg: "bg-ink",
      text: "text-white",
      dot: "bg-accent-500",
      defaultLabel: "Community",
    },
    warning: {
      bg: "bg-primary-500/10",
      text: "text-primary-600",
      dot: "bg-primary-500",
      defaultLabel: "Warning",
    },
  };

  const config = configs[status];

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-current/10
      ${config.bg} ${config.text}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${animate && status === "active" ? "animate-pulse" : ""}`} />
      {label || config.defaultLabel}
    </span>
  );
}
