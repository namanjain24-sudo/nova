import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  Cloud,
  ExternalLink,
  FolderOpen,
  Globe,
  Inbox,
  Loader2,
  LogOut,
  Save,
  X,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuth } from '../store/auth'
import { publishToCloud, saveToCloud } from '../api/cloud'

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'
type PublishState = 'idle' | 'publishing'

export function AccountMenu() {
  const user = useAuth((s) => s.user)
  const currentProjectName = useAuth((s) => s.currentProjectName)

  const [open, setOpen] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [publishState, setPublishState] = useState<PublishState>('idle')
  const [liveUrl, setLiveUrl] = useState<string | null>(null)
  const [publishError, setPublishError] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<number | undefined>(undefined)

  // Close on outside click + Escape while open.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => () => window.clearTimeout(saveTimer.current), [])

  if (!user) {
    return (
      <button
        onClick={() => useAuth.getState().setAuthModalOpen(true)}
        className="nova-focus flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-1.5 text-[12.5px] font-semibold text-ink-200 transition hover:bg-ink-800"
      >
        <Cloud className="size-3.5 text-ink-400" />
        Sign in
      </button>
    )
  }

  const initial = user.email.charAt(0).toUpperCase()

  const doSave = async () => {
    if (saveState === 'saving') return
    window.clearTimeout(saveTimer.current)
    setSaveState('saving')
    try {
      await saveToCloud()
      setSaveState('saved')
    } catch {
      setSaveState('failed')
    }
    saveTimer.current = window.setTimeout(() => setSaveState('idle'), 1500)
  }

  const doPublish = async () => {
    if (publishState === 'publishing') return
    setPublishState('publishing')
    setPublishError(false)
    setLiveUrl(null)
    try {
      const url = await publishToCloud()
      setLiveUrl(url)
    } catch {
      setPublishError(true)
    } finally {
      setPublishState('idle')
    }
  }

  const openProjects = () => {
    useAuth.getState().setProjectsOpen(true)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      {/* trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'nova-focus flex items-center gap-1.5 rounded-lg border border-transparent py-1 pl-1 pr-1.5 transition hover:bg-ink-800',
          open && 'bg-ink-800',
        )}
      >
        <span className="grid size-6.5 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[11px] font-bold text-white shadow-md shadow-brand-500/25">
          {initial}
        </span>
        <ChevronDown
          className={cn('size-3.5 text-ink-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {/* dropdown */}
      {open && (
        <div
          role="menu"
          className="animate-pop absolute right-0 top-full z-40 mt-2 w-[280px] overflow-hidden rounded-xl border border-ink-800 bg-ink-900 shadow-2xl shadow-black/50"
        >
          {/* identity header */}
          <div className="flex items-center gap-3 border-b border-ink-800 bg-ink-850/50 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[13px] font-bold text-white shadow-md shadow-brand-500/25">
              {initial}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-ink-100">{user.email}</div>
              {currentProjectName ? (
                <div className="truncate text-[11.5px] text-ink-400">
                  Editing: {currentProjectName}
                </div>
              ) : (
                <div className="text-[11.5px] text-ink-500">Synced to the cloud</div>
              )}
            </div>
          </div>

          <div className="p-1.5">
            <MenuItem
              onClick={doSave}
              icon={
                saveState === 'saving' ? (
                  <Loader2 className="size-4 animate-spin text-ink-400" />
                ) : saveState === 'saved' ? (
                  <Check className="size-4 text-emerald-400" />
                ) : saveState === 'failed' ? (
                  <X className="size-4 text-red-400" />
                ) : (
                  <Save className="size-4 text-ink-400" />
                )
              }
              label={
                saveState === 'saved'
                  ? 'Saved ✓'
                  : saveState === 'failed'
                    ? 'Failed to save'
                    : saveState === 'saving'
                      ? 'Saving…'
                      : 'Save to cloud'
              }
              className={cn(
                saveState === 'saved' && 'text-emerald-400',
                saveState === 'failed' && 'text-red-400',
              )}
            />
            <MenuItem
              onClick={openProjects}
              icon={<FolderOpen className="size-4 text-ink-400" />}
              label="My projects"
            />
            <MenuItem
              onClick={() => {
                useAuth.getState().setSubmissionsOpen(true)
                setOpen(false)
              }}
              icon={<Inbox className="size-4 text-ink-400" />}
              label="Form submissions"
            />
            <MenuItem
              onClick={doPublish}
              icon={
                publishState === 'publishing' ? (
                  <Loader2 className="size-4 animate-spin text-ink-400" />
                ) : (
                  <Globe className="size-4 text-ink-400" />
                )
              }
              label={publishState === 'publishing' ? 'Publishing…' : 'Publish site'}
            />

            {/* publish result */}
            {liveUrl && (
              <div className="mx-1 mt-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                  Live
                </div>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="nova-focus mt-0.5 flex items-center gap-1 truncate rounded text-[12px] font-medium text-ink-100 transition hover:text-emerald-300"
                >
                  <span className="truncate">{liveUrl.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </div>
            )}
            {publishError && (
              <div className="mx-1 mt-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-400">
                Publish failed. Try again in a moment.
              </div>
            )}

            <div className="mx-2 my-1.5 h-px bg-ink-800" />

            <MenuItem
              onClick={() => {
                useAuth.getState().logout()
                setOpen(false)
              }}
              icon={<LogOut className="size-4" />}
              label="Sign out"
              className="text-ink-300 hover:bg-red-500/10 hover:text-red-400"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  onClick,
  icon,
  label,
  className,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  className?: string
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        'nova-focus flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink-200 transition hover:bg-ink-800',
        className,
      )}
    >
      {icon}
      {label}
    </button>
  )
}
