interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  message?: string;
}

const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-10 h-10 border-[3px]",
  lg: "w-16 h-16 border-[4.5px]",
};

export default function LoadingSpinner({ fullScreen = false, size = "md", message }: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`
          ${sizeMap[size]}
          rounded-xl border-ink/10 border-t-primary-500 animate-spin shadow-inner
        `}
      />
      {message && (
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-surface z-50">{spinner}</div>;
  }

  return spinner;
}
