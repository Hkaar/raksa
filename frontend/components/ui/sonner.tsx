"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const ICON = { strokeWidth: 1.75, "aria-hidden": true, className: "size-5" } as const

/**
 * Toast (`RvZGk`): inverse-surface fill, inverse-on-surface 14px text, 4px radius, 14/16 padding,
 * 12px gap, 358px wide. A leading badge (e.g. `SavedBadge` in `txgHS`) goes in the icon slot:
 * `toast(message, { icon: <SavedBadge /> })`.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon {...ICON} />,
        info: <InfoIcon {...ICON} />,
        warning: <TriangleAlertIcon {...ICON} />,
        error: <OctagonXIcon {...ICON} />,
        loading: <Loader2Icon {...ICON} className="size-5 animate-spin motion-reduce:animate-none" />,
      }}
      style={{ "--width": "358px" } as React.CSSProperties}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "cn-toast flex w-(--width) items-center gap-3 rounded-xs bg-inverse-surface px-4 py-3.5 text-sm tracking-[0.25px] text-inverse-on-surface shadow-[0_4px_12px_var(--shadow-float)]",
          content: "flex flex-1 flex-col gap-0.5",
          title: "font-normal",
          description: "text-inverse-on-surface/80",
          icon: "flex shrink-0 items-center",
          actionButton:
            "ms-auto h-12 shrink-0 rounded-full px-3 text-sm font-medium tracking-[0.1px] text-primary-fixed-dim hover:bg-white/10",
          cancelButton:
            "h-12 shrink-0 rounded-full px-3 text-sm font-medium tracking-[0.1px] text-inverse-on-surface hover:bg-white/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
