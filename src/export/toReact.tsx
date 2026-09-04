import { renderToStaticMarkup } from 'react-dom/server'
import { saveAs } from 'file-saver'
import type { CSSProperties } from 'react'
import type { Node } from '../core/schema'
import { getBlock, resolveStyle } from '../core/schema'
import { slugify } from '../store/editor'
import { renderIcon } from '../blocks/icons'

/** Emit a CSSProperties object as a JS object literal string. */
function jsStyle(style: CSSProperties): string | null {
  const entries = Object.entries(style).filter(
    ([k, v]) => v != null && v !== '' && !k.startsWith('_'),
  )
  if (!entries.length) return null
  const parts = entries.map(([k, v]) => {
    const key = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)
    const val = typeof v === 'number' ? String(v) : JSON.stringify(String(v))
    return `${key}: ${val}`
  })
  return `{ ${parts.join(', ')} }`
}

function styleAttr(node: Node): string {
  const s = jsStyle(resolveStyle(node, 'desktop'))
  return s ? ` style={${s}}` : ''
}

const jsx = (v: any) => `{${JSON.stringify(v ?? '')}}`

function pad(depth: number) {
  return '  '.repeat(depth)
}

function tagFor(node: Node): string {
  const type = node.type
  if (type === 'navbar') return 'header'
  if (type === 'footer') return 'footer'
  if (type === 'form') return 'form'
  const cat = getBlock(type)?.category
  if (type === 'section' || cat === 'section') return 'section'
  return 'div'
}

/** Convert a node subtree into pretty-printed JSX. */
function nodeToJsx(node: Node, depth: number): string {
  const p = node.props ?? {}
  const sa = styleAttr(node)
  const ind = pad(depth)

  switch (node.type) {
    case 'heading':
      return `${ind}<${p.level || 'h2'}${sa}>${jsx(p.text)}</${p.level || 'h2'}>`
    case 'text':
      return `${ind}<p${sa}>${jsx(p.text)}</p>`
    case 'quote':
      return `${ind}<blockquote${sa}>${jsx(p.text)}</blockquote>`
    case 'eyebrow':
      return `${ind}<span${sa}>${jsx(p.text)}</span>`
    case 'button':
    case 'link':
      return `${ind}<a href=${JSON.stringify(p.href || '#')}${sa}>${jsx(p.label)}</a>`
    case 'image':
    case 'avatar':
      return `${ind}<img src=${JSON.stringify(p.src || '')} alt=${JSON.stringify(p.alt || '')}${sa} />`
    case 'logo':
      return p.src
        ? `${ind}<img src=${JSON.stringify(p.src)} alt=${JSON.stringify(p.alt || '')}${sa} />`
        : `${ind}<span${sa}>${jsx(p.alt || 'Your Brand')}</span>`
    case 'divider':
      return `${ind}<hr${sa} />`
    case 'spacer':
      return `${ind}<div style={{ height: ${JSON.stringify(`${p.height ?? 48}px`)}, width: '100%' }} />`
    case 'icon': {
      const svg = renderToStaticMarkup(renderIcon(p.name ?? 'zap', Number(p.size) || 26, p.color))
      return `${ind}<span${sa} dangerouslySetInnerHTML={{ __html: ${JSON.stringify(svg)} }} />`
    }
    case 'list': {
      const items = String(p.items ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      const lis = items
        .map((it) => `${pad(depth + 1)}<li style={{ marginBottom: '8px' }}>${jsx(it)}</li>`)
        .join('\n')
      return `${ind}<ul${sa}>\n${lis}\n${ind}</ul>`
    }
    case 'input':
      return `${ind}<input type=${JSON.stringify(p.inputType || 'text')} placeholder=${JSON.stringify(p.placeholder || '')}${sa} />`
    case 'textarea':
      return `${ind}<textarea placeholder=${JSON.stringify(p.placeholder || '')}${sa} />`
    case 'video':
      return `${ind}<div${sa}><iframe src=${JSON.stringify(p.src || '')} title="video" allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} /></div>`
    default: {
      const tag = tagFor(node)
      const kids = (node.children ?? []).map((c) => nodeToJsx(c, depth + 1)).join('\n')
      if (!kids) return `${ind}<${tag}${sa} />`
      return `${ind}<${tag}${sa}>\n${kids}\n${ind}</${tag}>`
    }
  }
}

/** Build a self-contained React component for a page. */
export function buildReactComponent(root: Node, name = 'Page'): string {
  const body = nodeToJsx(root, 2)
  const comp = name.replace(/[^a-zA-Z0-9]/g, '') || 'Page'
  return `// ${name} — exported from Nova
// Load these fonts in your app's <head> (or index.html):
//   Inter, Sora, Manrope, Space Grotesk, Playfair Display, DM Sans, Instrument Serif (Google Fonts)

export default function ${comp}() {
  return (
${body}
  )
}
`
}

export function exportReact(root: Node, name = 'Page') {
  const code = buildReactComponent(root, name)
  const file = `${slugify(name) || 'page'}.jsx`
  saveAs(new Blob([code], { type: 'text/plain;charset=utf-8' }), file)
}
