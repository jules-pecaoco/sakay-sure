import { useNavigate } from "react-router-dom";
import AddRouteForm from "@/components/driver/AddRouteForm";
import TopBar from "@/components/common/TopBar";

export default function DriverAddRoutePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface">
      <TopBar 
        title="RouteSure" 
        onBack={() => navigate('/driver')}
      />

      <div className="max-w-lg mx-auto">
        <AddRouteForm />
      </div>
    </div>
  );
}
