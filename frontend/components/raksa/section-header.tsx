import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** SectionHeader (pen `KCq7j`): 16px/500 label left, optional action (e.g. Button Teks "Ubah") right. */
export function SectionHeader({
  title,
  action,
  as: Tag = "h2",
  className,
}: {
  title: ReactNode
  action?: ReactNode
  as?: "h2" | "h3" | "div"
  className?: string
}) {
  return (
    <div className={cn("flex w-full items-center justify-between pb-1", className)}>
      <Tag className="text-base font-medium text-foreground">{title}</Tag>
      {action}
    </div>
  )
}
