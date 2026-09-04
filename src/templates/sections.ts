import { makeNode, type Node } from '../core/schema'
import { kit, hexA, type Kit, type Palette } from './kit'

const U = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`
const INTER = "'Inter', system-ui, sans-serif"
const SORA = "'Sora', 'Inter', sans-serif"

/** Is a CSS color visually dark? (hex only; falls back to light.) */
function isDark(color: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec((color || '').trim())
  if (!m) return false
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128
}

/** Derive a full palette from a page's theme + background so inserted sections match it. */
export function paletteFromPage(root: Node | null): Palette {
  const theme = (root?.props?.theme as Record<string, string>) ?? {}
  const brand = theme.accent || '#7c5cff'
  const brand2 = theme.accent2 || brand
  const fontHead = theme.fontHead || SORA
  const fontBody = theme.fontBody || INTER
  const bg = (root?.style?.backgroundColor as string) || '#ffffff'
  if (isDark(bg)) {
    return {
      brand, brand2, ink: '#f1f5f9', muted: '#9aa6bd', bg, surface: '#1c2333', line: '#2c3550',
      dark: bg, onDark: '#f1f5f9', onDarkMuted: '#9aa6bd', fontHead, fontBody, radius: 16,
    }
  }
  return {
    brand, brand2, ink: '#0f172a', muted: '#5b6576', bg: '#ffffff', surface: '#f7f9fc', line: '#e7ecf3',
    dark: '#0f172a', onDark: '#f7f9fc', onDarkMuted: '#94a3b8', fontHead, fontBody, radius: 16,
  }
}

/* ---- section-local helpers (mirror the template kit's look) ---- */
function feature(k: Kit, icon: string, title: string, body: string): Node {
  return k.card([
    k.iconBadge(icon),
    k.heading(title, { fontSize: '20px', fontWeight: '700' }, 'h3'),
    k.text(body, { fontSize: '15px' }),
  ], { gap: '14px' })
}
function centered(k: Kit, eyebrow: string, title: string, sub: string): Node {
  return k.stack([
    k.eyebrow(eyebrow),
    k.heading(title, { fontSize: '44px', maxWidth: '20ch', textAlign: 'center' }),
    k.text(sub, { fontSize: '18px', textAlign: 'center', maxWidth: '52ch' }),
  ], { alignItems: 'center', textAlign: 'center', gap: '16px' })
}
function stat(k: Kit, big: string, label: string, onDark = false): Node {
  const p = k.p
  return k.stack([
    k.heading(big, { fontSize: '46px', fontWeight: '800', letterSpacing: '-0.02em', color: onDark ? p.onDark : p.brand }, 'h3'),
    k.text(label, { fontSize: '14px', color: onDark ? p.onDarkMuted : p.muted }),
  ], { alignItems: 'center', textAlign: 'center', gap: '6px' })
}

export interface SectionDef {
  id: string
  name: string
  group: string
  build: (k: Kit) => Node
}

export const SECTION_DEFS: SectionDef[] = [
  {
    id: 'hero-center', name: 'Hero — centered', group: 'Hero',
    build: (k) => k.section([k.container([
      k.eyebrow('New · Introducing'),
      k.heading('Build something\npeople love.', { fontSize: '60px', lineHeight: '1.03', letterSpacing: '-0.03em', textAlign: 'center', maxWidth: '16ch' }, 'h1'),
      k.text('A clear, punchy sub-headline that says exactly what you do and why it matters — in one calm sentence.', { fontSize: '19px', textAlign: 'center', maxWidth: '54ch' }),
      k.row([k.button('Get started'), k.button('Learn more', 'ghost')], { width: 'fit-content', gap: '14px', marginTop: '4px' }),
    ], { alignItems: 'center', textAlign: 'center', gap: '20px' })], { paddingTop: '110px', paddingBottom: '90px', background: `radial-gradient(1000px 460px at 50% 0%, ${hexA(k.p.brand, 0.1)}, transparent), ${k.p.bg}` }),
  },
  {
    id: 'hero-split', name: 'Hero — split', group: 'Hero',
    build: (k) => k.section([k.container([
      k.split(
        k.stack([
          k.eyebrow('For modern teams'),
          k.heading('The fastest way\nto ship.', { fontSize: '54px', lineHeight: '1.04', letterSpacing: '-0.02em' }, 'h1'),
          k.text('Explain the core benefit here. Keep it human and specific — one or two sentences is plenty.', { fontSize: '18px', maxWidth: '44ch' }),
          k.row([k.button('Start free'), k.button('Book a demo', 'ghost')], { width: 'fit-content', gap: '14px', marginTop: '4px' }),
        ], { gap: '18px', flex: '1', width: 'auto' }),
        k.image(U('1551288049-bebda4e38f71'), { flex: '1', width: 'auto', aspectRatio: '4/3', borderRadius: '20px' }),
      ),
    ])], { paddingTop: '90px', paddingBottom: '90px' }),
  },
  {
    id: 'features-3', name: 'Features — 3 cards', group: 'Content',
    build: (k) => k.section([k.container([
      centered(k, 'Features', 'Everything you need', 'Thoughtfully designed primitives that snap together into anything.'),
      k.columns([
        feature(k, 'zap', 'Fast by default', 'Instant, buttery interactions — even at scale, even offline.'),
        feature(k, 'shield', 'Secure', 'Enterprise-grade security and privacy, on from day one.'),
        feature(k, 'layers', 'Composable', 'Small pieces that combine into exactly what you need.'),
      ], 3, '22px'),
    ], { gap: '52px' })]),
  },
  {
    id: 'features-split', name: 'Feature — image + text', group: 'Content',
    build: (k) => k.section([k.container([
      k.split(
        k.image(U('1531403009284-440f080d1e12'), { flex: '1', width: 'auto', aspectRatio: '4/3', borderRadius: '20px' }),
        k.stack([
          k.eyebrow('How it works'),
          k.heading('Set up in minutes,\nnot months', { fontSize: '40px', lineHeight: '1.08' }),
          k.text('Connect your tools, invite your team, and you’re live. No migration project, no consultants.', { fontSize: '17px', maxWidth: '46ch' }),
          k.list(['Guided onboarding', 'One-click integrations', 'Import existing data'], { marginTop: '4px' }),
        ], { gap: '16px', flex: '1', width: 'auto' }),
      ),
    ])], { backgroundColor: k.p.surface }),
  },
  {
    id: 'logos', name: 'Logo cloud', group: 'Social proof',
    build: (k) => k.section([k.container([
      k.text('Trusted by teams at', { fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: k.p.muted, textAlign: 'center' }),
      k.row(['Vercel', 'Linear', 'Notion', 'Framer', 'Retool'].map((n) => k.heading(n, { fontSize: '22px', fontWeight: '700', color: hexA(k.p.ink, 0.32) }, 'h4')), { justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }),
    ], { gap: '26px', alignItems: 'center' })], { paddingTop: '54px', paddingBottom: '54px' }),
  },
  {
    id: 'stats', name: 'Stats band', group: 'Social proof',
    build: (k) => k.section([k.container([k.columns([
      stat(k, '20k+', 'Happy customers', true), stat(k, '99.99%', 'Uptime SLA', true), stat(k, '4.9/5', 'Average rating', true), stat(k, '150ms', 'Median response', true),
    ])])], { backgroundColor: k.p.dark, paddingTop: '74px', paddingBottom: '74px' }),
  },
  {
    id: 'testimonial', name: 'Testimonial', group: 'Social proof',
    build: (k) => k.section([k.container([
      k.icon('sparkles', k.p.brand, 30),
      k.heading('“This is the first tool in years my whole team actually thanks me for.”', { fontSize: '30px', lineHeight: '1.4', fontWeight: '600', textAlign: 'center', maxWidth: '26ch' }),
      k.row([
        k.avatar(U('1544005313-94ddf0286df2', 200)),
        k.stack([k.heading('Maya Okafor', { fontSize: '16px', fontWeight: '700' }, 'h4'), k.text('VP Product, Northwind', { fontSize: '14px' })], { width: 'fit-content', gap: '2px' }),
      ], { width: 'fit-content', gap: '14px' }),
    ], { alignItems: 'center', textAlign: 'center', gap: '24px', maxWidth: '780px' })]),
  },
  {
    id: 'pricing', name: 'Pricing — 3 tiers', group: 'Pricing',
    build: (k) => {
      const p = k.p
      const plan = (name: string, price: string, sub: string, feats: string[], featured: boolean) =>
        k.card([
          ...(featured ? [k.eyebrow('Most popular')] : []),
          k.heading(name, { fontSize: '20px', fontWeight: '700' }, 'h3'),
          k.row([k.heading(price, { fontSize: '44px', fontWeight: '800' }, 'h4'), k.text('/mo', { fontSize: '15px' })], { width: 'fit-content', alignItems: 'flex-end', gap: '4px' }),
          k.text(sub, { fontSize: '14px' }),
          k.list(feats),
          k.button(featured ? 'Start free trial' : 'Choose plan', featured ? 'solid' : 'ghost', { width: '100%' }),
        ], { gap: '16px', ...(featured ? { borderColor: p.brand, borderWidth: '2px' } : {}) })
      return k.section([k.container([
        centered(k, 'Pricing', 'Plans that scale with you', 'Start free. Upgrade only when it pays for itself.'),
        k.columns([
          plan('Starter', '$0', 'For individuals', ['1 workspace', 'Core features', 'Community support'], false),
          plan('Pro', '$18', 'For professionals', ['Unlimited workspaces', 'Automations', 'Priority support'], true),
          plan('Team', '$49', 'For teams', ['Everything in Pro', 'SSO & SAML', 'Audit log'], false),
        ], 3, '22px'),
      ], { gap: '52px' })])
    },
  },
  {
    id: 'faq', name: 'FAQ', group: 'Content',
    build: (k) => {
      const qa = (q: string, a: string) => k.card([k.heading(q, { fontSize: '18px', fontWeight: '700' }, 'h3'), k.text(a, { fontSize: '15px' })], { gap: '10px' })
      return k.section([k.container([
        centered(k, 'FAQ', 'Questions, answered', 'Everything you need to know before getting started.'),
        k.columns([
          qa('Is there a free plan?', 'Yes — start free, no credit card, upgrade when ready.'),
          qa('Can I cancel anytime?', 'Absolutely — plans are month-to-month, cancel in one click.'),
          qa('Do you offer support?', 'Every plan includes support, priority on Pro and Team.'),
          qa('Can I switch plans?', 'Change plans whenever — upgrades and downgrades are instant.'),
        ], 2, '20px'),
      ], { gap: '48px' })])
    },
  },
  {
    id: 'team', name: 'Team', group: 'Content',
    build: (k) => {
      const person = (img: string, name: string, role: string) => k.stack([
        k.image(U(img, 500), { aspectRatio: '1/1', borderRadius: '18px' }),
        k.heading(name, { fontSize: '18px', fontWeight: '700' }, 'h4'),
        k.text(role, { fontSize: '14px' }),
      ], { gap: '10px' })
      return k.section([k.container([
        centered(k, 'Team', 'The people behind it', 'A small team with an outsized obsession for craft.'),
        k.columns([
          person('1500648767791-00dcc994a43e', 'Alex Rivera', 'Founder & CEO'),
          person('1494790108377-be9c29b29330', 'Priya Shah', 'Head of Design'),
          person('1507003211169-0a1dd7228f2d', 'Marcus Lee', 'Engineering'),
          person('1438761681033-6461ffad8d80', 'Sofia Marin', 'Customer Success'),
        ], 4, '22px'),
      ], { gap: '48px' })])
    },
  },
  {
    id: 'gallery', name: 'Gallery', group: 'Content',
    build: (k) => k.section([k.container([
      k.row([k.heading('Gallery', { fontSize: '34px' }), k.link('View all →', { color: k.p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
      k.columns([
        k.image(U('1618005182384-a83a8bd57fbe'), { aspectRatio: '4/5', borderRadius: '14px' }),
        k.image(U('1620121692029-d088224ddc74'), { aspectRatio: '4/5', borderRadius: '14px', marginTop: '32px' }),
        k.image(U('1558655146-9f40138edfeb'), { aspectRatio: '4/5', borderRadius: '14px' }),
      ], 3, '20px'),
    ], { gap: '30px' })]),
  },
  {
    id: 'cta', name: 'CTA — gradient', group: 'Content',
    build: (k) => k.section([k.container([
      k.heading('Ready to get started?', { fontSize: '46px', color: '#ffffff', textAlign: 'center', maxWidth: '18ch' }),
      k.text('Join thousands of teams already building with us.', { fontSize: '18px', color: hexA('#ffffff', 0.85), textAlign: 'center' }),
      k.row([k.button('Start free', 'solid', { backgroundColor: '#ffffff', color: k.p.brand, boxShadow: 'none' }), k.button('Contact sales', 'light')], { width: 'fit-content', gap: '14px', marginTop: '4px' }),
    ], { alignItems: 'center', textAlign: 'center', gap: '20px' })], { background: `linear-gradient(135deg, ${k.p.brand} 0%, ${k.p.brand2} 100%)` }),
  },
  {
    id: 'contact', name: 'Contact', group: 'Contact',
    build: (k) => {
      const p = k.p
      const input = (ph: string, type = 'text', name = 'field') =>
        makeNode('input', { placeholder: ph, inputType: type, name }, { width: '100%', paddingTop: '13px', paddingBottom: '13px', paddingLeft: '16px', paddingRight: '16px', fontSize: '15px', color: p.ink, backgroundColor: p.bg === p.surface ? '#ffffff' : p.surface, borderWidth: '1px', borderStyle: 'solid', borderColor: p.line, borderRadius: '12px', fontFamily: p.fontBody, outline: 'none' })
      const submit = k.button('Send message', 'solid', { width: '100%', marginTop: '4px' })
      submit.props.submit = true
      const form = makeNode('form', { name: 'Contact form', success: 'Thanks! We’ll be in touch.', method: 'post' }, { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }, [input('Full name', 'text', 'name'), input('you@email.com', 'email', 'email'), submit])
      return k.section([k.container([
        centered(k, 'Contact', 'Let’s talk', 'Tell us what you’re working on — we reply within a day.'),
        k.card([form], { gap: '10px', maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }),
      ], { gap: '40px' })])
    },
  },
  {
    id: 'footer', name: 'Footer', group: 'Footer',
    build: (k) => {
      const p = k.p
      const col = (title: string, links: string[]) => k.stack([
        k.text(title, { fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: p.onDark }),
        ...links.map((l) => k.link(l, { color: p.onDarkMuted })),
      ], { gap: '12px' })
      return k.section([k.container([
        k.columns([
          k.stack([
            k.row([k.icon('sparkles', p.brand, 22), k.heading('Brand', { fontSize: '20px', fontWeight: '800', color: p.onDark }, 'h3')], { width: 'fit-content', gap: '10px' }),
            k.text('A short line about what you do and the craft you bring to it.', { fontSize: '15px', color: p.onDarkMuted, maxWidth: '32ch' }),
          ], { gap: '14px' }),
          col('Product', ['Features', 'Pricing', 'Changelog']),
          col('Company', ['About', 'Blog', 'Careers']),
          col('Legal', ['Privacy', 'Terms', 'Security']),
        ], 4, '32px'),
        k.divider(hexA('#ffffff', 0.1)),
        k.text('© 2026 Brand, Inc. All rights reserved.', { fontSize: '13px', color: p.onDarkMuted, textAlign: 'center' }),
      ], { gap: '40px' })], { backgroundColor: p.dark, paddingTop: '72px', paddingBottom: '40px' })
    },
  },
]

/** Build one section's node for the current page's palette. */
export function buildSectionNode(def: SectionDef, palette: Palette): Node {
  return def.build(kit(palette))
}
