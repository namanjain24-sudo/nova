import { cloneElement, isValidElement, type ReactNode } from 'react'
import type { Device, Node } from './schema'
import { getBlock, resolveStyle } from './schema'
import { useEditor } from '../store/editor'

interface NodeViewProps {
  node: Node
  device: Device
  editMode: boolean
}

function EmptyHint({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '72px',
        width: '100%',
        color: '#94a3b8',
        fontSize: '13px',
        fontFamily: 'Inter, system-ui, sans-serif',
        border: '1.5px dashed #cbd5e1',
        borderRadius: '10px',
        background: 'rgba(148,163,184,0.06)',
      }}
    >
      {label}
    </div>
  )
}

export function NodeView({ node, device, editMode }: NodeViewProps) {
  const def = getBlock(node.type)
  if (!def) return null

  // Hidden nodes are dropped entirely from export/preview, dimmed in the editor.
  const hidden = !!node.props?._hidden
  if (hidden && !editMode) return null

  const style = hidden ? { ...resolveStyle(node, device), opacity: 0.4 } : resolveStyle(node, device)

  let children: ReactNode = node.children?.map((c) => (
    <NodeView key={c.id} node={c} device={device} editMode={editMode} />
  ))

  if (editMode && def.isContainer && (!node.children || node.children.length === 0)) {
    children = <EmptyHint label={`Empty ${def.name.toLowerCase()} — drop or add blocks here`} />
  }

  const el = def.render({ node, style, children, editMode })
  if (!editMode || !isValidElement(el)) return el

  const prev = el.props as any
  return cloneElement(el as any, {
    'data-node-id': node.id,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      useEditor.getState().select(node.id)
    },
    onMouseOver: (e: React.MouseEvent) => {
      e.stopPropagation()
      useEditor.getState().hover(node.id)
    },
    onMouseOut: (e: React.MouseEvent) => {
      e.stopPropagation()
      useEditor.getState().hover(null)
    },
    style: { ...prev.style, cursor: 'default' },
  })
}

/** Render a full document tree. */
export function Renderer({
  doc,
  device,
  editMode,
}: {
  doc: Node
  device: Device
  editMode: boolean
}) {
  return <NodeView node={doc} device={device} editMode={editMode} />
}
