import { Navigate, createBrowserRouter } from "react-router-dom";

import { DashboardHomePage } from "./pages/dashboard-home-page";
import { LoginPage } from "./pages/login-page";
import { PlaceholderPage } from "./pages/placeholder-page";
import { GuestRoute } from "./routes/guest-route";
import { ProtectedRoute } from "./routes/protected-route";
import { DashboardLayout } from "./components/layouts/dashboard-layout";
import Employees from "./pages/employees";
import EmployeeDetails from "./pages/employee";

export const router = createBrowserRouter([
	{
		element: <GuestRoute />,
		children: [{ path: "/login", element: <LoginPage /> }],
	},
	{
		// User protected routes
		element: <ProtectedRoute />,
		children: [
			{
				path: "/",
				element: <DashboardLayout />,
				children: [
					{ index: true, element: <DashboardHomePage /> },
					{ path: "work-sessions", element: <PlaceholderPage title="Work sessions" /> },
					{ path: "employees/:id", element: <EmployeeDetails /> },

					{
						// Admin protected routes
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
	{ path: "*", element: <Navigate to="/" replace /> },
]);
