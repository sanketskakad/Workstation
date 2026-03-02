"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Task } from "@/types";
import { suggestTaskAction } from "@/lib/api";

interface TaskDetailsPanelProps {
  task: Task;
}

export function TaskDetailsPanel({ task }: TaskDetailsPanelProps) {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runAction = async (action: "summarize" | "subtasks" | "priority") => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("workstation-token") ?? "";
      const response = await suggestTaskAction(task.id, action, token);
      setResult(response);
    } catch {
      setResult("Failed to get AI suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-8 shadow-soft">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
            Task
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{task.title}</h1>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{task.description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Priority
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white capitalize">
              {task.priority}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Assignee
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
              {task.assignee}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Due date
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
              {task.dueDate}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-6 shadow-soft">
        <p className="font-semibold text-slate-900 dark:text-slate-100">AI actions</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="secondary" onClick={() => runAction("summarize")} disabled={loading}>
            Summarize
          </Button>
          <Button variant="secondary" onClick={() => runAction("subtasks")} disabled={loading}>
            Suggest subtasks
          </Button>
          <Button variant="secondary" onClick={() => runAction("priority")} disabled={loading}>
            Suggest priority
          </Button>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <p>AI results</p>
          </div>
          <div className="mt-4 min-h-[6rem] text-slate-700 dark:text-slate-300">
            {loading
              ? "Thinking..."
              : result || "Choose an action to see a recommendation."}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
            Subtasks
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {task.subtasks?.length ? (
              task.subtasks.map((subtask) => (
                <li
                  key={subtask}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-900 px-4 py-3"
                >
                  {subtask}
                </li>
              ))
            ) : (
              <li className="rounded-2xl bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-500">
                No subtasks yet.
              </li>
            )}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
            Workflow
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 text-slate-700 dark:text-slate-300">
            <ArrowRight className="h-5 w-5 text-brand-500" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                This task is currently set to:
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white capitalize">
                {task.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
