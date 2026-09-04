import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronUp, ChevronDown, Component, Copy, GripVertical, Trash2 } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { getBlock } from '../core/schema'
import { findNode, findParent } from '../lib/tree'
import { useEditor } from '../store/editor'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

function rectOf(container: HTMLElement, id: string): Rect | null {
  const el = container.querySelector<HTMLElement>(`[data-node-id="${id}"]`)
  if (!el) return null
  const c = container.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  return { top: r.top - c.top, left: r.left - c.left, width: r.width, height: r.height }
}

export function SelectionOverlay({
  containerRef,
  scrollRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  const doc = useEditor((s) => s.doc)
  const device = useEditor((s) => s.device)
  const selectedId = useEditor((s) => s.selectedId)
  const hoveredId = useEditor((s) => s.hoveredId)
  const deleteNode = useEditor((s) => s.deleteNode)
  const duplicateNode = useEditor((s) => s.duplicateNode)
  const moveNodeBy = useEditor((s) => s.moveNodeBy)
  const saveAsComponent = useEditor((s) => s.saveAsComponent)

  const [sel, setSel] = useState<Rect | null>(null)
  const [hov, setHov] = useState<Rect | null>(null)
  const raf = useRef<number>(0)

  const recompute = useCallback(() => {
    const c = containerRef.current
    if (!c) return
    const nextSel = selectedId ? rectOf(c, selectedId) : null
    const nextHov = hoveredId && hoveredId !== selectedId ? rectOf(c, hoveredId) : null
    setSel((prev) => (sameRect(prev, nextSel) ? prev : nextSel))
    setHov((prev) => (sameRect(prev, nextHov) ? prev : nextHov))
  }, [containerRef, selectedId, hoveredId])

  useLayoutEffect(() => {
    recompute()
  }, [recompute, doc, device])

  useEffect(() => {
    const loop = () => {
      recompute()
      raf.current = requestAnimationFrame(loop)
    }
    // Keep overlays glued during transitions/scroll without heavy listeners.
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [recompute])

  const selNode = selectedId ? findNode(doc, selectedId) : null
  const hovNode = hoveredId ? findNode(doc, hoveredId) : null
  const selName = selNode ? getBlock(selNode.type)?.name : ''
  const hovName = hovNode ? getBlock(hovNode.type)?.name : ''
  const isRoot = selectedId === doc.id
  const selParent = selectedId && !isRoot ? findParent(doc, selectedId) : null
  const selIndex = selParent?.children?.findIndex((c) => c.id === selectedId) ?? -1
  const canUp = selIndex > 0
  const canDown = selParent?.children ? selIndex >= 0 && selIndex < selParent.children.length - 1 : false

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {hov && (
        <div
          className="absolute rounded-[3px]"
          style={{
            top: hov.top,
            left: hov.left,
            width: hov.width,
            height: hov.height,
            outline: '1.5px solid rgba(139,92,246,0.55)',
            outlineOffset: '-1px',
          }}
        >
          <span className="absolute -top-[19px] left-0 rounded-md bg-brand-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {hovName}
          </span>
        </div>
      )}

      {sel && (
        <div
          className="absolute rounded-[3px]"
          style={{
            top: sel.top,
            left: sel.left,
            width: sel.width,
            height: sel.height,
            outline: '2px solid #8b5cf6',
            outlineOffset: '-1px',
          }}
        >
          <div
            className="pointer-events-auto absolute right-0 flex items-center gap-0.5 rounded-lg border border-ink-700 bg-ink-900/95 px-1 py-1 shadow-xl backdrop-blur"
            style={{ top: sel.top < 40 ? sel.height + 8 : -34 }}
          >
            {!isRoot && selectedId && <MoveHandle id={selectedId} />}
            <span className="px-1.5 text-[11px] font-semibold text-brand-400">
              {selName}
            </span>
            {!isRoot && selNode?.type === 'instance' && (
              <button
                title="Edit component — updates every page (or double-click it)"
                onClick={() => selNode && useEditor.getState().enterComponent(selNode.props.componentId as string)}
                className="nova-focus flex items-center gap-1 rounded-md bg-brand-600/90 px-1.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-500"
              >
                <Component className="size-3.5" />
                Edit
              </button>
            )}
            {!isRoot && (
              <>
                <button
                  title="Move up (⌥↑)"
                  disabled={!canUp}
                  onClick={() => selectedId && moveNodeBy(selectedId, -1)}
                  className="nova-focus rounded-md p-1 text-ink-300 enabled:hover:bg-ink-700 enabled:hover:text-white disabled:opacity-30"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  title="Move down (⌥↓)"
                  disabled={!canDown}
                  onClick={() => selectedId && moveNodeBy(selectedId, 1)}
                  className="nova-focus rounded-md p-1 text-ink-300 enabled:hover:bg-ink-700 enabled:hover:text-white disabled:opacity-30"
                >
                  <ChevronDown className="size-3.5" />
                </button>
                <button
                  title="Duplicate (⌘D)"
                  onClick={() => selectedId && duplicateNode(selectedId)}
                  className="nova-focus rounded-md p-1 text-ink-300 hover:bg-ink-700 hover:text-white"
                >
                  <Copy className="size-3.5" />
                </button>
                {selNode?.type !== 'instance' && (
                  <button
                    title="Save as component (reuse everywhere)"
                    onClick={() => {
                      if (!selectedId) return
                      const name = window.prompt('Name this component (reuse it on any page):', selName || 'Component')
                      if (name?.trim()) saveAsComponent(selectedId, name.trim())
                    }}
                    className="nova-focus rounded-md p-1 text-ink-300 hover:bg-brand-500/20 hover:text-brand-300"
                  >
                    <Component className="size-3.5" />
                  </button>
                )}
                <button
                  title="Delete"
                  onClick={() => selectedId && deleteNode(selectedId)}
                  className="nova-focus rounded-md p-1 text-ink-300 hover:bg-red-500/20 hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MoveHandle({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `move:${id}`,
    data: { kind: 'move', id },
  })
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title="Drag to move"
      className={
        'nova-focus cursor-grab rounded-md p-1 text-ink-300 hover:bg-ink-700 hover:text-white active:cursor-grabbing ' +
        (isDragging ? 'text-brand-400' : '')
      }
    >
      <GripVertical className="size-3.5" />
    </button>
  )
}
