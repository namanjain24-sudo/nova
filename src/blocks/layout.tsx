import {
  Box,
  Columns3,
  CreditCard,
  LayoutTemplate,
  Minus,
  SeparatorHorizontal,
  Square,
} from 'lucide-react'
import { makeNode, registerBlock } from '../core/schema'

registerBlock({
  type: 'page',
  name: 'Page',
  category: 'layout',
  icon: LayoutTemplate,
  isContainer: true,
  create: () => makeNode('page', { name: 'Page' }, { minHeight: '100%', backgroundColor: '#ffffff' }, []),
  render: ({ style, children }) => <div style={style}>{children}</div>,
})

registerBlock({
  type: 'section',
  name: 'Section',
  category: 'layout',
  icon: Square,
  keywords: ['band', 'block', 'row'],
  isContainer: true,
  inspector: ['spacing', 'size', 'background', 'border', 'effects', 'layout'],
  create: () =>
    makeNode(
      'section',
      {},
      {
        width: '100%',
        paddingTop: '80px',
        paddingBottom: '80px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: 'transparent',
      },
      [makeNode('container', {}, defaultContainerStyle(), [])],
    ),
  render: ({ style, children }) => <section style={style}>{children}</section>,
})

function defaultContainerStyle() {
  return {
    width: '100%',
    maxWidth: '1152px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  }
}

registerBlock({
  type: 'container',
  name: 'Container',
  category: 'layout',
  icon: Box,
  keywords: ['wrapper', 'div', 'group', 'flex'],
  isContainer: true,
  inspector: ['layout', 'spacing', 'size', 'background', 'border', 'effects'],
  create: () => makeNode('container', {}, defaultContainerStyle(), []),
  render: ({ style, children }) => <div style={style}>{children}</div>,
})

registerBlock({
  type: 'columns',
  name: 'Columns',
  category: 'layout',
  icon: Columns3,
  keywords: ['grid', 'row', 'split'],
  isContainer: true,
  inspector: ['layout', 'spacing', 'size', 'background', 'border', 'effects'],
  create: () =>
    makeNode(
      'columns',
      { columns: 3 },
      {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '24px',
        width: '100%',
      },
      [
        makeNode('container', {}, columnCellStyle(), []),
        makeNode('container', {}, columnCellStyle(), []),
        makeNode('container', {}, columnCellStyle(), []),
      ],
    ),
  // data-nova-grid lets the exported responsive stylesheet stack columns on mobile
  render: ({ style, children }) => (
    <div style={style} data-nova-grid="">
      {children}
    </div>
  ),
})

function columnCellStyle() {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '4px',
  }
}

registerBlock({
  type: 'card',
  name: 'Card',
  category: 'layout',
  icon: CreditCard,
  keywords: ['panel', 'box', 'tile', 'surface'],
  isContainer: true,
  inspector: ['layout', 'spacing', 'size', 'background', 'border', 'effects'],
  create: () =>
    makeNode(
      'card',
      {},
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '28px',
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e2e8f0',
        boxShadow: '0 18px 40px -24px rgba(15,23,42,0.25)',
      },
      [],
    ),
  render: ({ style, children }) => <div style={style}>{children}</div>,
})

registerBlock({
  type: 'divider',
  name: 'Divider',
  category: 'layout',
  icon: SeparatorHorizontal,
  keywords: ['hr', 'rule', 'line', 'separator'],
  inspector: ['spacing', 'size'],
  fields: [{ key: 'color', label: 'Color', type: 'color' }],
  create: () =>
    makeNode(
      'divider',
      { color: '#e2e8f0' },
      { width: '100%', height: '1px', border: 'none' },
    ),
  render: ({ node, style }) => (
    <hr
      style={{
        ...style,
        backgroundColor: node.props.color ?? '#e2e8f0',
        border: 'none',
        margin: 0,
      }}
    />
  ),
})

registerBlock({
  type: 'spacer',
  name: 'Spacer',
  category: 'layout',
  icon: Minus,
  keywords: ['gap', 'space', 'divider'],
  inspector: ['size'],
  fields: [{ key: 'height', label: 'Height (px)', type: 'number', placeholder: '48' }],
  create: () => makeNode('spacer', { height: 48 }, {}),
  render: ({ node, style, editMode }) => (
    <div
      style={{
        height: `${node.props.height ?? 48}px`,
        width: '100%',
        ...style,
        ...(editMode
          ? { outline: '1px dashed rgba(139,92,246,0.35)', outlineOffset: '-1px' }
          : {}),
      }}
    />
  ),
})
