import { CheckSquare, FormInput, TextCursorInput, SquarePen } from 'lucide-react'
import { makeNode, registerBlock } from '../core/schema'

registerBlock({
  type: 'form',
  name: 'Form',
  category: 'form',
  icon: SquarePen,
  keywords: ['contact', 'signup', 'fields', 'newsletter'],
  isContainer: true,
  inspector: ['layout', 'spacing', 'size', 'background', 'border', 'effects'],
  create: () =>
    makeNode(
      'form',
      { action: '', method: 'post' },
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        maxWidth: '440px',
      },
      [
        makeNode(
          'input',
          { placeholder: 'you@company.com', inputType: 'email', name: 'email' },
          inputStyle(),
        ),
        makeNode(
          'button',
          { label: 'Subscribe', href: '#' },
          {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            cursor: 'pointer',
            width: 'fit-content',
          },
        ),
      ],
    ),
  render: ({ style, children, editMode }) => (
    <form
      style={style}
      onSubmit={editMode ? (e) => e.preventDefault() : undefined}
    >
      {children}
    </form>
  ),
})

function inputStyle() {
  return {
    width: '100%',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '16px',
    paddingRight: '16px',
    fontSize: '15px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: '#cbd5e1',
    borderRadius: '12px',
    outline: 'none',
  }
}

registerBlock({
  type: 'input',
  name: 'Input',
  category: 'form',
  icon: TextCursorInput,
  keywords: ['field', 'text', 'email', 'textbox'],
  inspector: ['typography', 'spacing', 'size', 'background', 'border', 'effects'],
  fields: [
    { key: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Enter text…' },
    {
      key: 'inputType',
      label: 'Type',
      type: 'select',
      options: ['text', 'email', 'tel', 'number', 'password'].map((v) => ({
        label: v,
        value: v,
      })),
    },
    { key: 'name', label: 'Name', type: 'text', placeholder: 'field-name' },
  ],
  create: () =>
    makeNode('input', { placeholder: 'Enter text…', inputType: 'text', name: 'field' }, inputStyle()),
  render: ({ node, style, editMode }) => (
    <input
      type={node.props.inputType ?? 'text'}
      name={node.props.name}
      placeholder={node.props.placeholder}
      readOnly={editMode}
      style={style}
    />
  ),
})

registerBlock({
  type: 'textarea',
  name: 'Textarea',
  category: 'form',
  icon: FormInput,
  keywords: ['message', 'multiline', 'field'],
  inspector: ['typography', 'spacing', 'size', 'background', 'border', 'effects'],
  fields: [
    { key: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Your message…' },
    { key: 'name', label: 'Name', type: 'text', placeholder: 'message' },
  ],
  create: () =>
    makeNode(
      'textarea',
      { placeholder: 'Your message…', name: 'message' },
      { ...inputStyle(), minHeight: '120px', resize: 'vertical' as const },
    ),
  render: ({ node, style, editMode }) => (
    <textarea
      name={node.props.name}
      placeholder={node.props.placeholder}
      readOnly={editMode}
      style={style}
    />
  ),
})

registerBlock({
  type: 'checkbox',
  name: 'Checkbox',
  category: 'form',
  icon: CheckSquare,
  keywords: ['tick', 'agree', 'toggle', 'option'],
  inspector: ['typography', 'spacing', 'effects'],
  fields: [{ key: 'label', label: 'Label', type: 'text', placeholder: 'I agree…' }],
  create: () =>
    makeNode(
      'checkbox',
      { label: 'I agree to the terms', name: 'agree' },
      {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '15px',
        color: '#334155',
        cursor: 'pointer',
      },
    ),
  render: ({ node, style, editMode }) => (
    <label style={style}>
      <input
        type="checkbox"
        name={node.props.name}
        disabled={editMode}
        style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
      />
      <span>{node.props.label}</span>
    </label>
  ),
})
