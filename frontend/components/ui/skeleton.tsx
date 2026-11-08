import { cn } from "cn"

/** Skeleton (`Jii2d`): 16px muted line, 8px radius; pulse stops with reduced motion. Stack lines with `gap-3`. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("h-4 animate-pulse rounded-sm bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
