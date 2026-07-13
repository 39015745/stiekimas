import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Menu, Users, Briefcase, CalendarClock, X } from "lucide-react";

import stiekimasLogo from "../../assets/stiekimas-logo.webp";
import { authQueryOptions, logout } from "../../features/auth/auth-api";

const navigation = [
	{ label: "Apžvalga", to: "/dashboard", end: true, icon: LayoutDashboard },
	{ label: "Darbuotojai", to: "/dashboard/employees", icon: Users },
	{ label: "Projektai", to: "/dashboard/projects", icon: Briefcase },
	{ label: "Bendras tabelis", to: "/dashboard/work-sessions", icon: CalendarClock },
];

export function DashboardLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const authQuery = useQuery(authQueryOptions);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const logoutMutation = useMutation({
		mutationFn: logout,
		onSettled: () => {
			queryClient.setQueryData(authQueryOptions.queryKey, null);
			queryClient.clear();
			navigate("/login", { replace: true });
		},
	});

	const role = authQuery.data?.role === "admin" ? "administratorius" : "darbuotojas";

	return (
		<div className="min-h-screen bg-background">
			{sidebarOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" onClick={() => setSidebarOpen(false)} type="button" />}

			<aside
				className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-secondary-300 text-white transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex h-16 items-center justify-between border-b border-primary-400 px-5">
					<img src={stiekimasLogo} alt="Stiekimas Logo" className="h-8 w-auto object-contain" />
				</div>
				<button
					aria-label="Close sidebar"
					className="rounded-md p-2 mt-4 mr-4 ml-auto text-primary-400 hover:bg-primary-400 hover:text-white lg:hidden cursor-pointer"
					onClick={() => setSidebarOpen(false)}
					type="button"
				>
					<X className="h-6 w-6" />
				</button>
				<nav className="flex-1 space-y-1 p-4">
					{navigation.map((item) => {
						const Icon = item.icon;
						return (
							<NavLink
								className={({ isActive }) =>
									`flex items-center gap-3 rounded-lg px-3 py-2.5 text-md font-medium transition text-primary-700 ${isActive ? "bg-secondary-500" : "hover:bg-secondary-500"}`
								}
								end={item.end}
								key={item.to}
								onClick={() => setSidebarOpen(false)}
								to={item.to}
							>
								<Icon className="h-5 w-5" />
								{item.label}
							</NavLink>
						);
					})}
				</nav>

				<div className="border-t border-primary-400 p-4">
					<p className="text-sm mb-3 text-primary-700 text-center min-w-0 px-2">Prisijungęs kaip {role}</p>
					<button
						className="w-full rounded-lg border border-primary-400 bg-primary-200 px-3 py-2 font-medium text-white hover:bg-primary-400 disabled:opacity-60 cursor-pointer"
						disabled={logoutMutation.isPending}
						onClick={() => logoutMutation.mutate()}
						type="button"
					>
						Atsijungti
					</button>
				</div>
			</aside>

			<div className="lg:pl-72">
				<header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 backdrop-blur sm:px-6">
					<button
						aria-label="Open sidebar"
						className="rounded-lg border border-primary-400 p-2 text-primary-400 hover:text-white hover:bg-primary-400 lg:hidden cursor-pointer"
						onClick={() => setSidebarOpen(true)}
						type="button"
					>
						<Menu className="h-4 w-4 " />
					</button>
					<div className="flex items-center gap-4 ml-auto text-sm text-foreground">
						<p>
							Sveiki, <span className="font-medium text-primary-400">{authQuery.data?.name}</span>
						</p>
					</div>
				</header>

				<main className="p-4 sm:p-6 lg:p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
