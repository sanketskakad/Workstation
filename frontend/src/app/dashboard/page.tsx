import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { getDashboardData } from "@/lib/api";
import { Activity, Users, Layout, Zap } from "lucide-react";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("workstation-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let data;
  try {
    data = await getDashboardData(token);
  } catch {
    redirect("/login");
  }

  const { user, tasks } = data;

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <section className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-[1600px]">
            {/* Dashboard Header */}
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-widest mb-3">
                  <Activity className="h-3.5 w-3.5" />
                  Live Operational Overview
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Command Center
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-lg">
                  Real-time visibility into your team&apos;s velocity and task execution.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-3">
                <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 min-w-[140px] shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Tasks</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{tasks.length}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-workstation" />
                  </div>
                </div>
                <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 min-w-[140px] shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operators</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{user.team?.length ?? 0}</span>
                    <Users className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Board Section */}
            <div className="relative">
              <div className="absolute -top-6 left-0 right-0 flex items-center gap-4 px-4 py-2 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-t-2xl border-b-0">
                <Layout className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Workflow</span>
                <div className="ml-auto flex items-center gap-2">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-medium text-slate-500 italic">AI Suggestions Enabled</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-premium overflow-hidden pt-6">
                <Suspense fallback={
                  <div className="p-32 flex flex-col items-center justify-center gap-4">
                    <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Synchronizing workspace data...</p>
                  </div>
                }>
                  <KanbanBoard initialTasks={tasks} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
