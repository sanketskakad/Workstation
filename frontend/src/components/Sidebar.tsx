"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  User,
  FolderKanban,
  Users,
  Command,
  Settings,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("workstation-token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/profile", label: "Profile", icon: User },
  ];

  if (role === "Admin" || role === "Project Manager") {
    navItems.splice(1, 0, {
      href: "/projects",
      label: "Projects",
      icon: FolderKanban,
    });
  }

  if (role === "Admin") {
    navItems.splice(2, 0, { href: "/admin/users", label: "Team", icon: Users });
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] p-6 lg:flex flex-col h-screen sticky top-0">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-glow">
          <Command className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Workstation
        </span>
      </div>

      <div className="flex-1 space-y-8">
        <div>
          <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200",
                    isActive
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-4 w-4",
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-slate-400",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            System
          </p>
          <nav className="space-y-1">
            <Link
              href="/settings"
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200",
                pathname === "/settings"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              <Settings
                className={clsx(
                  "h-4 w-4",
                  pathname === "/settings"
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-400",
                )}
              />
              Settings
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("workstation-token");
                window.location.assign("/login");
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-900">
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Current Role
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
            {role || "Developer"}
          </p>
        </div>
      </div>
    </aside>
  );
}
