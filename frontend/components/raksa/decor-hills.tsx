import { cn } from "@/lib/utils"

/** Decor/Hills (pen `hxxHS`): 390×160 three ellipses, scales to container width. */
export function DecorHills({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 390 160"
      preserveAspectRatio="xMidYMax slice"
      className={cn("block h-auto w-full", className)}
    >
      <ellipse cx="380" cy="210" rx="210" ry="210" fill="var(--primary-fixed-dim)" />
      <ellipse cx="80" cy="220" rx="230" ry="200" fill="var(--primary)" />
      <ellipse cx="220" cy="280" rx="260" ry="180" fill="var(--accent-foreground)" />
    </svg>
  )
}
