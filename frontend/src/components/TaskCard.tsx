"use client";

import Link from "next/link";
import { Calendar, User2, ExternalLink, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const color =
    task.priority === "high"
      ? "high"
      : task.priority === "low"
        ? "low"
        : "medium";

  return (
    <div className="group relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 text-left transition duration-300 hover:border-brand-500/50 hover:shadow-premium cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-4 mb-4">
         <Badge variant={color} className="text-[9px] px-2 py-0.5 font-black uppercase tracking-tighter rounded-md">
            {task.priority}
         </Badge>
         <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition duration-300">
            <Link
              href={`/tasks/${task.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand-500 transition"
              title="View full record"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
         </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-brand-600 transition">
          {task.title}
        </h3>
        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {task.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
               <User2 className="h-3 w-3 text-slate-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{task.assignee.split(' ')[0]}</span>
         </div>
         <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="h-3 w-3" />
            <span className="text-[9px] font-bold">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
         </div>
      </div>
      
      {/* Visual Indicator */}
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 scale-y-0 group-hover:scale-y-100 transition origin-top rounded-l-2xl" />
    </div>
  );
}
