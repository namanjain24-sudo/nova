import { TrendingUp } from 'lucide-react'
import { makeNode, registerBlock } from '../core/schema'

const group = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/** Format a number the same way the editor preview + exported count-up JS do. */
function format(n: number, dec: number, prefix: string, suffix: string): string {
  const str = dec > 0 ? n.toFixed(dec) : String(Math.round(n))
  const parts = str.split('.')
  parts[0] = group(parts[0])
  return prefix + parts.join('.') + suffix
}

registerBlock({
  type: 'counter',
  name: 'Stat counter',
  category: 'content',
  icon: TrendingUp,
  keywords: ['number', 'stat', 'count', 'metric', 'animate', 'counter'],
  inspector: ['typography', 'spacing', 'effects'],
  fields: [
    { key: 'value', label: 'Number', type: 'text', placeholder: '20000' },
    { key: 'prefix', label: 'Prefix', type: 'text', placeholder: '$' },
    { key: 'suffix', label: 'Suffix', type: 'text', placeholder: '+' },
    { key: 'duration', label: 'Duration (ms)', type: 'number', placeholder: '1600' },
  ],
  create: () =>
    makeNode(
      'counter',
      { value: '20000', prefix: '', suffix: '+', duration: 1600 },
      { fontSize: '52px', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a', lineHeight: '1', width: 'fit-content' },
    ),
  render: ({ node, style, editMode }) => {
    const raw = String(node.props.value ?? '0')
    const num = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
    const dec = (raw.split('.')[1] || '').length
    const prefix = node.props.prefix ?? ''
    const suffix = node.props.suffix ?? ''
    const disp = format(num, dec, prefix, suffix)
    // In preview/export, expose data attrs the count-up driver animates.
    const data = editMode
      ? {}
      : {
          'data-nv-count': num,
          'data-nv-dec': dec,
          'data-nv-prefix': prefix,
          'data-nv-suffix': suffix,
          'data-nv-dur': Number(node.props.duration) || 1600,
        }
    return (
      <span style={style} {...data}>
        {disp}
      </span>
    )
  },
})
