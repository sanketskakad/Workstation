"use client";

import { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition duration-200 focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-500 dark:placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}
