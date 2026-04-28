"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, LayoutDashboard, BarChart3, User } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

import { useNotifications } from "@/context/NotificationContext";
import { getUserProfile } from "@/lib/api";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "Developer",
    email: "dev@workstation.io",
    bio: "",
    role: "Full-Stack Operator",
  });
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("workstation-token")
      : null;

  useEffect(() => {
    if (token) {
      getUserProfile(token)
        .then((user) => {
          setProfile({
            name: user.name || "Developer",
            email: user.email || "",
            bio: user.bio || "",
            role: user.role || "Developer",
          });
        })
        .catch(console.error);
    }
  }, [token]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 lg:flex border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold">W/S</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              System Online
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Workstation Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link
            href="/alerts"
            className="relative hidden sm:inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 px-4 py-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Bell className="h-3.5 w-3.5" />
            NOTIFICATIONS
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-glow">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition shadow-sm"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[10px] font-bold text-white shadow-glow">
              {profile.name.substring(0, 2).toUpperCase()}
            </span>
            <span className="hidden sm:inline font-semibold">
              {profile.name}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 lg:hidden">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-500 text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
