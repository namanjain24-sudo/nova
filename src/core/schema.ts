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

/** Resolve the effective style for a device (base <- tablet <- mobile cascade). */
export function resolveStyle(node: Node, device: Device): CSSProperties {
  let s: CSSProperties = { ...node.style }
  if (device === 'tablet' || device === 'mobile') {
    s = { ...s, ...(node.responsive?.tablet ?? {}) }
  }
  if (device === 'mobile') {
    s = { ...s, ...(node.responsive?.mobile ?? {}) }
  }
  return s
}
