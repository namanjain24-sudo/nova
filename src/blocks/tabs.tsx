import { Children } from 'react'
import { PanelsTopLeft, Plus, X } from 'lucide-react'
import { makeNode, registerBlock, type Node } from '../core/schema'
import { useEditor } from '../store/editor'

const PANEL_STYLE = { display: 'flex', flexDirection: 'column' as const, gap: '14px', width: '100%', paddingTop: '24px' }

function panel(label: string, body: string): Node {
  return makeNode('container', { tabLabel: label }, PANEL_STYLE, [
    makeNode('heading', { text: label, level: 'h3' }, { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0' }),
    makeNode('text', { text: body }, { fontSize: '16px', lineHeight: '1.7', color: '#475569', margin: '0' }),
  ])
}

registerBlock({
  type: 'tabs',
  name: 'Tabs',
  category: 'content',
  icon: PanelsTopLeft,
  keywords: ['tabs', 'tabbed', 'panels', 'switcher', 'accordion'],
  isContainer: true,
  inspector: ['spacing', 'size', 'background', 'border', 'effects'],
  create: () =>
    makeNode('tabs', { active: 0 }, { display: 'block', width: '100%' }, [
      panel('Overview', 'Give a quick summary of this tab. Click any text to edit, or drop blocks inside.'),
      panel('Features', 'List what makes this option shine — you can add any blocks here, not just text.'),
      panel('Pricing', 'Explain the pricing or details for this tab. Each tab holds its own content.'),
    ]),
  render: ({ node, style, children, editMode }) => {
    const kids = node.children ?? []
    const count = kids.length
    const active = Math.min(Math.max(Number(node.props.active) || 0, 0), Math.max(0, count - 1))
    const rendered = Children.toArray(children)
    const set = (patch: Record<string, unknown>) => useEditor.getState().updateProps(node.id, patch)

    const addTab = () => {
      const n = count + 1
      useEditor.getState().insertNode(panel(`Tab ${n}`, 'New tab content.'), node.id)
      set({ active: count })
    }
    const removeTab = (i: number) => {
      if (count <= 1) return
      useEditor.getState().deleteNode(kids[i].id)
      set({ active: Math.max(0, i - 1) })
    }
    const rename = (i: number) => {
      const t = window.prompt('Tab label:', (kids[i].props.tabLabel as string) || `Tab ${i + 1}`)
      if (t?.trim()) useEditor.getState().updateProps(kids[i].id, { tabLabel: t.trim() })
    }

    return (
      <div style={style} {...(editMode ? {} : { 'data-nv-tabs': '' })}>
        {/* tab bar */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid rgba(100,116,139,0.25)' }}>
          {kids.map((c, i) => (
            <div key={c.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <button
                {...(editMode ? {} : { 'data-nv-tab': i })}
                // In preview, let the click bubble to the Canvas tab-switch handler.
                onClick={(e) => { if (!editMode) return; e.stopPropagation(); set({ active: i }) }}
                onDoubleClick={(e) => { if (!editMode) return; e.stopPropagation(); rename(i) }}
                title={editMode ? 'Click to open · double-click to rename' : undefined}
                style={{
                  background: 'none', border: 'none', font: 'inherit', cursor: 'pointer',
                  padding: '11px 4px', margin: '0 20px 0 4px', fontSize: '15px', fontWeight: 600, color: 'inherit',
                  borderBottom: '2px solid transparent', marginBottom: '-1px',
                  opacity: i === active ? 1 : 0.5,
                  borderBottomColor: i === active ? 'currentColor' : 'transparent',
                }}
              >
                {(c.props.tabLabel as string) || `Tab ${i + 1}`}
              </button>
              {editMode && count > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeTab(i) }}
                  title="Remove tab"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'inline-flex', padding: '2px', marginRight: '12px' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          {editMode && (
            <button
              onClick={(e) => { e.stopPropagation(); addTab() }}
              title="Add tab"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c5cff', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px', fontSize: '13px', fontWeight: 600 }}
            >
              <Plus size={14} /> Tab
            </button>
          )}
        </div>
        {/* panels */}
        {rendered.map((child, i) => (
          <div
            key={kids[i]?.id ?? i}
            {...(editMode ? {} : { 'data-nv-panel': i })}
            style={{ display: i === active ? 'block' : 'none' }}
          >
            {child}
          </div>
        ))}
      </div>
    )
  },
})
