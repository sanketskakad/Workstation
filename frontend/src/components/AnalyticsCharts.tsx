"use client";

import { AnalyticsSummary } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface AnalyticsChartsProps {
  analytics: AnalyticsSummary;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  // Custom theme colors matching our brand tone
  const brandPrimary = "#4338ca";
  const emeraldPrimary = "#10b981";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly Completion Chart */}
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
          Completion Trend
        </p>
        <div className="mt-8 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.weeklyCompleted}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                opacity={0.5}
              />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  backgroundColor: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={brandPrimary}
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: brandPrimary,
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Overdue Task Highlight Card */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
                Overdue tasks
              </p>
              <h2 className="mt-3 text-5xl font-bold text-slate-900 dark:text-white">
                {analytics.overdueTasks}
              </h2>
            </div>
            <Link
              href="/dashboard?view=overdue"
              className="group flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-95"
            >
              Action required
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Monitor overdue work and assign follow-ups to improve cycle time.
            Click above to view details.
          </p>
        </div>

        {/* Team Productivity Bar Chart */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
            Team Efficiency
          </p>
          <div className="mt-6 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.teamProductivity}
                layout="vertical"
                margin={{ left: -20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="developer"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="efficiency" radius={[0, 8, 8, 0]} barSize={16}>
                  {analytics.teamProductivity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.efficiency > 85 ? emeraldPrimary : brandPrimary
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
