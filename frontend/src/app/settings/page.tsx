"use client";

import { useContext, useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ToastProvider";
import { ThemeContext } from "@/components/ThemeProvider";
import { updateUserSettings, getUserProfile } from "@/lib/api";
import { Settings, Shield, Bell, Palette, Globe, HardDrive } from "lucide-react";
import { clsx } from "clsx";

export default function SettingsPage() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { pushToast } = useToast();
  
  const [prefs, setPrefs] = useState({
    defaultView: "Kanban Board",
    timezone: "UTC",
    autoSave: true,
    compactMode: false
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("workstation-token") : null;

  useEffect(() => {
    if (token) {
      getUserProfile(token).then(user => {
        if (user.settings) {
          setPrefs(prev => ({
            ...prev,
            ...user.settings
          }));
          if (user.settings.theme) {
            setTheme(user.settings.theme as "light" | "dark");
          }
        }
      }).catch(console.error);
    }
  }, [token, setTheme]);

  const handleSave = async () => {
    if (token) {
      try {
        await updateUserSettings({ ...prefs, theme }, token);
        pushToast({ 
          title: "Settings Synchronized", 
          description: "Workstation environment preferences have been updated on the backend.", 
          type: "success" 
        });
      } catch (err) {
        pushToast({ title: "Sync Failed", description: "Could not save settings to cloud.", type: "error" });
      }
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <section className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Manage your account preferences and workstation environment.</p>
            </div>

            <div className="grid gap-8">
              {/* General Preferences */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
                      <Globe className="h-5 w-5" />
                   </div>
                   <h2 className="text-xl font-bold">General Preferences</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Default View</Label>
                    <select 
                      value={prefs.defaultView}
                      onChange={(e) => setPrefs({...prefs, defaultView: e.target.value})}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-4 focus:ring-brand-500/10"
                    >
                      <option>Kanban Board</option>
                      <option>List View</option>
                      <option>Calendar</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Timezone</Label>
                    <select 
                      value={prefs.timezone}
                      onChange={(e) => setPrefs({...prefs, timezone: e.target.value})}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-4 focus:ring-brand-500/10"
                    >
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>EST (Eastern Standard Time)</option>
                      <option>PST (Pacific Standard Time)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Palette className="h-5 w-5" />
                   </div>
                   <h2 className="text-xl font-bold">Appearance Mode</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setTheme("light")}
                     className={clsx(
                       "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition",
                       theme === "light" 
                         ? "border-brand-500 bg-brand-50/50" 
                         : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                     )}
                   >
                      <div className="h-16 w-full rounded-lg bg-white shadow-sm border border-slate-200" />
                      <span className="text-xs font-bold uppercase tracking-widest">Light Mode</span>
                   </button>
                   <button 
                     onClick={() => setTheme("dark")}
                     className={clsx(
                       "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition",
                       theme === "dark" 
                         ? "border-brand-500 bg-brand-900/20" 
                         : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                     )}
                   >
                      <div className="h-16 w-full rounded-lg bg-slate-950 shadow-sm border border-slate-800" />
                      <span className="text-xs font-bold uppercase tracking-widest">Dark Mode</span>
                   </button>
                </div>
              </div>

              {/* Operational Toggle */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <HardDrive className="h-5 w-5" />
                   </div>
                   <h2 className="text-xl font-bold">Operational Controls</h2>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div>
                         <p className="text-sm font-bold">Auto-Save Changes</p>
                         <p className="text-xs text-slate-600 dark:text-slate-300">Synchronize task updates automatically.</p>
                      </div>
                      <button 
                        onClick={() => setPrefs({...prefs, autoSave: !prefs.autoSave})}
                        className={clsx(
                          "h-6 w-12 rounded-full transition-colors relative",
                          prefs.autoSave ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                         <div className={clsx(
                           "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                           prefs.autoSave ? "left-7" : "left-1"
                         )} />
                      </button>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                 <Button variant="outline" onClick={() => setPrefs({defaultView: "Kanban Board", timezone: "UTC", autoSave: true, compactMode: false})}>Reset</Button>
                 <Button variant="primary" onClick={handleSave}>Apply Settings</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
