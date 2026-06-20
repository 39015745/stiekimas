import { Navigate, createBrowserRouter } from "react-router-dom";

import { DashboardLayout } from "../layouts/dashboard-layout";
import { DashboardHomePage } from "../pages/dashboard-home-page";
import { LoginPage } from "../pages/login-page";
import { PlaceholderPage } from "../pages/placeholder-page";
import { GuestRoute } from "../routes/guest-route";
import { ProtectedRoute } from "../routes/protected-route";

export const router = createBrowserRouter([
	{
		element: <GuestRoute />,
		children: [{ path: "/login", element: <LoginPage /> }],
	},
	{
		element: <ProtectedRoute />,
		children: [
			{
				path: "/dashboard",
				element: <DashboardLayout />,
				children: [
					{ index: true, element: <DashboardHomePage /> },
					{ path: "employees", element: <PlaceholderPage title="Employees" /> },
					{ path: "projects", element: <PlaceholderPage title="Projects" /> },
					{ path: "work-sessions", element: <PlaceholderPage title="Work sessions" /> },
				],
			},
		],
	},
	{ path: "/", element: <Navigate to="/dashboard" replace /> },
	{ path: "*", element: <Navigate to="/dashboard" replace /> },
]);
