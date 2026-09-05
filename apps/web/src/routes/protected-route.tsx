import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { authQueryOptions, type AuthUser } from "../features/auth/auth-api";

import { FullPageLoader } from "../components/ui/loading-animations";

type ProtectedRouteProps = {
	allowedRoles?: AuthUser["role"][];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
	const location = useLocation();
	const authQuery = useQuery(authQueryOptions);

	if (authQuery.isPending) {
		return <FullPageLoader />;
	}

	if (!authQuery.data) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	if (allowedRoles && !allowedRoles.includes(authQuery.data.role)) {
		if (authQuery.data.role === "employee") {
			return <Navigate to={`/employees/${authQuery.data.employeeId}`} replace />;
		}
	}

	return <Outlet />;
}
