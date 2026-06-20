import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { authQueryOptions } from "../features/auth/auth-api";

export function ProtectedRoute() {
  const location = useLocation();
  const authQuery = useQuery(authQueryOptions);

  if (authQuery.isPending) {
    return <FullPageLoader />;
  }

  if (!authQuery.data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
    </div>
  );
}
