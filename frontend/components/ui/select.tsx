"use client"

import * as React from "react"
import { cn } from "cn"
import { Select as SelectPrimitive } from "radix-ui"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

/**
 * Select field (`IRJ9w`): 56px, 1px outline border, 12px radius, chevron-down 24px.
 * `label` renders the design's small floating label (12px) inside the field above the value;
 * open → 2px primary border + primary label, `aria-invalid` → 2px error border + error label.
 */
function SelectTrigger({
  className,
  size = "default",
  label,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
  label?: React.ReactNode
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group/select-trigger flex w-full items-center justify-between gap-3 rounded-md border border-outline bg-transparent px-4 text-start text-base/6 tracking-[0.5px] text-foreground transition-[border-color] duration-[120ms] ease-[var(--ease-raksa)] outline-none select-none data-[size=default]:h-14 data-[size=sm]:h-12 data-placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-primary focus-visible:px-[15px] focus-visible:outline-none data-[state=open]:border-2 data-[state=open]:border-primary data-[state=open]:px-[15px] aria-invalid:border-2 aria-invalid:border-destructive aria-invalid:px-[15px] disabled:cursor-not-allowed disabled:opacity-40 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:block",
        className
      )}
      {...props}
    >
      {label != null ? (
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span
            data-slot="select-label-inline"
            className="text-xs tracking-[0.4px] whitespace-nowrap text-muted-foreground group-focus-visible/select-trigger:text-primary group-data-[state=open]/select-trigger:text-primary group-aria-invalid/select-trigger:text-destructive"
          >
            {label}
          </span>
          <span className="line-clamp-1 w-full">{children}</span>
        </span>
      ) : (
        children
      )}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none size-6 shrink-0 text-muted-foreground"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/** SelectContent (`bfM2c` open state): surface-container fill, outline-variant border, 8px padding, opens 6px below. */
function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-surface-container p-2 text-foreground duration-[120ms] ease-[var(--ease-raksa)] data-[align-trigger=true]:animate-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          position === "popper" &&
            "w-(--radix-select-trigger-width) data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 motion-reduce:slide-in-from-top-0 motion-reduce:slide-in-from-bottom-0",
          className
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className="flex flex-col gap-0.5 data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)"
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-3 py-1 text-xs tracking-[0.4px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** SelectItem: 48px, 12px side padding, 8px radius; selected = secondary-container fill. */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-12 w-full cursor-default items-center gap-2 rounded-sm ps-3 pe-10 text-base text-foreground outline-hidden select-none transition-colors duration-[120ms] data-highlighted:bg-state-hover data-[state=checked]:bg-secondary-container data-[state=checked]:text-on-secondary-container data-disabled:pointer-events-none data-disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute end-3 flex size-5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon strokeWidth={1.75} aria-hidden className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-2 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-surface-container py-1 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    >
      <ChevronUpIcon strokeWidth={1.75} aria-hidden />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-surface-container py-1 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    >
      <ChevronDownIcon strokeWidth={1.75} aria-hidden />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
