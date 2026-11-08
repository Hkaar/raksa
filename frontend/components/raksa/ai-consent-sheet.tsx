"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useI18n } from "@/lib/i18n/provider"

/** Asks before voice, story or wound video is sent to the AI service. Dismissing decides nothing. */
export function AiConsentSheet({
  open,
  onDecide,
  onDismiss,
}: {
  open: boolean
  onDecide: (granted: boolean) => void
  onDismiss: () => void
}) {
  const { m } = useI18n()
  const copy = m.lapor.aiConsent
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? undefined : onDismiss())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{copy.title}</SheetTitle>
        </SheetHeader>
        <ul className="flex flex-col gap-2 text-base/6 tracking-[0.5px] text-foreground">
          {copy.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <SheetFooter>
          <Button type="button" className="w-full" onClick={() => onDecide(true)}>
            {copy.accept}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => onDecide(false)}>
            {copy.decline}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
