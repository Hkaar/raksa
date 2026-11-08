"use client"

import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { toast } from "sonner"

import { AppHeaderDesktop } from "@/components/raksa/app-header-desktop"
import { LabeledInput } from "@/components/raksa/labeled-input"
import { Screen } from "@/components/raksa/screen"
import { Button } from "@/components/ui/button"
import { ApiError, officerLogin, officerShortcut, type LoginResponse } from "@/lib/api"
import { useI18n } from "@/lib/i18n/provider"
import { saveOfficerSession } from "@/lib/officer-session"

type Errors = { email?: string; password?: string }

/** Officer sign-in (pen `UTLPY`). Authenticates against the backend `/officer/auth/*`. */
export function OfficerLoginScreen() {
  const { m } = useI18n()
  const copy = m.officer.login
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const titleId = useId()

  async function signIn(call: () => Promise<LoginResponse>) {
    setPending(true)
    try {
      saveOfficerSession(await call())
      router.push("/petugas/antrean")
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0
      const code = e instanceof ApiError ? e.code : null
      if (code === "shortcut_unavailable") toast(copy.demoUnavailable)
      else if (status === 401 || status === 422) {
        setErrors({ password: copy.wrongCredentials })
        setPassword("")
      } else if (status === 403) setErrors({ password: copy.notOfficer })
      else toast.error(copy.unavailable)
    } finally {
      setPending(false)
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !password) {
      setErrors({
        email: trimmed ? undefined : m.common.required,
        password: password ? undefined : m.common.required,
      })
      return
    }
    void signIn(() => officerLogin(trimmed, password))
  }

  return (
    <Screen layout="immersive" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] overflow-hidden">
        <div className="absolute top-0 left-[calc(860/1440*100%)] h-[600px] w-[900px] rounded-full bg-primary-fixed-dim" />
        <div className="absolute top-10 left-[-260px] h-[600px] w-[1100px] rounded-full bg-primary" />
        <div className="absolute top-[120px] left-[calc(240/1440*100%)] h-[600px] w-[1300px] rounded-full bg-accent-foreground" />
      </div>
      <AppHeaderDesktop showLogout={false} />
      <div className="relative flex flex-1 items-center justify-center px-4 pt-8 pb-[220px] lg:py-0">
        <form
          noValidate
          onSubmit={submit}
          aria-labelledby={titleId}
          className="flex w-full max-w-[440px] flex-col gap-7 rounded-xl bg-card p-6 outline-1 -outline-offset-1 outline-border sm:p-10"
        >
          <div className="flex flex-col gap-2">
            <h1 id={titleId} className="text-[32px]/[35px] font-bold text-foreground">
              {copy.title}
            </h1>
            <p className="text-base/6 text-muted-foreground">{copy.subtitle}</p>
          </div>
          <div className="flex flex-col gap-3">
            <LabeledInput
              label={copy.emailLabel}
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={copy.emailPlaceholder}
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />
            <LabeledInput
              label={copy.passwordLabel}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={copy.passwordPlaceholder}
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  aria-pressed={showPassword}
                  className="-me-3 inline-flex size-12 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-foreground/8"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden strokeWidth={1.75} className="size-5" />
                  ) : (
                    <Eye aria-hidden strokeWidth={1.75} className="size-5" />
                  )}
                </button>
              }
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast(copy.forgotHelp)}
                className="-my-3.5 -me-3 inline-flex h-12 items-center rounded-full px-3 text-sm font-medium text-primary transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-primary/8"
              >
                {copy.forgot}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
              {copy.submit}
            </Button>
            {/* Not in the design (`UTLPY`): kept as a Button/Teks so the demo sign-in stays reachable. */}
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={pending}
              aria-busy={pending}
              onClick={() => void signIn(officerShortcut)}
            >
              {copy.demo}
            </Button>
          </div>
          <p className="text-sm/[21px] text-muted-foreground">{copy.help}</p>
        </form>
      </div>
    </Screen>
  )
}
