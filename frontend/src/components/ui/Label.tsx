import { LabelHTMLAttributes } from "react";
import { clsx } from "clsx";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={clsx("block text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-1.5", className)}
      {...props}
    />
  );
}
