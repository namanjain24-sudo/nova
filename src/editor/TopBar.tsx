import { useStore } from 'zustand'
import {
  Eye,
  Monitor,
  Redo2,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Undo2,
  Download,
} from 'lucide-react'
import type { Device } from '../core/schema'
import { redo, undo, useEditor } from '../store/editor'
import { exportHtml } from '../export/toHtml'
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
  const doc = useEditor((s) => s.doc)

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
        <button
          onClick={() => exportHtml(doc)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110"
        >
          <Download className="size-3.5" />
          Export
        </button>
      </div>
    </header>
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
