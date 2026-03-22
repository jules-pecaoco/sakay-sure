import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen message="Loading SakaySure…" />;

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={user.role === "driver" ? "/driver" : "/explore"} replace />;
}
