import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "sage" | "clay" | "bone";
  className?: string;
}) {
  const tones = {
    muted: "text-muted shadow-[var(--shadow-border)]",
    sage: "text-sage bg-sage/10",
    clay: "text-clay bg-clay/10",
    bone: "text-bone shadow-[var(--shadow-border)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
