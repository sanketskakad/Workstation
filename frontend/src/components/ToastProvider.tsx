"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { X } from "lucide-react";

type Toast = {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info";
};

const ToastContext = createContext<{
  pushToast: (toast: Omit<Toast, "id">) => void;
}>({
  pushToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (toast: Omit<Toast, "id">) => {
    const id = String(Date.now());
    setToasts((current) => [{ id, ...toast }, ...current].slice(0, 4));
    window.setTimeout(
      () => setToasts((current) => current.filter((item) => item.id !== id)),
      4000,
    );
  };

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-3xl border p-4 shadow-soft transition ${
              toast.type === "success"
                ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                : toast.type === "error"
                  ? "border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-100"
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm opacity-80">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button className="rounded-full p-1 text-slate-400 hover:text-slate-900 dark:text-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
