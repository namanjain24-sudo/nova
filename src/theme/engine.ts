import type { Node } from '../core/schema'

/** A site-wide theme: accent colours + a heading/body font pairing. */
export interface Theme {
  accent: string
  accent2: string
  fontHead: string
  fontBody: string
}

/* Font stacks (kept in sync with templates/library.ts) */
export const FONTS = {
  inter: "'Inter', system-ui, sans-serif",
  sora: "'Sora', 'Inter', sans-serif",
  manrope: "'Manrope', 'Inter', sans-serif",
  space: "'Space Grotesk', 'Inter', sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  dmsans: "'DM Sans', 'Inter', sans-serif",
  instrument: "'Instrument Serif', Georgia, serif",
}

export const DEFAULT_THEME: Theme = {
  accent: '#7c3aed',
  accent2: '#4f46e5',
  fontHead: FONTS.inter,
  fontBody: FONTS.inter,
}

export interface ColorTheme {
  name: string
  accent: string
  accent2: string
}

export const COLOR_THEMES: ColorTheme[] = [
  { name: 'Violet', accent: '#7c3aed', accent2: '#4f46e5' },
  { name: 'Indigo', accent: '#4f46e5', accent2: '#6366f1' },
  { name: 'Blue', accent: '#2563eb', accent2: '#3b82f6' },
  { name: 'Cyan', accent: '#0891b2', accent2: '#06b6d4' },
  { name: 'Teal', accent: '#0d9488', accent2: '#059669' },
  { name: 'Emerald', accent: '#059669', accent2: '#10b981' },
  { name: 'Lime', accent: '#65a30d', accent2: '#4d7c0f' },
  { name: 'Amber', accent: '#d97706', accent2: '#b45309' },
  { name: 'Orange', accent: '#ea580c', accent2: '#f97316' },
  { name: 'Rose', accent: '#e11d48', accent2: '#be123c' },
  { name: 'Pink', accent: '#db2777', accent2: '#be185d' },
  { name: 'Fuchsia', accent: '#c026d3', accent2: '#a21caf' },
  { name: 'Slate', accent: '#334155', accent2: '#0f172a' },
  { name: 'Graphite', accent: '#111827', accent2: '#374151' },
]

export interface FontPair {
  name: string
  head: string
  body: string
}

export const FONT_PAIRS: FontPair[] = [
  { name: 'Clean', head: FONTS.inter, body: FONTS.inter },
  { name: 'Modern', head: FONTS.sora, body: FONTS.inter },
  { name: 'Techy', head: FONTS.space, body: FONTS.manrope },
  { name: 'Editorial', head: FONTS.playfair, body: FONTS.dmsans },
  { name: 'Elegant', head: FONTS.instrument, body: FONTS.inter },
  { name: 'Friendly', head: FONTS.manrope, body: FONTS.inter },
]

/* ------------------------------------------------------------------ */
/*  Reading / stamping the theme on the document                       */
/* ------------------------------------------------------------------ */

export function getTheme(doc: Node): Theme {
  const t = doc.props?.theme as Partial<Theme> | undefined
  return { ...DEFAULT_THEME, ...(t ?? {}) }
}

/**
 * Re-skin the whole tree: swap accent colours (in hex, rgba and gradient
 * forms) and heading/body font families, then stamp the new theme on the page.
 */
export function applyTheme(doc: Node, next: Partial<Theme>): Node {
  const cur = getTheme(doc)
  const merged: Theme = { ...cur, ...next }

  const colorChanged = merged.accent !== cur.accent || merged.accent2 !== cur.accent2
  const fontChanged = merged.fontHead !== cur.fontHead || merged.fontBody !== cur.fontBody

  const mapValue = (v: any): any => {
    if (typeof v !== 'string') return v
    let out = v
    if (colorChanged) {
      out = swapColor(out, cur.accent, merged.accent)
      out = swapColor(out, cur.accent2, merged.accent2)
    }
    return out
  }

  const mapStyle = (style: Record<string, any> | undefined) => {
    if (!style) return style
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(style)) {
      if (fontChanged && k === 'fontFamily') {
        out[k] = v === cur.fontHead ? merged.fontHead : v === cur.fontBody ? merged.fontBody : mapValue(v)
      } else {
        out[k] = mapValue(v)
      }
    }
    return out
  }

  const transform = (node: Node): Node => {
    const responsive = node.responsive
      ? {
          tablet: node.responsive.tablet ? mapStyle(node.responsive.tablet) : undefined,
          mobile: node.responsive.mobile ? mapStyle(node.responsive.mobile) : undefined,
        }
      : undefined
    return {
      ...node,
      style: mapStyle(node.style) ?? {},
      responsive: responsive as Node['responsive'],
      children: node.children?.map(transform),
    }
  }

  const next2 = transform(doc)
  // Ensure the body font applies globally (even on blank pages).
  const pageStyle = { ...next2.style, fontFamily: merged.fontBody }
  return {
    ...next2,
    style: pageStyle,
    props: { ...next2.props, theme: merged },
  }
}

/* ------------------------------------------------------------------ */
/*  colour utilities                                                   */
/* ------------------------------------------------------------------ */

function rgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const int = parseInt(m[1], 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

/** Replace every form of `oldHex` (hex + rgba prefix) with `newHex` in a value. */
function swapColor(value: string, oldHex: string, newHex: string): string {
  if (!value || oldHex === newHex) return value
  const o = rgb(oldHex)
  const n = rgb(newHex)
  if (!o || !n) return value
  let out = value.replace(new RegExp(escapeReg(oldHex), 'gi'), newHex)
  // rgba(r, g, b, a) / rgb(r, g, b) — preserve alpha, swap channels.
  const rgbaRe = new RegExp(`rgba?\\(\\s*${o[0]}\\s*,\\s*${o[1]}\\s*,\\s*${o[2]}\\s*(,[^)]*)?\\)`, 'g')
  out = out.replace(rgbaRe, (_m, alpha) => `rgba(${n[0]},${n[1]},${n[2]}${alpha ?? ',1'})`)
  return out
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
