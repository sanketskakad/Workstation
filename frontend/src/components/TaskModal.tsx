"use client";

import { FormEvent, useEffect, useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Task, TaskPriority, TaskStatus } from "@/types";
import { taskSchema } from "@/lib/validation";
import { z } from "zod";

interface TaskModalProps {
  readonly open: boolean;
  readonly task?: Task;
  readonly projects: string[];
  readonly assignees: string[];
  readonly onClose: () => void;
  readonly onSave: (task: Task) => void;
  readonly onDelete?: (id: string) => void;
}

const priorities: TaskPriority[] = ["low", "medium", "high"];
const statuses: TaskStatus[] = ["todo", "inprogress", "done"];

function buildDefaultTask(
  task?: Task,
  projects?: string[],
  assignees?: string[],
): Task {
  return (
    task ?? {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignee: assignees?.[0] ?? "Unassigned",
      dueDate: new Date().toISOString().slice(0, 10),
      project: projects?.[0] ?? "General",
      subtasks: [],
    }
  );
}

export function TaskModal({
  open,
  task,
  projects,
  assignees,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [state, setState] = useState<Task>(() =>
    buildDefaultTask(task, projects, assignees),
  );
  const [error, setError] = useState<string | null>(null);

  // Reset form state whenever the task prop changes (switching between tasks)
  useEffect(() => {
    setState(buildDefaultTask(task, projects, assignees));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const actionLabel = task ? "Update task" : "Create task";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError(null);
      taskSchema.parse(state);
      onSave(state);
      onClose();
    } catch (err) {
      const validationError = err as z.ZodError;
      setError(validationError.issues[0]?.message ?? "Invalid task data");
    }
  };

  const submitDisabled = !state.title || !state.assignee;

  const selectClass =
    "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-brand-500";

  return (
    <Modal
      open={open}
      title={task ? "Edit task" : "New task"}
      onClose={onClose}
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            value={state.title}
            onChange={(e) => setState({ ...state, title: e.target.value })}
            placeholder="Design homepage flow"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="task-description">Description</Label>
          <textarea
            id="task-description"
            value={state.description}
            onChange={(e) =>
              setState({ ...state, description: e.target.value })
            }
            className="min-h-[7rem] w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="task-project">Project</Label>
            <select
              id="task-project"
              value={state.project}
              onChange={(e) => setState({ ...state, project: e.target.value })}
              className={selectClass}
            >
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-assignee">Assignee</Label>
            <select
              id="task-assignee"
              value={state.assignee}
              onChange={(e) => setState({ ...state, assignee: e.target.value })}
              className={selectClass}
            >
              {assignees.map((developer) => (
                <option key={developer} value={developer}>
                  {developer}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="task-status">Status</Label>
            <select
              id="task-status"
              value={state.status}
              onChange={(e) =>
                setState({ ...state, status: e.target.value as TaskStatus })
              }
              className={selectClass}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-priority">Priority</Label>
            <select
              id="task-priority"
              value={state.priority}
              onChange={(e) =>
                setState({ ...state, priority: e.target.value as TaskPriority })
              }
              className={selectClass}
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-dueDate">Due date</Label>
            <Input
              id="task-dueDate"
              type="date"
              value={state.dueDate}
              onChange={(e) => setState({ ...state, dueDate: e.target.value })}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {task && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto text-rose-500 hover:text-rose-600"
              onClick={() => onDelete(task.id)}
            >
              Delete task
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitDisabled}
            className="w-full sm:w-auto"
          >
            {actionLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
