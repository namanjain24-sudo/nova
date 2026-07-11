import { useState } from 'react'
import { ChevronRight, Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import type { Node } from '../core/schema'
import { getBlock } from '../core/schema'
import { useEditor } from '../store/editor'
import { cn } from '../lib/cn'

interface FlatRow {
  node: Node
  depth: number
  hasChildren: boolean
}

function flatten(
  node: Node,
  depth: number,
  collapsed: Set<string>,
  out: FlatRow[],
) {
  const hasChildren = !!node.children && node.children.length > 0
  out.push({ node, depth, hasChildren })
  if (hasChildren && !collapsed.has(node.id)) {
    for (const c of node.children!) flatten(c, depth + 1, collapsed, out)
  }
}

export function LayersPanel() {
  const doc = useEditor((s) => s.doc)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const rows: FlatRow[] = []
  flatten(doc, 0, collapsed, rows)

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="nova-scroll flex-1 overflow-y-auto px-2 py-2">
      {rows.map((row) => (
        <LayerRow
          key={row.node.id}
          row={row}
          collapsed={collapsed.has(row.node.id)}
          onToggle={() => toggle(row.node.id)}
        />
      ))}
    </div>
  )
}

function LayerRow({
  row,
  collapsed,
  onToggle,
}: {
  row: FlatRow
  collapsed: boolean
  onToggle: () => void
}) {
  const { node, depth, hasChildren } = row
  const def = getBlock(node.type)
  const selectedId = useEditor((s) => s.selectedId)
  const select = useEditor((s) => s.select)
  const hover = useEditor((s) => s.hover)
  const deleteNode = useEditor((s) => s.deleteNode)
  const duplicateNode = useEditor((s) => s.duplicateNode)
  const updateProps = useEditor((s) => s.updateProps)

  const isRoot = node.id === useEditor.getState().doc.id
  const selected = selectedId === node.id
  const hidden = !!node.props?._hidden
  const label = labelFor(node, def?.name ?? node.type)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `layer:${node.id}`,
    data: { kind: 'move', id: node.id },
    disabled: isRoot,
  })

  return (
    <div
      ref={setNodeRef}
      onClick={() => select(node.id)}
      onMouseEnter={() => hover(node.id)}
      onMouseLeave={() => hover(null)}
      className={cn(
        'group flex items-center gap-1 rounded-md pr-1 text-[12px] transition',
        selected
          ? 'bg-brand-500/15 text-ink-100'
          : 'text-ink-300 hover:bg-ink-800/70 hover:text-ink-100',
        isDragging && 'opacity-40',
      )}
      style={{ paddingLeft: 4 + depth * 13 }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (hasChildren) onToggle()
        }}
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded text-ink-500',
          hasChildren ? 'hover:text-ink-100' : 'invisible',
        )}
      >
        <ChevronRight
          className={cn('size-3 transition-transform', !collapsed && 'rotate-90')}
        />
      </button>

      {def?.icon && (
        <def.icon
          className={cn('size-3.5 shrink-0', selected ? 'text-brand-400' : 'text-ink-500')}
        />
      )}

      <span
        {...listeners}
        {...attributes}
        className={cn(
          'min-w-0 flex-1 cursor-grab truncate py-1.5 active:cursor-grabbing',
          hidden && 'italic text-ink-500 line-through',
        )}
      >
        {label}
      </span>

      {!isRoot && (
        <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
          <IconMini
            title={hidden ? 'Show' : 'Hide'}
            onClick={(e) => {
              e.stopPropagation()
              updateProps(node.id, { _hidden: !hidden })
            }}
          >
            {hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          </IconMini>
          <IconMini
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation()
              duplicateNode(node.id)
            }}
          >
            <Copy className="size-3" />
          </IconMini>
          <IconMini
            title="Delete"
            danger
            onClick={(e) => {
              e.stopPropagation()
              deleteNode(node.id)
            }}
          >
            <Trash2 className="size-3" />
          </IconMini>
        </div>
      )}
    </div>
  )
}

function IconMini({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'grid size-5 place-items-center rounded text-ink-400',
        danger ? 'hover:bg-red-500/20 hover:text-red-400' : 'hover:bg-ink-700 hover:text-white',
      )}
    >
      {children}
    </button>
  )
}

/** Prefer readable content for the layer label when available. */
function labelFor(node: Node, fallback: string): string {
  const p = node.props ?? {}
  const raw = p.text ?? p.label ?? p.name
  if (typeof raw === 'string' && raw.trim() && node.type !== 'page') {
    const oneLine = raw.replace(/\s+/g, ' ').trim()
    return oneLine.length > 24 ? oneLine.slice(0, 24) + '…' : oneLine
  }
  return fallback
}
