import {
  Contact,
  Images,
  LayoutList,
  PanelTop,
  Quote as QuoteIcon,
  Rocket,
  Sparkle,
  Table2,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { Node } from '../core/schema'
import { makeNode, registerBlock } from '../core/schema'

/* ------------------------------------------------------------------ */
/*  Small node builders (compose atomic blocks into rich sections)     */
/* ------------------------------------------------------------------ */

function heading(text: string, style: Record<string, any> = {}, level = 'h2'): Node {
  return makeNode(
    'heading',
    { text, level },
    {
      fontSize: '40px',
      lineHeight: '1.1',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      color: '#0f172a',
      margin: '0',
      ...style,
    },
  )
}

function text(t: string, style: Record<string, any> = {}): Node {
  return makeNode(
    'text',
    { text: t },
    { fontSize: '17px', lineHeight: '1.7', color: '#475569', margin: '0', ...style },
  )
}

function eyebrow(t: string): Node {
  return makeNode(
    'eyebrow',
    { text: t },
    {
      display: 'inline-flex',
      alignItems: 'center',
      paddingTop: '5px',
      paddingBottom: '5px',
      paddingLeft: '13px',
      paddingRight: '13px',
      backgroundColor: 'rgba(124,58,237,0.10)',
      color: '#7c3aed',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      borderRadius: '999px',
      width: 'fit-content',
    },
  )
}

function button(label: string, primary = true): Node {
  return makeNode(
    'button',
    { label, href: '#' },
    {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      paddingTop: '13px',
      paddingBottom: '13px',
      paddingLeft: '26px',
      paddingRight: '26px',
      backgroundColor: primary ? '#7c3aed' : 'transparent',
      color: primary ? '#ffffff' : '#0f172a',
      fontSize: '15px',
      fontWeight: '600',
      borderRadius: '12px',
      textDecoration: 'none',
      cursor: 'pointer',
      width: 'fit-content',
      ...(primary
        ? { boxShadow: '0 8px 24px -8px rgba(124,58,237,0.6)' }
        : { borderWidth: '1px', borderStyle: 'solid', borderColor: '#cbd5e1' }),
    },
  )
}

function iconNode(name: string, color = '#7c3aed', size = 24): Node {
  return makeNode(
    'icon',
    { name, size, color },
    { display: 'inline-flex', alignItems: 'center', width: 'fit-content' },
  )
}

function link(label: string): Node {
  return makeNode(
    'link',
    { label, href: '#' },
    {
      color: '#475569',
      fontSize: '15px',
      fontWeight: '500',
      textDecoration: 'none',
      width: 'fit-content',
    },
  )
}

function row(children: Node[], style: Record<string, any> = {}): Node {
  return makeNode(
    'container',
    {},
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
      ...style,
    },
    children,
  )
}

function stack(children: Node[], style: Record<string, any> = {}): Node {
  return makeNode(
    'container',
    {},
    { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', ...style },
    children,
  )
}

function container(children: Node[], style: Record<string, any> = {}): Node {
  return makeNode(
    'container',
    {},
    {
      width: '100%',
      maxWidth: '1152px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      ...style,
    },
    children,
  )
}

function columns(cols: Node[], count = cols.length, gap = '24px'): Node {
  return makeNode(
    'columns',
    { columns: count },
    {
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
      gap,
      width: '100%',
    },
    cols,
  )
}

function card(children: Node[], style: Record<string, any> = {}): Node {
  return makeNode(
    'card',
    {},
    {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      padding: '28px',
      backgroundColor: '#ffffff',
      borderRadius: '18px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#e8eaf0',
      boxShadow: '0 18px 40px -28px rgba(15,23,42,0.30)',
      ...style,
    },
    children,
  )
}

function image(src: string, style: Record<string, any> = {}): Node {
  return makeNode(
    'image',
    { src, alt: '' },
    { display: 'block', width: '100%', height: 'auto', borderRadius: '16px', objectFit: 'cover', ...style },
  )
}

/* ------------------------------------------------------------------ */
/*  Section preset factory                                             */
/* ------------------------------------------------------------------ */

interface Preset {
  type: string
  name: string
  icon: LucideIcon
  keywords?: string[]
  build: () => Node
  tag?: 'section' | 'header' | 'footer'
}

function registerSection(p: Preset) {
  registerBlock({
    type: p.type,
    name: p.name,
    category: 'section',
    icon: p.icon,
    keywords: p.keywords,
    isContainer: true,
    inspector: ['spacing', 'size', 'background', 'border', 'effects', 'layout'],
    create: p.build,
    render: ({ style, children }) => {
      const Tag = (p.tag ?? 'section') as any
      return <Tag style={style}>{children}</Tag>
    },
  })
}

/** Shared outer section shell. */
function section(type: string, inner: Node[], style: Record<string, any> = {}): Node {
  return makeNode(
    type,
    {},
    {
      width: '100%',
      paddingTop: '96px',
      paddingBottom: '96px',
      paddingLeft: '24px',
      paddingRight: '24px',
      backgroundColor: '#ffffff',
      ...style,
    },
    inner,
  )
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

registerSection({
  type: 'navbar',
  name: 'Navbar',
  icon: PanelTop,
  tag: 'header',
  keywords: ['nav', 'header', 'menu', 'topbar'],
  build: () =>
    makeNode(
      'navbar',
      {},
      {
        width: '100%',
        paddingTop: '18px',
        paddingBottom: '18px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#ffffff',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: '#eef0f4',
      },
      [
        row(
          [
            row(
              [
                iconNode('sparkles', '#7c3aed', 22),
                heading('Nova', { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }, 'h3'),
              ],
              { width: 'fit-content', gap: '10px' },
            ),
            row([link('Features'), link('Pricing'), link('About'), link('Blog')], {
              width: 'fit-content',
              gap: '28px',
            }),
            row([button('Sign in', false), button('Get started')], {
              width: 'fit-content',
              gap: '12px',
            }),
          ],
          {
            maxWidth: '1152px',
            marginLeft: 'auto',
            marginRight: 'auto',
            justifyContent: 'space-between',
          },
        ),
      ],
    ),
})

registerSection({
  type: 'hero',
  name: 'Hero',
  icon: Rocket,
  keywords: ['header', 'banner', 'intro', 'landing'],
  build: () =>
    section(
      'hero',
      [
        container(
          [
            eyebrow('Now in public beta'),
            heading('Design remarkable pages,\nship them in minutes.', {
              fontSize: '60px',
              lineHeight: '1.05',
              letterSpacing: '-0.03em',
              maxWidth: '18ch',
            }),
            text(
              'Nova is the visual builder for teams who care about craft. Drag, drop, and publish pixel-perfect, responsive sites — no code required.',
              { fontSize: '19px', maxWidth: '58ch' },
            ),
            row([button('Start building — free'), button('Watch demo', false)], {
              width: 'fit-content',
              gap: '14px',
              marginTop: '8px',
            }),
          ],
          { alignItems: 'center', textAlign: 'center', gap: '22px' },
        ),
      ],
      { paddingTop: '112px', paddingBottom: '112px', backgroundColor: '#fafaff' },
    ),
})

registerSection({
  type: 'features',
  name: 'Features',
  icon: LayoutList,
  keywords: ['grid', 'benefits', 'services', 'cards'],
  build: () => {
    const feats: [string, string, string][] = [
      ['zap', 'Lightning fast', 'Every page is static HTML that loads instantly, anywhere in the world.'],
      ['palette', 'Pixel-perfect', 'A precise visual canvas with responsive controls for every breakpoint.'],
      ['shield', 'Yours to own', 'Export clean, self-contained code and host it wherever you like.'],
    ]
    return section('features', [
      container(
        [
          stack(
            [
              eyebrow('Why Nova'),
              heading('Everything you need to launch', { fontSize: '44px', maxWidth: '20ch' }),
              text('A builder that respects your craft and your codebase.', { fontSize: '18px' }),
            ],
            { alignItems: 'center', textAlign: 'center', gap: '14px' },
          ),
          columns(
            feats.map(([ic, h, t]) =>
              card(
                [
                  makeNode(
                    'container',
                    {},
                    {
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(124,58,237,0.10)',
                    },
                    [iconNode(ic, '#7c3aed', 24)],
                  ),
                  heading(h, { fontSize: '20px', fontWeight: '700' }, 'h3'),
                  text(t, { fontSize: '15.5px' }),
                ],
                { gap: '16px' },
              ),
            ),
          ),
        ],
        { gap: '56px' },
      ),
    ])
  },
})

registerSection({
  type: 'stats',
  name: 'Stats',
  icon: Table2,
  keywords: ['metrics', 'numbers', 'kpi', 'results'],
  build: () => {
    const stats: [string, string][] = [
      ['12k+', 'Pages published'],
      ['99.9%', 'Uptime'],
      ['40ms', 'Median load'],
      ['180+', 'Countries served'],
    ]
    return section(
      'stats',
      [
        container([
          columns(
            stats.map(([n, l]) =>
              stack(
                [
                  heading(n, {
                    fontSize: '48px',
                    fontWeight: '800',
                    color: '#7c3aed',
                    letterSpacing: '-0.02em',
                  }, 'h3'),
                  text(l, { fontSize: '15px', color: '#64748b' }),
                ],
                { alignItems: 'center', textAlign: 'center', gap: '6px' },
              ),
            ),
          ),
        ]),
      ],
      { backgroundColor: '#0f0f1a', paddingTop: '72px', paddingBottom: '72px' },
    )
  },
})

registerSection({
  type: 'logos',
  name: 'Logo cloud',
  icon: Sparkle,
  keywords: ['brands', 'trusted', 'clients', 'partners'],
  build: () =>
    section(
      'logos',
      [
        container(
          [
            text('Trusted by fast-moving teams everywhere', {
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              textAlign: 'center',
            }),
            row(
              ['Acme', 'Globex', 'Umbra', 'Northwind', 'Initech'].map((n) =>
                heading(n, { fontSize: '22px', fontWeight: '700', color: '#cbd5e1' }, 'h4'),
              ),
              { justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' },
            ),
          ],
          { gap: '28px', alignItems: 'center' },
        ),
      ],
      { paddingTop: '56px', paddingBottom: '56px', backgroundColor: '#fafaff' },
    ),
})

registerSection({
  type: 'testimonial',
  name: 'Testimonial',
  icon: QuoteIcon,
  keywords: ['quote', 'review', 'social proof'],
  build: () =>
    section(
      'testimonial',
      [
        container(
          [
            iconNode('sparkles', '#7c3aed', 30),
            makeNode(
              'quote',
              {
                text: '“We replaced three tools with Nova and cut our launch time from weeks to an afternoon. It is the rare product that feels both powerful and effortless.”',
              },
              {
                fontSize: '30px',
                lineHeight: '1.4',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0',
                maxWidth: '24ch',
                textAlign: 'center',
              },
            ),
            row(
              [
                makeNode(
                  'avatar',
                  {
                    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
                    alt: 'Portrait',
                  },
                  { width: '52px', height: '52px', borderRadius: '999px', objectFit: 'cover' },
                ),
                stack(
                  [
                    heading('Ava Chen', { fontSize: '16px', fontWeight: '700' }, 'h4'),
                    text('Head of Design, Northwind', { fontSize: '14px', color: '#64748b' }),
                  ],
                  { width: 'fit-content', gap: '2px' },
                ),
              ],
              { width: 'fit-content', gap: '14px' },
            ),
          ],
          { alignItems: 'center', textAlign: 'center', gap: '28px', maxWidth: '760px' },
        ),
      ],
      { backgroundColor: '#fafaff' },
    ),
})

registerSection({
  type: 'pricing',
  name: 'Pricing',
  icon: Wallet,
  keywords: ['plans', 'tiers', 'cost', 'subscribe'],
  build: () => {
    const plans: [string, string, string, string[], boolean][] = [
      ['Starter', '$0', 'For side projects', ['1 site', 'Nova subdomain', 'Community support'], false],
      ['Pro', '$19', 'For professionals', ['Unlimited sites', 'Custom domains', 'Remove branding', 'Priority support'], true],
      ['Team', '$49', 'For growing teams', ['Everything in Pro', '5 editors', 'Shared components', 'SSO'], false],
    ]
    return section('pricing', [
      container(
        [
          stack(
            [
              eyebrow('Pricing'),
              heading('Simple, honest pricing', { fontSize: '44px' }),
              text('Start free. Upgrade when you are ready. Cancel anytime.', { fontSize: '18px' }),
            ],
            { alignItems: 'center', textAlign: 'center', gap: '14px' },
          ),
          columns(
            plans.map(([name, price, sub, feats, featured]) =>
              card(
                [
                  ...(featured ? [eyebrow('Most popular')] : []),
                  heading(name, { fontSize: '20px', fontWeight: '700' }, 'h3'),
                  row(
                    [
                      heading(price, { fontSize: '44px', fontWeight: '800', letterSpacing: '-0.02em' }, 'h4'),
                      text('/mo', { fontSize: '15px', color: '#94a3b8' }),
                    ],
                    { width: 'fit-content', alignItems: 'flex-end', gap: '4px' },
                  ),
                  text(sub, { fontSize: '14px', color: '#64748b' }),
                  makeNode(
                    'list',
                    { items: feats.join('\n') },
                    {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      margin: '0',
                      padding: '0',
                      listStyle: 'none',
                      color: '#334155',
                      fontSize: '15px',
                    },
                  ),
                  button(featured ? 'Get started' : 'Choose plan', featured),
                ],
                {
                  gap: '18px',
                  ...(featured
                    ? {
                        borderColor: '#7c3aed',
                        borderWidth: '2px',
                        boxShadow: '0 30px 60px -30px rgba(124,58,237,0.45)',
                      }
                    : {}),
                },
              ),
            ),
          ),
        ],
        { gap: '52px' },
      ),
    ])
  },
})

registerSection({
  type: 'gallery',
  name: 'Gallery',
  icon: Images,
  keywords: ['grid', 'images', 'photos', 'portfolio'],
  build: () => {
    const imgs = [
      'photo-1517245386807-bb43f82c33c4',
      'photo-1522202176988-66273c2fd55f',
      'photo-1531403009284-440f080d1e12',
      'photo-1498050108023-c5249f4df085',
      'photo-1454165804606-c3d57bc86b40',
      'photo-1519389950473-47ba0277781c',
    ]
    return section('gallery', [
      container([
        columns(
          imgs.map((id) =>
            image(`https://images.unsplash.com/${id}?w=600&q=80`, {
              aspectRatio: '4 / 3',
              borderRadius: '14px',
            }),
          ),
          3,
          '18px',
        ),
      ]),
    ])
  },
})

registerSection({
  type: 'cta',
  name: 'CTA',
  icon: Contact,
  keywords: ['call to action', 'signup', 'convert', 'banner'],
  build: () =>
    section(
      'cta',
      [
        container(
          [
            heading('Ready to build something remarkable?', {
              fontSize: '46px',
              color: '#ffffff',
              maxWidth: '20ch',
            }),
            text('Join thousands of makers shipping beautiful pages with Nova.', {
              fontSize: '19px',
              color: 'rgba(255,255,255,0.75)',
            }),
            row(
              [
                button('Start for free'),
                makeNode(
                  'button',
                  { label: 'Talk to sales', href: '#' },
                  {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '13px',
                    paddingBottom: '13px',
                    paddingLeft: '26px',
                    paddingRight: '26px',
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    width: 'fit-content',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(255,255,255,0.25)',
                  },
                ),
              ],
              { width: 'fit-content', gap: '14px', marginTop: '8px' },
            ),
          ],
          { alignItems: 'center', textAlign: 'center', gap: '20px' },
        ),
      ],
      {
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        borderRadius: '0px',
      },
    ),
})

registerSection({
  type: 'footer',
  name: 'Footer',
  icon: PanelTop,
  tag: 'footer',
  keywords: ['bottom', 'links', 'copyright', 'sitemap'],
  build: () =>
    makeNode(
      'footer',
      {},
      {
        width: '100%',
        paddingTop: '72px',
        paddingBottom: '40px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#0f0f1a',
      },
      [
        container(
          [
            columns(
              [
                stack(
                  [
                    row(
                      [iconNode('sparkles', '#a78bfa', 22), heading('Nova', { fontSize: '20px', fontWeight: '800', color: '#ffffff' }, 'h3')],
                      { width: 'fit-content', gap: '10px' },
                    ),
                    text('The visual builder for teams who care about craft.', {
                      fontSize: '15px',
                      color: '#94a3b8',
                      maxWidth: '34ch',
                    }),
                  ],
                  { gap: '14px' },
                ),
                footerCol('Product', ['Features', 'Pricing', 'Templates', 'Changelog']),
                footerCol('Company', ['About', 'Blog', 'Careers', 'Contact']),
                footerCol('Legal', ['Privacy', 'Terms', 'Security']),
              ],
              4,
              '32px',
            ),
            makeNode('divider', { color: 'rgba(255,255,255,0.10)' }, { width: '100%', height: '1px', border: 'none' }),
            text('© 2026 Nova, Inc. All rights reserved.', {
              fontSize: '13px',
              color: '#64748b',
              textAlign: 'center',
            }),
          ],
          { gap: '40px' },
        ),
      ],
    ),
})

function footerCol(title: string, links: string[]): Node {
  return stack(
    [
      makeNode(
        'text',
        { text: title },
        {
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#e2e8f0',
          margin: '0',
        },
      ),
      ...links.map((l) =>
        makeNode(
          'link',
          { label: l, href: '#' },
          { color: '#94a3b8', fontSize: '15px', textDecoration: 'none', width: 'fit-content' },
        ),
      ),
    ],
    { gap: '12px' },
  )
}
