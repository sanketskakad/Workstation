"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Bell, CheckCircle2, MessageSquare, AlertTriangle, Zap, X } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/components/ToastProvider";
import { useNotifications } from "@/context/NotificationContext";

export default function AlertsPage() {
  const { notifications, markAllAsRead, dismiss } = useNotifications();
  const { pushToast } = useToast();

  const handleMarkAllRead = () => {
    markAllAsRead();
    pushToast({ title: "Notifications Cleared", description: "All alerts have been marked as read.", type: "success" });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <section className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Stay updated with your latest project activity and system alerts.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Mark all as read</Button>
            </div>

            <div className="grid gap-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                   <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-4">
                      <Bell className="h-8 w-8" />
                   </div>
                   <h3 className="text-xl font-bold">All clear!</h3>
                   <p className="text-slate-500 max-w-xs mx-auto">No new notifications at this time. Check back later for updates.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  return (
                    <div 
                      key={notif._id}
                      className={clsx(
                        "group relative flex items-start gap-4 p-6 rounded-3xl border transition duration-300",
                        notif.unread 
                          ? "bg-brand-50/50 dark:bg-slate-800/80 border-brand-300 dark:border-brand-500/50 shadow-sm" 
                          : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100"
                      )}
                    >
                      <div className={clsx(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        notif.type === "info" && "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400",
                        notif.type === "success" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                        notif.type === "message" && "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
                        notif.type === "warning" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                      )}>
                        {notif.type === "info" && <Zap className="h-6 w-6" />}
                        {notif.type === "success" && <CheckCircle2 className="h-6 w-6" />}
                        {notif.type === "message" && <MessageSquare className="h-6 w-6" />}
                        {notif.type === "warning" && <AlertTriangle className="h-6 w-6" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                               {new Date(notif.createdAt).toLocaleDateString()}
                             </span>
                             <button 
                               onClick={() => dismiss(notif._id)}
                               className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
                             >
                                <X className="h-4 w-4" />
                             </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                          {notif.description}
                        </p>
                      </div>

                      {notif.unread && (
                        <div className="absolute top-6 left-2 h-2 w-2 rounded-full bg-brand-500 shadow-glow" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
