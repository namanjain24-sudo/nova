import type { CSSProperties } from 'react'
import { Component, Database } from 'lucide-react'
import type { Device } from '../core/schema'
import { makeNode, registerBlock } from '../core/schema'
import { NodeView } from '../core/Renderer'
import { useEditor, type CollectionItem } from '../store/editor'

/** Live, read-only preview of a component master (stays in sync when the master changes). */
function MasterView({ id, device }: { id: string; device: Device }) {
  const comp = useEditor((s) => s.components[id])
  if (!comp) {
    return (
      <div
        style={{
          padding: '18px',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '10px',
          color: '#94a3b8',
          fontSize: '13px',
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        Missing component
      </div>
    )
  }
  return <NodeView node={comp.root} device={device} editMode={false} />
}

/** An instance of a component master. Renders the shared master; in the editor,
 *  internal links are neutralised (you edit via "Edit component"), while in preview
 *  the Canvas handler turns header/footer links into real page navigation. */
function InstanceView({
  componentId,
  device,
  style,
  ...rest // data-node-id / onClick / hover injected by NodeView must reach the DOM div
}: { componentId: string; device: Device; style: CSSProperties; [k: string]: unknown }) {
  const previewMode = useEditor((s) => s.previewMode)
  return (
    <div
      {...rest}
      style={{ display: 'block', width: '100%', ...style }}
      // Edit mode: a header/footer link must not navigate the browser away.
      onClickCapture={
        previewMode
          ? undefined
          : (e) => {
              if ((e.target as HTMLElement).closest('a')) e.preventDefault()
            }
      }
      // Double-click a symbol to edit it (all instances update). Framer-style.
      onDoubleClick={
        previewMode
          ? undefined
          : (e) => {
              e.stopPropagation()
              if (componentId) useEditor.getState().enterComponent(componentId)
            }
      }
    >
      <MasterView id={componentId} device={device} />
    </div>
  )
}

registerBlock({
  type: 'instance',
  name: 'Component',
  category: 'layout',
  icon: Component,
  keywords: ['component', 'instance', 'reusable', 'symbol', 'global', 'header', 'footer'],
  create: () => makeNode('instance', { componentId: '', name: 'Component' }, { display: 'block', width: '100%' }),
  render: ({ node, style, device }) => (
    <InstanceView componentId={node.props.componentId} device={device} style={style} />
  ),
})

/* ------------------------------------------------------------------ */
/*  Collection list — renders CMS items as a card grid                 */
/* ------------------------------------------------------------------ */

const hint = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gridColumn: '1 / -1',
  minHeight: '160px',
  padding: '24px',
  border: '1.5px dashed #cbd5e1',
  borderRadius: '14px',
  color: '#94a3b8',
  fontSize: '13px',
  fontFamily: 'Inter, system-ui, sans-serif',
  textAlign: 'center' as const,
}

function ItemCard({ item }: { item: CollectionItem }) {
  const card = (
    <>
      {item.image && (
        <img
          src={item.image}
          alt={item.title || ''}
          style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: '14px' }}
          draggable={false}
        />
      )}
      {item.tag && (
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7c3aed' }}>
          {item.tag}
        </span>
      )}
      {item.title && (
        <div style={{ fontSize: '19px', fontWeight: 700, lineHeight: 1.25, color: '#0f172a' }}>{item.title}</div>
      )}
      {item.subtitle && (
        <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#64748b' }}>{item.subtitle}</div>
      )}
    </>
  )
  const style = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    padding: '14px',
    background: '#ffffff',
    border: '1px solid #eef2f7',
    borderRadius: '18px',
    boxShadow: '0 20px 45px -30px rgba(15,23,42,0.35)',
    textDecoration: 'none',
  }
  return item.url ? (
    <a href={item.url} style={style}>{card}</a>
  ) : (
    <div style={style}>{card}</div>
  )
}

function CollectionGrid({ collectionId, style }: { collectionId: string; style: React.CSSProperties }) {
  // Subscribe for live editor updates, but read the value via getState() so it's also
  // correct under renderToStaticMarkup (whose getServerSnapshot returns initial state).
  useEditor((s) => s.collections)
  const collection = useEditor.getState().collections.find((c) => c.id === collectionId)
  if (!collection) return <div style={style}><div style={hint}>Pick a collection in the CMS</div></div>
  if (collection.items.length === 0)
    return <div style={style}><div style={hint}>“{collection.name}” has no items yet — add some in the CMS.</div></div>
  return (
    <div style={style}>
      {collection.items.map((it) => (
        <ItemCard key={it.id} item={it} />
      ))}
    </div>
  )
}

registerBlock({
  type: 'collectionList',
  name: 'Collection list',
  category: 'content',
  icon: Database,
  keywords: ['cms', 'collection', 'dynamic', 'list', 'grid', 'blog', 'catalog'],
  inspector: ['spacing', 'size', 'effects'],
  fields: [{ key: 'columns', label: 'Columns', type: 'number', placeholder: '3' }],
  create: () => {
    const node = makeNode('collectionList', { collectionId: '', columns: 3 }, {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '24px',
      width: '100%',
    })
    node.responsive = {
      tablet: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      mobile: { gridTemplateColumns: '1fr' },
    }
    return node
  },
  render: ({ node, style }) => {
    const cols = Number(node.props.columns) > 0 ? Number(node.props.columns) : 3
    const gridStyle = { ...style, display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }
    return <CollectionGrid collectionId={node.props.collectionId} style={gridStyle} />
  },
})
