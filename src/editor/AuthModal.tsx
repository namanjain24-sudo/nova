import { useEffect, useRef, useState } from 'react'
import { Loader2, Lock, Mail, Sparkles, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuth } from '../store/auth'

type Mode = 'signin' | 'signup'

export function AuthModal() {
  const open = useAuth((s) => s.authModalOpen)
  const busy = useAuth((s) => s.busy)

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const close = () => useAuth.getState().setAuthModalOpen(false)

  // Reset transient state each time the modal opens, and autofocus the email field.
  useEffect(() => {
    if (!open) return
    setError(null)
    setPassword('')
    const id = window.setTimeout(() => emailRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!open) return null

  const isSignin = mode === 'signin'

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    try {
      if (isSignin) await useAuth.getState().login(email, password)
      else await useAuth.getState().signup(email, password)
      // Store closes the modal itself on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nova-auth-title"
    >
      <div className="animate-pop w-full max-w-[420px] overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-2xl shadow-black/50">
        {/* header */}
        <div className="relative px-7 pt-7">
          <button
            onClick={close}
            aria-label="Close"
            className="nova-focus absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-800 hover:text-white"
          >
            <X className="size-4" />
          </button>

          <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/30">
            <Sparkles className="size-5 text-white" />
          </div>
          <h2 id="nova-auth-title" className="mt-4 text-[19px] font-bold tracking-tight text-ink-100">
            {isSignin ? 'Welcome back to Nova' : 'Create your account'}
          </h2>
          <p className="mt-1 text-[13px] text-ink-400">
            {isSignin
              ? 'Sign in to sync, save, and publish your sites.'
              : 'One account for every site you build.'}
          </p>
        </div>

        {/* mode toggle */}
        <div className="mx-7 mt-5 grid grid-cols-2 gap-1 rounded-lg border border-ink-800 bg-ink-950/60 p-1">
          {(
            [
              ['signin', 'Sign in'],
              ['signup', 'Create account'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              className={cn(
                'nova-focus rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition',
                mode === m
                  ? 'bg-ink-800 text-ink-100 shadow-sm'
                  : 'text-ink-400 hover:text-ink-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* form */}
        <form onSubmit={submit} className="px-7 pb-7 pt-5">
          <label className="block text-[12px] font-semibold text-ink-300" htmlFor="nova-auth-email">
            Email
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <input
              id="nova-auth-email"
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="you@example.com"
              className="nova-focus w-full rounded-lg border border-ink-700 bg-ink-850 py-2 pl-9 pr-3 text-[13px] text-ink-100 placeholder:text-ink-500"
            />
          </div>

          <label
            className="mt-4 block text-[12px] font-semibold text-ink-300"
            htmlFor="nova-auth-password"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <input
              id="nova-auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={isSignin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder={isSignin ? 'Your password' : 'At least 6 characters'}
              className="nova-focus w-full rounded-lg border border-ink-700 bg-ink-850 py-2 pl-9 pr-3 text-[13px] text-ink-100 placeholder:text-ink-500"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-400"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={cn(
              'nova-focus mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110',
              busy && 'cursor-not-allowed opacity-70 hover:brightness-100',
            )}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy
              ? isSignin
                ? 'Signing in…'
                : 'Creating account…'
              : isSignin
                ? 'Sign in'
                : 'Create account'}
          </button>

          <p className="mt-4 text-center text-[12.5px] text-ink-400">
            {isSignin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(isSignin ? 'signup' : 'signin')}
              className="nova-focus rounded font-semibold text-brand-400 transition hover:text-brand-500"
            >
              {isSignin ? 'Create one' : 'Sign in'}
            </button>
          </p>

          <p className="mt-3 text-center text-[11.5px] text-ink-500">
            Free forever. Your projects sync to the cloud.
          </p>
        </form>
      </div>
    </div>
  )
}
