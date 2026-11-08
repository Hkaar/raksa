import type { Metadata, Viewport } from "next"
import { Urbanist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/lib/i18n/provider"
import { Toaster } from "@/components/ui/sonner"
import { MotionProvider } from "@/components/motion-provider"

const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "RAKSA",
  description: "Lapor cepat, nyawa selamat.",
}

export const viewport: Viewport = {
  themeColor: "#F6FAFE",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" suppressHydrationWarning className={cn("h-full antialiased font-sans", urbanist.variable)}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <I18nProvider>
            <MotionProvider>{children}</MotionProvider>
            <Toaster position="bottom-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
