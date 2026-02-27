"use client";

import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Task } from "@/types";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  children: ReactNode;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  children,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className="flex min-h-[24rem] w-full flex-col gap-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{tasks.length} tasks</p>
        </div>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}
