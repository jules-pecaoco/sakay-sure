import { useEffect, useState } from "react";
import { subscribeDriverRoutes } from "@/services/firebase/routes";
import { useAuth } from "@/context/AuthContext";
import type { DriverRoute } from "@/types";

interface UseDriverRoutesReturn {
  routes: DriverRoute[];
  loading: boolean;
  error: string | null;
}

export function useDriverRoutes(): UseDriverRoutesReturn {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeDriverRoutes(user.uid, (data) => {
      setRoutes(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  return { routes, loading, error };
}
