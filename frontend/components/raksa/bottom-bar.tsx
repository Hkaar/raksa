import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * BottomBar (pen `XoYs9`): sticky footer, padding 12/16, holds a full-width action.
 * `mt-auto` pins it to the bottom of a short flex column (e.g. the `md` compact card).
 */
export function BottomBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 mt-auto flex w-full items-center gap-2 bg-background px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] [&>*]:flex-1",
        className,
      )}
    >
      {children}
    </div>
  )
}
