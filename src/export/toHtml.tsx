import { renderToStaticMarkup } from 'react-dom/server'
import { saveAs } from 'file-saver'
import type { Node } from '../core/schema'
import { Renderer } from '../core/Renderer'

/** Serialize a document tree into a clean, self-contained HTML string. */
export function buildHtml(doc: Node): string {
  const body = renderToStaticMarkup(
    <Renderer doc={doc} device="desktop" editMode={false} />,
  )
  const title = doc.props?.name || 'Nova Site'
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0}
    body{font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
    img{max-width:100%}
    a{color:inherit}
  </style>
</head>
<body>
${body}
</body>
</html>`
}

export function exportHtml(doc: Node) {
  const html = buildHtml(doc)
  const name = (doc.props?.name || 'nova-site')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  saveAs(new Blob([html], { type: 'text/html;charset=utf-8' }), `${name || 'nova-site'}.html`)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
}
