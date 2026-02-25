"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { getProjects, createProject } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { FolderKanban, Plus, Users, Calendar } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", teamObjective: "", details: "" });
  const { pushToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("workstation-token");
    if (token) {
      getProjects(token).then((data) => {
        setProjects(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("workstation-token");
    if (!token) return;

    try {
      const created = await createProject(newProject, token);
      setProjects([...projects, created]);
      setShowModal(false);
      setNewProject({ name: "", teamObjective: "", details: "" });
      pushToast({ title: "Project Created", description: "Successfully added new project.", type: "success" });
    } catch (err) {
      pushToast({ title: "Error", description: "Failed to create project.", type: "error" });
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-4xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
                  Management
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  Projects
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Manage your team projects, objectives, and members.
                </p>
              </div>
              <Button onClick={() => setShowModal(true)} variant="primary" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> New Project
              </Button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading projects...</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.id}`}
                    className="group flex flex-col justify-between rounded-4xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 transition hover:border-brand-500/50 hover:shadow-lg"
                  >
                    <div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                        <FolderKanban className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-brand-500">
                        {project.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                        {project.teamObjective}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {project.members?.length ?? 0} members
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-4xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-2">
                <Label>Project Name</Label>
                <Input 
                  value={newProject.name} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})} 
                  placeholder="e.g. Q3 Roadmap" 
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Team Objective</Label>
                <Input 
                  value={newProject.teamObjective} 
                  onChange={e => setNewProject({...newProject, teamObjective: e.target.value})} 
                  placeholder="What is the main goal?" 
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Details (Optional)</Label>
                <textarea 
                  className="flex min-h-24 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white"
                  value={newProject.details} 
                  onChange={e => setNewProject({...newProject, details: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
