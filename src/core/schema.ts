import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { nanoid } from 'nanoid'

/** A single style layer — plain CSS props so edit == export with zero translation. */
export type NodeStyle = CSSProperties

export type Device = 'desktop' | 'tablet' | 'mobile'

/** The universal document node. The whole page is a tree of these. */
export interface Node {
  id: string
  type: string
  props: Record<string, any>
  style: NodeStyle
  /** Per-breakpoint style overrides (merged over base for that device & smaller). */
  responsive?: Partial<Record<'tablet' | 'mobile', NodeStyle>>
  children?: Node[]
}

/** Content field shown in the inspector for a block. */
export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'url' | 'image' | 'select' | 'boolean' | 'color' | 'number'
  options?: { label: string; value: string }[]
  placeholder?: string
}

/** Which inspector style sections apply to this block. */
export type StyleGroup =
  | 'layout'
  | 'spacing'
  | 'size'
  | 'typography'
  | 'background'
  | 'border'
  | 'effects'

export interface RenderCtx {
  node: Node
  /** Fully-resolved style for the active device. */
  style: CSSProperties
  /** Already-rendered children (for container blocks). */
  children?: ReactNode
  /** True in the editor canvas, false for clean export/preview. */
  editMode: boolean
  /** Active device (so blocks like component instances can render responsively). */
  device: Device
}

export interface BlockDefinition {
  type: string
  name: string
  category: 'section' | 'layout' | 'content' | 'media' | 'form'
  icon: LucideIcon
  keywords?: string[]
  /** Can this block hold children dropped inside it? */
  isContainer?: boolean
  /** Create a fresh node instance. */
  create: () => Node
  fields?: FieldDef[]
  inspector?: StyleGroup[]
  render: (ctx: RenderCtx) => ReactNode
}

/* ------------------------------------------------------------------ */
/*  Registry                                                          */
/* ------------------------------------------------------------------ */

const registry = new Map<string, BlockDefinition>()

export function registerBlock(def: BlockDefinition) {
  registry.set(def.type, def)
}

export function getBlock(type: string): BlockDefinition | undefined {
  return registry.get(type)
}

export function allBlocks(): BlockDefinition[] {
  return Array.from(registry.values())
}

/* ------------------------------------------------------------------ */
/*  Node helpers                                                      */
/* ------------------------------------------------------------------ */

export function makeNode(
  type: string,
  props: Record<string, any> = {},
  style: NodeStyle = {},
  children?: Node[],
): Node {
  return { id: nanoid(8), type, props, style, children }
}

/** Deep-clone a node subtree and assign fresh ids (for duplicate/paste). */
export function cloneNode(node: Node): Node {
  return {
    ...node,
    id: nanoid(8),
    props: { ...node.props },
    style: { ...node.style },
    responsive: node.responsive ? structuredClone(node.responsive) : undefined,
    children: node.children?.map(cloneNode),
  }
}

/** Resolve the effective style for a device (base <- auto <- explicit, tablet then mobile). */
export function resolveStyle(node: Node, device: Device): CSSProperties {
  let s: CSSProperties = { ...node.style }
  if (device === 'tablet' || device === 'mobile') {
    s = { ...s, ...(autoResponsive(node.style, 'tablet') ?? {}), ...(node.responsive?.tablet ?? {}) }
  }
  if (device === 'mobile') {
    s = { ...s, ...(autoResponsive(node.style, 'mobile') ?? {}), ...(node.responsive?.mobile ?? {}) }
  }
  return s
}

function pxOf(v: unknown): number | null {
  if (typeof v === 'number') return v
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(String(v ?? ''))
  return m ? parseFloat(m[1]) : null
}

function columnCount(gtc: string): number {
  const rep = /repeat\(\s*(\d+)/.exec(gtc)
  if (rep) return parseInt(rep[1], 10)
  return gtc.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Sensible responsive defaults derived from a node's base style, so EVERY block
 * adapts on smaller screens without manual per-device tweaking. Explicit
 * `node.responsive` overrides always win (they're merged after this).
 */
export function autoResponsive(style: CSSProperties, device: 'tablet' | 'mobile'): CSSProperties | null {
  const out: Record<string, any> = {}

  // Grids collapse: 3+ cols → 2 on tablet, everything → 1 on phones.
  const gtc = style.gridTemplateColumns
  if (style.display === 'grid' && typeof gtc === 'string' && !/auto-fi(ll|t)/.test(gtc)) {
    const n = columnCount(gtc)
    if (n >= 2) {
      if (device === 'mobile') out.gridTemplateColumns = '1fr'
      else if (n >= 3) out.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))'
    }
  }

  // Large text scales down so headlines don't overflow narrow screens.
  const fs = pxOf(style.fontSize)
  if (fs) {
    if (device === 'mobile' && fs > 30) out.fontSize = `${Math.max(24, Math.round(fs * 0.62))}px`
    else if (device === 'tablet' && fs > 48) out.fontSize = `${Math.round(fs * 0.82)}px`
  }

  // Full-width flex rows stack vertically on phones. Guarded so wrapping bars
  // (navbars) and inline groups (buttons, avatar+name) are left alone.
  if (
    device === 'mobile' &&
    style.display === 'flex' &&
    (style.flexDirection === 'row' || style.flexDirection == null) &&
    style.flexWrap !== 'wrap' &&
    style.width === '100%'
  ) {
    out.flexDirection = 'column'
    out.alignItems = 'stretch'
  }

  // Big section padding tightens on phones.
  if (device === 'mobile') {
    const pt = pxOf(style.paddingTop)
    const pb = pxOf(style.paddingBottom)
    const pl = pxOf(style.paddingLeft)
    const pr = pxOf(style.paddingRight)
    if (pt && pt > 72) out.paddingTop = '60px'
    if (pb && pb > 72) out.paddingBottom = '60px'
    if (pl && pl > 28) out.paddingLeft = '20px'
    if (pr && pr > 28) out.paddingRight = '20px'
  }

  return Object.keys(out).length ? out : null
}
