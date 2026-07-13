import { Navigate, createBrowserRouter } from "react-router-dom";

import { DashboardHomePage } from "./pages/dashboard-home-page";
import { LoginPage } from "./pages/login-page";
import { PlaceholderPage } from "./pages/placeholder-page";
import { GuestRoute } from "./routes/guest-route";
import { ProtectedRoute } from "./routes/protected-route";
import { DashboardLayout } from "./components/layouts/dashboard-layout";
import Employees from "./pages/employees";

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
					{ path: "work-sessions", element: <PlaceholderPage title="Work sessions" /> },

					// Only Admins can access these routes
					{
						element: <ProtectedRoute allowedRoles={["admin"]} />,
						children: [
							{ path: "employees", element: <Employees /> },
							{ path: "projects", element: <PlaceholderPage title="Projects" /> },
						],
					},
				],
			},
		],
	},
	{ path: "/", element: <Navigate to="/dashboard" replace /> },
	{ path: "*", element: <Navigate to="/dashboard" replace /> },
]);
