import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-elevated px-3 text-sm text-bone placeholder:text-subtle shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 focus:shadow-[0_0_0_1px_rgb(232_226_214_/_0.35)]",
        className,
      )}
      {...props}
    />
  );
}
