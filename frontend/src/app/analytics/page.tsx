import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { getAnalyticsSummary } from "@/lib/api";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("workstation-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let analytics;
  try {
    analytics = await getAnalyticsSummary(token);
  } catch {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <section className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 shadow-premium backdrop-blur-sm">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-[10px] uppercase tracking-widest mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-glow" />
                Data Analysis Engine
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Intelligence Center
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
                Advanced performance metrics and predictive workload analysis for your operational units.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-premium overflow-hidden p-6">
              <AnalyticsCharts analytics={analytics} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
