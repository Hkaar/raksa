/** Citizen shell; each screen renders its own header and picks its responsive `Screen` layout. */
export default function WargaLayout({ children }: LayoutProps<"/">) {
  return <div className="flex min-h-dvh w-full flex-col bg-background">{children}</div>
}
