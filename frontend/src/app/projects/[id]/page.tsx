"use client";

import { useEffect, useState, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import {
  getProjects,
  getSprints,
  createSprint,
  updateSprint,
  addProjectMember,
  removeProjectMember,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import {
  Calendar,
  Users,
  Plus,
  ChevronRight,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState("");
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const { pushToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("workstation-token");
    if (token) {
      Promise.all([
        getProjects(token).then((ps) => ps.find((p) => p.id === id)),
        getSprints(id, token),
      ])
        .then(([proj, spr]) => {
          setProject(proj);
          setSprints(spr);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("workstation-token");
    if (!token || !newMember) return;
    try {
      const updated = await addProjectMember(id, newMember, token);
      setProject(updated);
      setNewMember("");
      pushToast({
        title: "Developer Added",
        description: `${newMember} added to project.`,
        type: "success",
      });
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to add developer.",
        type: "error",
      });
    }
  };

  const handleRemoveMember = async (email: string) => {
    const token = localStorage.getItem("workstation-token");
    if (!token) return;
    try {
      const updated = await removeProjectMember(id, email, token);
      setProject(updated);
      pushToast({
        title: "Developer Removed",
        description: `${email} removed from project.`,
        type: "success",
      });
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to remove developer.",
        type: "error",
      });
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("workstation-token");
    if (!token) return;
    try {
      const created = await createSprint(
        { ...newSprint, projectId: id },
        token,
      );
      setSprints([...sprints, created]);
      setShowSprintModal(false);
      pushToast({
        title: "Scrum Created",
        description: "New scrum started successfully.",
        type: "success",
      });
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to create scrum.",
        type: "error",
      });
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    const token = localStorage.getItem("workstation-token");
    if (!token) return;
    try {
      const updated = await updateSprint(
        sprintId,
        { status: "completed" },
        token,
      );
      setSprints(sprints.map((s) => (s.id === sprintId ? updated : s)));
      pushToast({
        title: "Scrum Completed",
        description: "Scrum has been archived (Read-only mode).",
        type: "success",
      });
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to update scrum status.",
        type: "error",
      });
    }
  };

  if (loading)
    return <div className="p-12 text-center">Loading project details...</div>;
  if (!project)
    return (
      <div className="p-12 text-center text-rose-500">Project not found.</div>
    );

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 rounded-4xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-8 shadow-soft">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {project.name}
                  </h1>
                  <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
                    {project.teamObjective}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {project.members?.map((m: string) => (
                      <div
                        key={m}
                        className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900 bg-brand-500 flex items-center justify-center text-[10px] text-white font-bold"
                        title={m}
                      >
                        {m.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Sprints Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-500" /> Scrums
                    (Sprints)
                  </h2>
                  <Button
                    onClick={() => setShowSprintModal(true)}
                    variant="secondary"
                    className="text-xs py-2 px-3 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> New Scrum
                  </Button>
                </div>

                <div className="space-y-4">
                  {sprints.length === 0 && (
                    <p className="text-slate-500 text-sm italic">
                      No scrums created yet.
                    </p>
                  )}
                  {sprints
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((sprint) => (
                      <div
                        key={sprint.id}
                        className={clsx(
                          "rounded-3xl border p-5 flex items-center justify-between transition",
                          sprint.status === "completed"
                            ? "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-75"
                            : "bg-white dark:bg-slate-900 border-brand-500/20 shadow-sm",
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{sprint.name}</h4>
                            {sprint.status === "completed" && (
                              <Lock className="h-3 w-3 text-slate-400" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                            {new Date(sprint.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {sprint.status === "active" && (
                            <Button
                              variant="secondary"
                              className="text-[10px] py-1 px-3 h-8 flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none"
                              onClick={() => handleCompleteSprint(sprint.id)}
                            >
                              <CheckCircle2 className="h-3 w-3" /> Complete
                            </Button>
                          )}
                          <Link
                            href={`/dashboard?sprintId=${sprint.id}`}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Members Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-500" /> Team Members
                </h2>
                <div className="rounded-4xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
                  <form onSubmit={handleAddMember} className="mb-6">
                    <Label className="text-xs">Add new developer (Email)</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={newMember}
                        onChange={(e) => setNewMember(e.target.value)}
                        placeholder="user@example.com"
                        className="text-xs"
                      />
                      <Button type="submit" variant="primary" className="px-4">
                        Add
                      </Button>
                    </div>
                  </form>
                  <div className="space-y-3">
                    {project.members?.map((m: string) => (
                      <div
                        key={m}
                        className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800 last:border-none"
                      >
                        <span className="truncate max-w-[150px]">{m}</span>
                        {m !== project.ownerId && (
                          <button
                            onClick={() => handleRemoveMember(m)}
                            className="text-rose-500 hover:text-rose-600 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showSprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-4xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Start New Scrum</h2>
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div className="grid gap-2">
                <Label>Scrum Name</Label>
                <Input
                  value={newSprint.name}
                  onChange={(e) =>
                    setNewSprint({ ...newSprint, name: e.target.value })
                  }
                  placeholder="e.g. Sprint 24 - Hero Feature"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newSprint.startDate}
                    onChange={(e) =>
                      setNewSprint({ ...newSprint, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newSprint.endDate}
                    onChange={(e) =>
                      setNewSprint({ ...newSprint, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowSprintModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Start Scrum
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
