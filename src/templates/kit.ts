import { makeNode, type Node } from '../core/schema'

/** A template's design tokens. Builders read from this for consistency. */
export interface Palette {
  brand: string
  brand2: string
  ink: string // primary text on light
  muted: string // secondary text on light
  bg: string // page background
  surface: string // card / raised surface
  line: string // hairline borders
  dark: string // dark section background
  onDark: string // primary text on dark
  onDarkMuted: string // secondary text on dark
  fontHead: string
  fontBody: string
  radius: number // base corner radius (px)
}

type S = Record<string, any>

/** Attach per-breakpoint style overrides to a node (drives editor preview + responsive export). */
export function withR(node: Node, tablet?: S, mobile?: S): Node {
  const r: NonNullable<Node['responsive']> = {}
  if (tablet) r.tablet = tablet
  if (mobile) r.mobile = mobile
  node.responsive = r
  return node
}

/** Bind a set of node builders to a palette. Keeps templates terse + consistent. */
export function kit(p: Palette) {
  const R = p.radius

  const heading = (text: string, style: S = {}, level = 'h2'): Node =>
    makeNode(
      'heading',
      { text, level },
      {
        fontFamily: p.fontHead,
        fontSize: '44px',
        lineHeight: '1.08',
        fontWeight: '800',
        letterSpacing: '-0.02em',
        color: p.ink,
        margin: '0',
        ...style,
      },
    )

  const text = (t: string, style: S = {}): Node =>
    makeNode(
      'text',
      { text: t },
      {
        fontFamily: p.fontBody,
        fontSize: '17px',
        lineHeight: '1.7',
        color: p.muted,
        margin: '0',
        ...style,
      },
    )

  const eyebrow = (t: string, style: S = {}): Node =>
    makeNode(
      'eyebrow',
      { text: t },
      {
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: p.fontBody,
        paddingTop: '6px',
        paddingBottom: '6px',
        paddingLeft: '14px',
        paddingRight: '14px',
        backgroundColor: hexA(p.brand, 0.1),
        color: p.brand,
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderRadius: '999px',
        width: 'fit-content',
        ...style,
      },
    )

  const button = (label: string, variant: 'solid' | 'ghost' | 'light' = 'solid', style: S = {}): Node => {
    const base: S = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontFamily: p.fontBody,
      paddingTop: '14px',
      paddingBottom: '14px',
      paddingLeft: '28px',
      paddingRight: '28px',
      fontSize: '15px',
      fontWeight: '600',
      borderRadius: `${Math.min(R, 14)}px`,
      textDecoration: 'none',
      cursor: 'pointer',
      width: 'fit-content',
    }
    const variants: Record<string, S> = {
      solid: {
        backgroundColor: p.brand,
        color: '#ffffff',
        boxShadow: `0 10px 28px -10px ${hexA(p.brand, 0.6)}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: p.ink,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: p.line,
      },
      light: {
        backgroundColor: hexA('#ffffff', 0.12),
        color: '#ffffff',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: hexA('#ffffff', 0.25),
      },
    }
    return makeNode('button', { label, href: '#' }, { ...base, ...variants[variant], ...style })
  }

  const link = (label: string, style: S = {}): Node =>
    makeNode(
      'link',
      { label, href: '#' },
      {
        fontFamily: p.fontBody,
        color: p.muted,
        fontSize: '15px',
        fontWeight: '500',
        textDecoration: 'none',
        width: 'fit-content',
        ...style,
      },
    )

  const icon = (name: string, color = p.brand, size = 24, style: S = {}): Node =>
    makeNode('icon', { name, size, color }, { display: 'inline-flex', alignItems: 'center', width: 'fit-content', ...style })

  const iconBadge = (name: string, style: S = {}): Node =>
    makeNode(
      'container',
      {},
      {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '52px',
        height: '52px',
        borderRadius: `${Math.min(R, 16)}px`,
        backgroundColor: hexA(p.brand, 0.1),
        ...style,
      },
      [icon(name, p.brand, 24)],
    )

  const image = (src: string, style: S = {}): Node =>
    makeNode('image', { src, alt: '' }, {
      display: 'block',
      width: '100%',
      height: 'auto',
      borderRadius: `${R}px`,
      objectFit: 'cover',
      ...style,
    })

  const avatar = (src: string, style: S = {}): Node =>
    makeNode('avatar', { src, alt: '' }, {
      display: 'block',
      width: '52px',
      height: '52px',
      borderRadius: '999px',
      objectFit: 'cover',
      ...style,
    })

  const list = (items: string[], style: S = {}): Node =>
    makeNode('list', { items: items.join('\n'), accent: p.brand }, {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      margin: '0',
      padding: '0',
      listStyle: 'none',
      color: p.ink,
      fontFamily: p.fontBody,
      fontSize: '15px',
      ...style,
    })

  const row = (children: Node[], style: S = {}): Node =>
    makeNode('container', {}, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
      ...style,
    }, children)

  const stack = (children: Node[], style: S = {}): Node =>
    makeNode('container', {}, {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      width: '100%',
      ...style,
    }, children)

  const columns = (cols: Node[], count = cols.length, gap = '24px', style: S = {}): Node => {
    const node = makeNode('columns', { columns: count }, {
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
      gap,
      width: '100%',
      ...style,
    }, cols)
    // Responsive by default: 3+ cols collapse to 2 on tablet, everything to 1 on phones.
    return withR(
      node,
      count >= 3 ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } : undefined,
      { gridTemplateColumns: '1fr' },
    )
  }

  /** Two-up layout (e.g. text + image hero) that stacks vertically on phones. */
  const split = (left: Node, right: Node, style: S = {}): Node => {
    // min-width:0 lets flex children (esp. images) shrink to an even split
    // instead of overflowing at their intrinsic size.
    const share = (n: Node): Node => ({ ...n, style: { minWidth: 0, flex: '1', width: 'auto', ...n.style } })
    const node = makeNode('container', {}, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '56px',
      width: '100%',
      ...style,
    }, [share(left), share(right)])
    return withR(node, undefined, { flexDirection: 'column', alignItems: 'stretch', gap: '36px' })
  }

  const card = (children: Node[], style: S = {}): Node =>
    makeNode('card', {}, {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '30px',
      backgroundColor: p.surface,
      borderRadius: `${R + 4}px`,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: p.line,
      boxShadow: '0 20px 45px -30px rgba(15,23,42,0.35)',
      ...style,
    }, children)

  const divider = (color = p.line, style: S = {}): Node =>
    makeNode('divider', { color }, { width: '100%', height: '1px', border: 'none', ...style })

  const spacer = (h = 48): Node => makeNode('spacer', { height: h }, {})

  /** Outer section band. `container` centers content at max-width. */
  const section = (children: Node[], style: S = {}): Node => {
    const node = makeNode('section', {}, {
      width: '100%',
      paddingTop: '104px',
      paddingBottom: '104px',
      paddingLeft: '24px',
      paddingRight: '24px',
      backgroundColor: p.bg,
      ...style,
    }, children)
    // Tighter rhythm on phones so sections don't waste vertical space.
    return withR(
      node,
      undefined,
      { paddingTop: '64px', paddingBottom: '64px', paddingLeft: '20px', paddingRight: '20px' },
    )
  }

  const container = (children: Node[], style: S = {}): Node =>
    makeNode('container', {}, {
      width: '100%',
      maxWidth: '1152px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      ...style,
    }, children)

  const page = (children: Node[], style: S = {}): Node =>
    makeNode(
      'page',
      {
        name: 'Untitled',
        // baseline theme so one-click recolor / font swap knows what to replace
        theme: { accent: p.brand, accent2: p.brand2, fontHead: p.fontHead, fontBody: p.fontBody },
      },
      { minHeight: '100%', backgroundColor: p.bg, fontFamily: p.fontBody, ...style },
      children,
    )

  return {
    p,
    heading, text, eyebrow, button, link, icon, iconBadge, image, avatar,
    list, row, stack, columns, split, card, divider, spacer, section, container, page,
    /** Attach responsive tablet/mobile overrides to any node built above. */
    resp: withR,
  }
}

export type Kit = ReturnType<typeof kit>

/* ------------------------------------------------------------------ */
/*  color helpers                                                      */
/* ------------------------------------------------------------------ */

/** hex (#rrggbb) or existing color → rgba string with given alpha. */
export function hexA(color: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(color.trim())
  if (!m) return color
  const int = parseInt(m[1], 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r},${g},${b},${alpha})`
}
