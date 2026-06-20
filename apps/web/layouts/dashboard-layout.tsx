import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { authQueryOptions, logout } from "../features/auth/auth-api";

const navigation = [
  { label: "Overview", to: "/dashboard", end: true },
  { label: "Employees", to: "/dashboard/employees" },
  { label: "Projects", to: "/dashboard/projects" },
  { label: "Work sessions", to: "/dashboard/work-sessions" },
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <span className="text-lg font-semibold tracking-tight">Stiekimas</span>
          <button
            aria-label="Close sidebar"
            className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
              end={item.end}
              key={item.to}
              onClick={() => setSidebarOpen(false)}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 min-w-0 px-2">
            <p className="truncate text-sm font-medium">{authQuery.data?.name}</p>
            <p className="text-xs capitalize text-slate-400">{authQuery.data?.role}</p>
          </div>
          <button
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-60"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            aria-label="Open sidebar"
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <MenuIcon />
          </button>
          <div className="ml-auto text-sm text-slate-500">
            Signed in as <span className="font-medium text-slate-900">{authQuery.data?.name}</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
