import { Heading1, Link2, List, MousePointerClick, Quote, Sparkles, Tag, Type } from 'lucide-react'
import { makeNode, registerBlock } from '../core/schema'
import { editableText } from './editable'
import { ICON_OPTIONS, renderIcon } from './icons'

registerBlock({
  type: 'heading',
  name: 'Heading',
  category: 'content',
  icon: Heading1,
  keywords: ['title', 'h1', 'h2', 'headline'],
  inspector: ['typography', 'spacing', 'effects'],
  fields: [
    { key: 'text', label: 'Text', type: 'textarea', placeholder: 'Your headline' },
    {
      key: 'level',
      label: 'Tag',
      type: 'select',
      options: ['h1', 'h2', 'h3', 'h4'].map((v) => ({ label: v.toUpperCase(), value: v })),
    },
  ],
  create: () =>
    makeNode(
      'heading',
      { text: 'Build something extraordinary', level: 'h2' },
      {
        fontSize: '44px',
        lineHeight: '1.1',
        fontWeight: '800',
        letterSpacing: '-0.02em',
        color: '#0f172a',
        margin: '0',
      },
    ),
  render: ({ node, style, editMode }) => {
    const Tag = (node.props.level ?? 'h2') as any
    return (
      <Tag style={style} {...editableText(node, editMode)}>
        {node.props.text}
      </Tag>
    )
  },
})

registerBlock({
  type: 'text',
  name: 'Text',
  category: 'content',
  icon: Type,
  keywords: ['paragraph', 'body', 'copy'],
  inspector: ['typography', 'spacing', 'effects'],
  fields: [{ key: 'text', label: 'Text', type: 'textarea', placeholder: 'Body text…' }],
  create: () =>
    makeNode(
      'text',
      {
        text: 'Nova lets you design polished, responsive pages visually — then ship real, clean HTML in one click.',
      },
      {
        fontSize: '17px',
        lineHeight: '1.7',
        color: '#475569',
        margin: '0',
        maxWidth: '65ch',
      },
    ),
  render: ({ node, style, editMode }) => (
    <p style={style} {...editableText(node, editMode)}>
      {node.props.text}
    </p>
  ),
})

registerBlock({
  type: 'button',
  name: 'Button',
  category: 'content',
  icon: MousePointerClick,
  keywords: ['cta', 'link', 'action'],
  inspector: ['typography', 'spacing', 'background', 'border', 'effects'],
  fields: [
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Get started' },
    { key: 'href', label: 'Link URL', type: 'url', placeholder: '#' },
  ],
  create: () =>
    makeNode(
      'button',
      { label: 'Get started', href: '#' },
      {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        paddingTop: '13px',
        paddingBottom: '13px',
        paddingLeft: '26px',
        paddingRight: '26px',
        backgroundColor: '#7c3aed',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '12px',
        textDecoration: 'none',
        boxShadow: '0 8px 24px -8px rgba(124,58,237,0.6)',
        cursor: 'pointer',
        width: 'fit-content',
      },
    ),
  render: ({ node, style, editMode }) => (
    <a
      href={editMode ? undefined : node.props.href}
      style={style}
      onClick={editMode ? (e) => e.preventDefault() : undefined}
      {...editableText(node, editMode, 'label')}
    >
      {node.props.label}
    </a>
  ),
})

registerBlock({
  type: 'eyebrow',
  name: 'Badge',
  category: 'content',
  icon: Tag,
  keywords: ['label', 'pill', 'tag', 'eyebrow', 'chip'],
  inspector: ['typography', 'spacing', 'background', 'border', 'effects'],
  fields: [{ key: 'text', label: 'Text', type: 'text', placeholder: 'New' }],
  create: () =>
    makeNode(
      'eyebrow',
      { text: 'New' },
      {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        paddingTop: '5px',
        paddingBottom: '5px',
        paddingLeft: '12px',
        paddingRight: '12px',
        backgroundColor: 'rgba(124,58,237,0.10)',
        color: '#7c3aed',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.02em',
        borderRadius: '999px',
        width: 'fit-content',
      },
    ),
  render: ({ node, style, editMode }) => (
    <span style={style} {...editableText(node, editMode)}>
      {node.props.text}
    </span>
  ),
})

registerBlock({
  type: 'link',
  name: 'Link',
  category: 'content',
  icon: Link2,
  keywords: ['anchor', 'text link', 'nav'],
  inspector: ['typography', 'spacing', 'effects'],
  fields: [
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Learn more' },
    { key: 'href', label: 'Link URL', type: 'url', placeholder: '#' },
  ],
  create: () =>
    makeNode(
      'link',
      { label: 'Learn more', href: '#' },
      {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#7c3aed',
        fontSize: '15px',
        fontWeight: '600',
        textDecoration: 'none',
        width: 'fit-content',
      },
    ),
  render: ({ node, style, editMode }) => (
    <a
      href={editMode ? undefined : node.props.href}
      style={style}
      onClick={editMode ? (e) => e.preventDefault() : undefined}
      {...editableText(node, editMode, 'label')}
    >
      {node.props.label}
    </a>
  ),
})

registerBlock({
  type: 'icon',
  name: 'Icon',
  category: 'content',
  icon: Sparkles,
  keywords: ['symbol', 'glyph', 'svg'],
  inspector: ['spacing', 'effects'],
  fields: [
    { key: 'name', label: 'Icon', type: 'select', options: ICON_OPTIONS },
    { key: 'size', label: 'Size', type: 'number', placeholder: '28' },
    { key: 'color', label: 'Color', type: 'color' },
  ],
  create: () =>
    makeNode(
      'icon',
      { name: 'zap', size: 26, color: '#7c3aed' },
      {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'fit-content',
      },
    ),
  render: ({ node, style }) => (
    <span style={style}>
      {renderIcon(node.props.name ?? 'zap', Number(node.props.size) || 26, node.props.color)}
    </span>
  ),
})

registerBlock({
  type: 'quote',
  name: 'Quote',
  category: 'content',
  icon: Quote,
  keywords: ['blockquote', 'testimonial', 'cite'],
  inspector: ['typography', 'spacing', 'border', 'background', 'effects'],
  fields: [{ key: 'text', label: 'Quote', type: 'textarea', placeholder: 'A memorable quote…' }],
  create: () =>
    makeNode(
      'quote',
      {
        text: '“Nova completely changed how fast our team ships landing pages. It feels like magic.”',
      },
      {
        fontSize: '22px',
        lineHeight: '1.5',
        fontWeight: '500',
        color: '#1e293b',
        margin: '0',
        maxWidth: '48ch',
      },
    ),
  render: ({ node, style, editMode }) => (
    <blockquote style={style} {...editableText(node, editMode)}>
      {node.props.text}
    </blockquote>
  ),
})

registerBlock({
  type: 'list',
  name: 'List',
  category: 'content',
  icon: List,
  keywords: ['bullets', 'ul', 'checklist', 'items'],
  inspector: ['typography', 'spacing', 'effects'],
  fields: [
    {
      key: 'items',
      label: 'Items (one per line)',
      type: 'textarea',
      placeholder: 'First item\nSecond item',
    },
  ],
  create: () =>
    makeNode(
      'list',
      { items: 'Unlimited pages\nOne-click export\nFully responsive' },
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '0',
        padding: '0',
        listStyle: 'none',
        color: '#334155',
        fontSize: '16px',
      },
    ),
  render: ({ node, style }) => {
    const items = String(node.props.items ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    return (
      <ul style={style}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span
              style={{
                flexShrink: 0,
                marginTop: '2px',
                color: '#7c3aed',
                display: 'inline-flex',
              }}
            >
              {renderIcon('check', 18)}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  },
})
