"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Filter, Search, User as UserIcon, Layout } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { TaskModal } from "@/components/TaskModal";
import { TaskCard } from "@/components/TaskCard";
import { KanbanColumn } from "@/components/KanbanColumn";
import { useTaskStore } from "@/store/useTaskStore";
import { useToast } from "@/components/ToastProvider";
import { useWebSocket } from "@/context/WebSocketProvider";
import {
  updateTaskStatus,
  deleteTask,
  updateTaskApi,
  createTaskApi,
  getTasks,
} from "@/lib/api";
import { Task, TaskStatus } from "@/types";
import { useSearchParams } from "next/navigation";

interface KanbanBoardProps {
  initialTasks: Task[];
}

const columns: Array<{ id: TaskStatus; title: string }> = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];

function SortableTaskCard({
  task,
  onClick,
}: Readonly<{ task: Task; onClick: () => void }>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

export function KanbanBoard({ initialTasks }: Readonly<KanbanBoardProps>) {
  const { pushToast } = useToast();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const sprintId = searchParams.get("sprintId");

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [projectFilter, setProjectFilter] = useState("All");
  const [memberFilter, setMemberFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { tasks, setTasks, updateTask, removeTask, addTask } = useTaskStore();
  const { events } = useWebSocket();
  const sensors = useSensors(useSensor(PointerSensor));

  const token =
    typeof window !== "undefined"
      ? (window.localStorage.getItem("workstation-token") ?? undefined)
      : undefined;

  const { data: queryTasks } = useQuery({
    queryKey: ["tasks", sprintId],
    queryFn: () => getTasks(token),
    initialData: initialTasks,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    setTasks(queryTasks ?? initialTasks);
  }, [queryTasks, initialTasks, setTasks]);

  useEffect(() => {
    const latest = events[0];
    if (!latest) return;
    if (latest.type === "task.updated") {
      updateTask(latest.payload as Task);
    }
    if (latest.type === "task.created") {
      addTask(latest.payload as Task);
    }
    if (latest.type === "task.deleted") {
      removeTask((latest.payload as { id: string }).id);
    }
  }, [events, updateTask, addTask, removeTask]);

  const projects = useMemo(
    () => ["All", ...Array.from(new Set(tasks.map((task) => task.project)))],
    [tasks],
  );
  const assignees = useMemo(
    () => ["All", ...Array.from(new Set(tasks.map((task) => task.assignee)))],
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (sprintId && task.sprintId !== sprintId) return false;
      if (view === "overdue") {
        const isOverdue =
          new Date(task.dueDate) < new Date() && task.status !== "done";
        if (!isOverdue) return false;
      }
      if (projectFilter !== "All" && task.project !== projectFilter)
        return false;
      if (memberFilter !== "All" && task.assignee !== memberFilter)
        return false;
      if (
        searchTerm &&
        !task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [tasks, projectFilter, memberFilter, view, searchTerm, sprintId]);

  const groupedTasks = useMemo(() => {
    return columns.reduce<Record<TaskStatus, Task[]>>(
      (acc, column) => {
        acc[column.id] = filteredTasks.filter(
          (task) => task.status === column.id,
        );
        return acc;
      },
      { todo: [], inprogress: [], done: [] },
    );
  }, [filteredTasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceTask = tasks.find((task) => task.id === String(active.id));
    const overId = String(over.id);
    const destinationStatus =
      columns.find((column) => column.id === overId)?.id ??
      tasks.find((task) => task.id === overId)?.status;
    if (
      !sourceTask ||
      !destinationStatus ||
      sourceTask.status === destinationStatus
    )
      return;

    const updated = { ...sourceTask, status: destinationStatus };
    updateTask(updated);
    pushToast({
      title: "Task status synchronized",
      description: `Target state: ${destinationStatus}`,
      type: "success",
    });
    try {
      await updateTaskStatus(updated.id, destinationStatus, token);
    } catch {
      pushToast({
        title: "Sync failed",
        description: "Reverting local state.",
        type: "error",
      });
    }
  };

  const handleCreate = () => {
    setActiveTask(null);
    setOpenModal(true);
  };

  const handleSave = async (task: Task) => {
    if (tasks.some((item) => item.id === task.id)) {
      updateTask(task);
      await updateTaskApi(task, token);
      pushToast({ title: "Operation successful", type: "success" });
    } else {
      addTask(task);
      await createTaskApi(task, token);
      pushToast({ title: "Task initialized", type: "success" });
    }
  };

  const handleDelete = async (id: string) => {
    removeTask(id);
    await deleteTask(id, token);
    setOpenModal(false);
    pushToast({ title: "Record purged", type: "info" });
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Layout className="h-3.5 w-3.5 text-slate-400" />
            <select
              className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
            <select
              className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
            >
              {assignees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={handleCreate}
            className="h-10 px-6 rounded-xl text-xs font-bold shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" /> NEW RECORD
          </Button>
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-6 px-6 pb-8 lg:grid-cols-3">
          {columns.map((column) => (
            <SortableContext
              key={column.id}
              items={groupedTasks[column.id].map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                tasks={groupedTasks[column.id]}
              >
                <div className="space-y-4">
                  {groupedTasks[column.id].map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => {
                        setActiveTask(task);
                        setOpenModal(true);
                      }}
                    />
                  ))}
                </div>
              </KanbanColumn>
            </SortableContext>
          ))}
        </div>
      </DndContext>

      <TaskModal
        key={activeTask?.id ?? "new"}
        open={openModal}
        task={activeTask ?? undefined}
        projects={projects.filter((project) => project !== "All")}
        assignees={assignees.filter((developer) => developer !== "All")}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        onDelete={activeTask ? handleDelete : undefined}
      />
    </div>
  );
}
