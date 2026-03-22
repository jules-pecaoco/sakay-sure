import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  title = "No results found", 
  message = "Try adjusting your filters or search terms.", 
  icon = <SearchX className="w-12 h-12 text-slate-300" />,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-20 h-20 rounded-2xl bg-white border-[1.5px] border-slate-100 flex items-center justify-center shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-display text-ink uppercase tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-60 leading-relaxed mb-6 font-medium">
        {message}
      </p>
      {action && (
        <div className="w-full max-w-50">
          {action}
        </div>
      )}
    </div>
  );
}
