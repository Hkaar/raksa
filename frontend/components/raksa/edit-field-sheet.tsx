"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useI18n } from "@/lib/i18n/provider"

/**
 * Bottom sheet (Sheet `zEBuR`) for correcting one summary row. The caller owns the
 * temporary field state (children = editors) and commits it in `onSave`; the sheet closes after saving.
 */
export function EditFieldSheet({
  open,
  onOpenChange,
  title,
  onSave,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onSave: () => void
  children: React.ReactNode
}) {
  const { m } = useI18n()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
            onOpenChange(false)
          }}
        >
          <div className="flex max-h-[60dvh] flex-col gap-4 overflow-y-auto">{children}</div>
          <SheetFooter>
            <Button type="submit" className="w-full">
              {m.common.save}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
