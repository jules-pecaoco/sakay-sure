interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  message?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export default function LoadingSpinner({ fullScreen = false, size = "md", message }: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`
          ${sizeMap[size]}
          rounded-full border-slate-200 border-t-sky-500 animate-spin
        `}
      />
      {message && <p className="text-sm text-slate-500 font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white z-50">{spinner}</div>;
  }

  return spinner;
}
