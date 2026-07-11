import { useState, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { getBlock } from '../core/schema'
import { findNode } from '../lib/tree'
import { useEditor } from '../store/editor'
import { useDrag, type DragSource } from './dragStore'

/** Wraps the editor so palette items and canvas nodes can be dragged. */
export function DndProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<DragSource | null>(null)
  const begin = useDrag((s) => s.begin)
  const drag = useDrag((s) => s.move)
  const end = useDrag((s) => s.end)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function onStart(e: DragStartEvent) {
    const src = e.active.data.current as DragSource | undefined
    if (!src) return
    setActive(src)
    begin(src)
  }

  function onMove(e: DragMoveEvent) {
    const act = e.activatorEvent as PointerEvent
    if (act && typeof act.clientX === 'number') {
      drag({ x: act.clientX + e.delta.x, y: act.clientY + e.delta.y })
    }
  }

  function onEnd() {
    end()
    setActive(null)
  }

  function onCancel() {
    useDrag.setState({ source: null, target: null, indicator: null })
    setActive(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onStart}
      onDragMove={onMove}
      onDragEnd={onEnd}
      onDragCancel={onCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>{active && <DragGhost source={active} />}</DragOverlay>
    </DndContext>
  )
}

function DragGhost({ source }: { source: DragSource }) {
  let label = 'Block'
  let Icon = getBlock('section')?.icon
  if (source.kind === 'new') {
    const def = getBlock(source.type)
    label = def?.name ?? source.type
    Icon = def?.icon
  } else {
    const node = findNode(useEditor.getState().doc, source.id)
    const def = node ? getBlock(node.type) : undefined
    label = def?.name ?? 'Block'
    Icon = def?.icon
  }
  return (
    <div className="pointer-events-none flex items-center gap-2 rounded-xl border border-brand-500/60 bg-ink-900/95 px-3 py-2 text-[12px] font-semibold text-ink-100 shadow-2xl shadow-brand-500/30 backdrop-blur">
      {Icon && <Icon className="size-4 text-brand-400" />}
      {label}
    </div>
  )
}
