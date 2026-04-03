"use client";

import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-600 text-white shadow-premium hover:bg-brand-700 active:scale-[0.98]",
    secondary: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
    outline: "border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200",
    danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px] font-bold tracking-wider",
    md: "px-6 py-2.5 text-xs font-bold tracking-widest",
    lg: "px-8 py-3.5 text-sm font-bold tracking-widest",
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
