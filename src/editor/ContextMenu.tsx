import { useEffect } from 'react'
import {
  Copy, Scissors, ClipboardPaste, ChevronUp, ChevronDown, Component, Trash2, LayoutTemplate, Files,
} from 'lucide-react'
import { useEditor } from '../store/editor'
import { findNode } from '../lib/tree'
import { getBlock } from '../core/schema'

export interface MenuState { x: number; y: number; nodeId: string }

export function ContextMenu({ menu, onClose }: { menu: MenuState; onClose: () => void }) {
  const clipboard = useEditor((s) => !!s.clipboard)
  const doc = useEditor((s) => s.doc)
  const node = findNode(doc, menu.nodeId)
  const isRoot = menu.nodeId === doc.id
  const isInstance = node?.type === 'instance'
  const name = node ? getBlock(node.type)?.name : ''

  useEffect(() => {
    const close = () => onClose()
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const s = useEditor.getState()
  const run = (fn: () => void) => { fn(); onClose() }

  // Clamp so the menu stays on-screen.
  const W = 216, H = 340
  const left = Math.min(menu.x, window.innerWidth - W - 8)
  const top = Math.min(menu.y, window.innerHeight - H - 8)

  type Item = { icon: typeof Copy; label: string; hint?: string; onClick: () => void; danger?: boolean; disabled?: boolean } | 'divider'
  const items: Item[] = isRoot
    ? [
        { icon: LayoutTemplate, label: 'Add a section', onClick: () => run(() => s.setSectionsOpen(true)) },
        { icon: ClipboardPaste, label: 'Paste', hint: '⌘V', disabled: !clipboard, onClick: () => run(() => s.pasteNode()) },
      ]
    : [
        { icon: Files, label: 'Duplicate', hint: '⌘D', onClick: () => run(() => s.duplicateNode(menu.nodeId)) },
        { icon: Copy, label: 'Copy', hint: '⌘C', onClick: () => run(() => s.copyNode(menu.nodeId)) },
        { icon: Scissors, label: 'Cut', hint: '⌘X', onClick: () => run(() => s.cutNode(menu.nodeId)) },
        { icon: ClipboardPaste, label: 'Paste', hint: '⌘V', disabled: !clipboard, onClick: () => run(() => s.pasteNode()) },
        'divider',
        { icon: ChevronUp, label: 'Move up', hint: '⌥↑', onClick: () => run(() => s.moveNodeBy(menu.nodeId, -1)) },
        { icon: ChevronDown, label: 'Move down', hint: '⌥↓', onClick: () => run(() => s.moveNodeBy(menu.nodeId, 1)) },
        'divider',
        ...(isInstance
          ? [{ icon: Component, label: 'Edit component', onClick: () => run(() => s.enterComponent(node!.props.componentId as string)) } as Item]
          : [{
              icon: Component, label: 'Save as component',
              onClick: () => run(() => {
                const n = window.prompt('Name this component (reuse it on any page):', name || 'Component')
                if (n?.trim()) s.saveAsComponent(menu.nodeId, n.trim())
              }),
            } as Item]),
        { icon: LayoutTemplate, label: 'Add a section', onClick: () => run(() => s.setSectionsOpen(true)) },
        'divider',
        { icon: Trash2, label: 'Delete', hint: '⌫', danger: true, onClick: () => run(() => s.deleteNode(menu.nodeId)) },
      ]

  return (
    <>
      <div className="fixed inset-0 z-[65]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <div
        className="animate-pop fixed z-[66] w-54 overflow-hidden rounded-xl border border-ink-700 bg-ink-900/98 p-1.5 shadow-2xl shadow-black/60 backdrop-blur"
        style={{ left, top, width: W }}
        onClick={(e) => e.stopPropagation()}
      >
        {name && !isRoot && (
          <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-ink-500">{name}</div>
        )}
        {items.map((it, i) =>
          it === 'divider' ? (
            <div key={i} className="my-1 h-px bg-ink-800" />
          ) : (
            <button
              key={i}
              disabled={it.disabled}
              onClick={it.onClick}
              className={`nova-focus flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition disabled:opacity-35 ${
                it.danger ? 'text-red-300 hover:bg-red-500/15' : 'text-ink-200 enabled:hover:bg-ink-800'
              }`}
            >
              <it.icon className={`size-3.5 ${it.danger ? 'text-red-400' : 'text-ink-400'}`} />
              <span className="flex-1">{it.label}</span>
              {it.hint && <kbd className="text-[10px] text-ink-500">{it.hint}</kbd>}
            </button>
          ),
        )}
      </div>
    </>
  )
}
