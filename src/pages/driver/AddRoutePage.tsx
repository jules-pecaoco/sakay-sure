import AddRouteForm from "@/components/driver/AddRouteForm";
import TopBar from "@/components/common/TopBar";

export default function DriverAddRoutePage() {

  return (
    <div className="min-h-screen bg-surface">
      <TopBar 
        title="RouteSure" 
      />

      <div className="max-w-lg mx-auto">
        <AddRouteForm />
      </div>
    </div>
  );
}
