import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTaskDetail } from "@/lib/api";
import { TaskDetailsPanel } from "@/components/TaskDetailsPanel";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

interface TaskDetailsPageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export default async function TaskDetailsPage({
  params,
}: Readonly<TaskDetailsPageProps>) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("workstation-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let task;
  try {
    task = await getTaskDetail(id, token);
  } catch {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <TaskDetailsPanel task={task} />
          </section>
        </div>
      </div>
    </main>
  );
}
