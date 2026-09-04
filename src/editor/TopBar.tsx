import { useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'
import {
  Code2,
  Database,
  Eye,
  FileCode,
  FileArchive,
  LayoutGrid,
  Monitor,
  Redo2,
  Rocket,
  Search,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Undo2,
  Download,
} from 'lucide-react'
import type { Device } from '../core/schema'
import { getSitePages, redo, undo, useEditor } from '../store/editor'
import { exportPageHtml, exportSiteZip } from '../export/toHtml'
import { exportReact } from '../export/toReact'
import { AccountMenu } from './AccountMenu'
import { cn } from '../lib/cn'

const DEVICES: { id: Device; icon: typeof Monitor; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
]

export function TopBar() {
  const device = useEditor((s) => s.device)
  const setDevice = useEditor((s) => s.setDevice)
  const previewMode = useEditor((s) => s.previewMode)
  const togglePreview = useEditor((s) => s.togglePreview)
  const clearPage = useEditor((s) => s.clearPage)

  const canUndo = useStore(useEditor.temporal, (s) => s.pastStates.length > 0)
  const canRedo = useStore(useEditor.temporal, (s) => s.futureStates.length > 0)

  return (
    <header className="flex h-13 shrink-0 items-center gap-3 border-b border-ink-800 bg-ink-900 px-3 py-2.5">
      {/* brand */}
      <div className="flex items-center gap-2 pl-1 pr-2">
        <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/30">
          <Sparkles className="size-4 text-white" />
        </div>
        <span className="text-[14px] font-bold tracking-tight text-ink-100">Nova</span>
      </div>

      {/* templates */}
      <button
        onClick={() => useEditor.getState().setTemplatesOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-ink-700 px-2.5 py-1.5 text-[12px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
      >
        <LayoutGrid className="size-3.5 text-brand-400" />
        Templates
      </button>

      {/* CMS */}
      <button
        onClick={() => useEditor.getState().setCmsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-ink-700 px-2.5 py-1.5 text-[12px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
      >
        <Database className="size-3.5 text-brand-400" />
        CMS
      </button>

      {/* command palette */}
      <button
        onClick={() => useEditor.getState().setCommandOpen(true)}
        title="Command palette"
        className="flex items-center gap-1.5 rounded-lg border border-ink-700 py-1.5 pl-2.5 pr-1.5 text-[12px] font-medium text-ink-400 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
      >
        <Search className="size-3.5" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="rounded border border-ink-700 bg-ink-850 px-1 py-0.5 text-[9.5px] font-semibold leading-none text-ink-400">⌘K</kbd>
      </button>

      <div className="mx-1 h-5 w-px bg-ink-800" />

      {/* history */}
      <div className="flex items-center gap-0.5">
        <IconBtn label="Undo" disabled={!canUndo} onClick={() => undo()}>
          <Undo2 className="size-4" />
        </IconBtn>
        <IconBtn label="Redo" disabled={!canRedo} onClick={() => redo()}>
          <Redo2 className="size-4" />
        </IconBtn>
      </div>

      {/* device switch (centered) */}
      <div className="mx-auto flex items-center gap-0.5 rounded-xl border border-ink-800 bg-ink-850 p-0.5">
        {DEVICES.map((d) => (
          <button
            key={d.id}
            title={d.label}
            onClick={() => setDevice(d.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition',
              device === d.id
                ? 'bg-ink-700 text-ink-100 shadow'
                : 'text-ink-400 hover:text-ink-200',
            )}
          >
            <d.icon className="size-3.5" />
          </button>
        ))}
      </div>

      {/* right actions */}
      <div className="flex items-center gap-1.5">
        <IconBtn label="Clear page" onClick={() => confirmClear(clearPage)}>
          <Trash2 className="size-4" />
        </IconBtn>
        <button
          onClick={togglePreview}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition',
            previewMode
              ? 'border-accent-500/50 bg-accent-500/15 text-accent-400'
              : 'border-ink-700 text-ink-300 hover:bg-ink-800 hover:text-ink-100',
          )}
        >
          <Eye className="size-3.5" />
          Preview
        </button>
        <ExportMenu />
        <div className="mx-0.5 h-5 w-px bg-ink-800" />
        <AccountMenu />
      </div>
    </header>
  )
}

function ExportMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const doc = useEditor((s) => s.doc)
  const pages = useEditor((s) => s.pages)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as any)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const siteName = (pages[0]?.name || 'nova-site').toString()

  const publish = async () => {
    setOpen(false)
    await exportSiteZip(getSitePages(), siteName)
    window.open('https://app.netlify.com/drop', '_blank', 'noopener')
    setTimeout(
      () =>
        window.alert(
          'Your site .zip is downloading.\n\nNetlify Drop just opened in a new tab — drag the .zip (or unzipped folder) onto it to get a free live URL in seconds.',
        ),
      400,
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110"
      >
        <Download className="size-3.5" />
        Export
      </button>
      {open && (
        <div className="animate-pop absolute right-0 top-[calc(100%+8px)] z-40 w-64 overflow-hidden rounded-xl border border-ink-700 bg-ink-900 p-1.5 shadow-2xl shadow-black/50">
          <MenuItem
            icon={Rocket}
            title="Publish free"
            sub="Get a live URL via Netlify Drop"
            accent
            onClick={publish}
          />
          <div className="my-1 h-px bg-ink-800" />
          <MenuItem
            icon={FileArchive}
            title="Download site (.zip)"
            sub={`${pages.length} page${pages.length > 1 ? 's' : ''}, ready to deploy`}
            onClick={() => {
              setOpen(false)
              exportSiteZip(getSitePages(), siteName)
            }}
          />
          <MenuItem
            icon={FileCode}
            title="Download this page (.html)"
            sub="Single self-contained file"
            onClick={() => {
              setOpen(false)
              exportPageHtml(doc)
            }}
          />
          <MenuItem
            icon={Code2}
            title="Export as React (.jsx)"
            sub="Clean JSX component of this page"
            onClick={() => {
              setOpen(false)
              exportReact(doc, (doc.props?.name as string) || 'Page')
            }}
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  title,
  sub,
  onClick,
  accent,
}: {
  icon: typeof Rocket
  title: string
  sub: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-ink-800"
    >
      <div
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-lg',
          accent ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white' : 'bg-ink-800 text-ink-300',
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-100">{title}</div>
        <div className="truncate text-[11px] text-ink-400">{sub}</div>
      </div>
    </button>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="nova-focus rounded-lg p-2 text-ink-300 transition hover:bg-ink-800 hover:text-ink-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function confirmClear(clear: () => void) {
  if (window.confirm('Clear the entire page? This cannot be undone easily.')) clear()
}
