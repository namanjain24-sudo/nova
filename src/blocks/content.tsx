import { Heading1, MousePointerClick, Type } from 'lucide-react'
import { makeNode, registerBlock } from '../core/schema'
import { editableText } from './editable'

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
