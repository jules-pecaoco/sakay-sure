import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export default function TopBar({ title, showBack = true, onBack, rightElement, transparent = false }: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`
        sticky top-0 z-30 flex items-center justify-between px-4 h-16 transition-all
        ${transparent ? "bg-transparent" : "bg-primary-500 border-b border-primary-600 shadow-sm"}
      `}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-display text-white tracking-tight leading-none uppercase">{title}</h1>
      </div>

      {rightElement && <div className="flex items-center">{rightElement}</div>}
    </header>
  );
}
