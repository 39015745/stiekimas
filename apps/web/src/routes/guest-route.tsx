import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";

import { authQueryOptions } from "../features/auth/auth-api";

export function GuestRoute() {
  const authQuery = useQuery(authQueryOptions);

  if (authQuery.isPending) {
    return null;
  }

  return authQuery.data ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
