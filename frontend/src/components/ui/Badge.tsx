import { clsx } from "clsx";

interface BadgeProps {
  variant?: "low" | "medium" | "high";
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "medium", className, children }: BadgeProps) {
  const color =
    variant === "high"
      ? "bg-rose-500/15 text-rose-300"
      : variant === "low"
        ? "bg-emerald-500/10 text-emerald-300"
        : "bg-amber-500/15 text-amber-300";

  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 text-xs font-semibold",
        color,
        className,
      )}
    >
      {children}
    </span>
  );
}
