import { nanoid } from 'nanoid'
import { makeNode, cloneNode, type Node } from '../core/schema'
import { kit, hexA, type Palette } from './kit'

/** One page within a template's multi-page site. */
export interface SitePage {
  name: string
  path: string
  root: Node
}

/** A reusable master (Header / Footer) shared across every page as a symbol. */
export interface SiteComponent {
  id: string
  name: string
  root: Node
}

/** A full generated site: pages + the shared symbols they reference. */
export interface SiteBuild {
  pages: SitePage[]
  components: SiteComponent[]
}

export interface Template {
  id: string
  name: string
  category: string
  description: string
  accent: string // swatch shown in the gallery
  build: () => Node // the home page (also used for the gallery thumbnail)
  /** The full, multi-page site — home + a page behind every nav link, with a
   *  shared, editable Header & Footer symbol on every page. */
  site?: () => SiteBuild
}

/* Shared font stacks */
const INTER = "'Inter', system-ui, sans-serif"
const SORA = "'Sora', 'Inter', sans-serif"
const MANROPE = "'Manrope', 'Inter', sans-serif"
const SPACE = "'Space Grotesk', 'Inter', sans-serif"
const PLAYFAIR = "'Playfair Display', Georgia, serif"
const DMSANS = "'DM Sans', 'Inter', sans-serif"
const INSTRUMENT = "'Instrument Serif', Georgia, serif"

const U = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`

/* ================================================================== */
/*  1 — AURORA  ·  modern SaaS                                          */
/* ================================================================== */

const auroraPalette: Palette = {
  brand: '#6d28d9', brand2: '#4f46e5', ink: '#0f0f1a', muted: '#565672',
  bg: '#ffffff', surface: '#ffffff', line: '#eceaf5', dark: '#0d0b1a',
  onDark: '#ffffff', onDarkMuted: '#a5a3c0', fontHead: SORA, fontBody: INTER, radius: 16,
}

function aurora(): Node {
  const k = kit(auroraPalette)
  const p = auroraPalette
  return k.page([
    navbar(k, 'Aurora', ['Product', 'Solutions', 'Pricing', 'Docs']),
    // hero
    k.section(
      [
        k.container(
          [
            k.eyebrow('New · AI-assisted workflows'),
            k.heading('The workspace where\nideas ship themselves.', {
              fontSize: '66px', lineHeight: '1.03', letterSpacing: '-0.035em', maxWidth: '17ch',
            }, 'h1'),
            k.text('Aurora unifies your docs, tasks and automations into one calm, fast surface — so your team spends time creating, not coordinating.', {
              fontSize: '19px', maxWidth: '56ch',
            }),
            k.row([k.button('Start free'), k.button('Book a demo', 'ghost')], { width: 'fit-content', gap: '14px', marginTop: '6px' }),
            k.text('No credit card required · Free for 14 days', { fontSize: '13px', color: p.muted, marginTop: '2px' }),
          ],
          { alignItems: 'center', textAlign: 'center', gap: '22px' },
        ),
        k.container([k.image(U('photo-1551434678-e076c223a692'), { marginTop: '56px', borderRadius: '22px', boxShadow: '0 50px 90px -40px rgba(79,70,229,0.45)', borderWidth: '1px', borderStyle: 'solid', borderColor: p.line })]),
      ],
      { paddingTop: '120px', paddingBottom: '90px', background: `radial-gradient(1200px 500px at 50% -10%, ${hexA(p.brand, 0.12)}, transparent), #ffffff` },
    ),
    logoCloud(k, 'Powering teams at'),
    // features
    k.section([
      k.container([
        centered(k, 'Why Aurora', 'One home for the way you work', 'Thoughtfully designed primitives that snap together into anything.'),
        k.columns([
          featureCard(k, 'zap', 'Instant everything', 'Local-first sync keeps every keystroke at 60fps, even offline.'),
          featureCard(k, 'wand', 'Automate the busywork', 'Turn repetitive flows into one-click actions with visual rules.'),
          featureCard(k, 'shield', 'Enterprise-grade', 'SOC 2, SSO and granular permissions, ready on day one.'),
          featureCard(k, 'layers', 'Composable docs', 'Nest tasks, tables and embeds inside living documents.'),
          featureCard(k, 'users', 'Built for teams', 'Real-time cursors, comments and mentions that feel alive.'),
          featureCard(k, 'gauge', 'Insightful', 'Dashboards that turn activity into decisions automatically.'),
        ], 3, '22px'),
      ], { gap: '56px' }),
    ]),
    // split showcase
    splitShowcase(k, U('photo-1531403009284-440f080d1e12'), 'Right', 'Focus mode', 'Deep work, undisturbed', 'Collapse the noise into a single column. Aurora fades the rest of the app so the only thing on screen is the thing that matters.', ['Distraction-free editor', 'Keyboard-first navigation', 'Session goals & timers']),
    // stats band
    k.section([
      k.container([
        k.columns([
          stat(k, '20k+', 'Teams onboarded', true),
          stat(k, '99.99%', 'Uptime SLA', true),
          stat(k, '4.9/5', 'Average rating', true),
          stat(k, '150ms', 'Median sync', true),
        ]),
      ]),
    ], { backgroundColor: p.dark, paddingTop: '76px', paddingBottom: '76px' }),
    testimonial(k, U('photo-1544005313-94ddf0286df2', 300), 'Aurora replaced five tools and made our team feel twice as large. It is the first software in years that people actually thank me for.', 'Maya Okafor', 'VP Product, Northwind'),
    pricing(k),
    ctaGradient(k, 'Ship your next idea this week', 'Join 20,000+ teams building calmly with Aurora.'),
    footer(k, 'Aurora'),
  ])
}

/* ================================================================== */
/*  2 — NOIR  ·  creative agency (dark, editorial)                     */
/* ================================================================== */

const noirPalette: Palette = {
  brand: '#e0ff4f', brand2: '#c4f000', ink: '#f4f4f0', muted: '#a3a39c',
  bg: '#0b0b0c', surface: '#141416', line: '#232326', dark: '#0b0b0c',
  onDark: '#f4f4f0', onDarkMuted: '#a3a39c', fontHead: SPACE, fontBody: MANROPE, radius: 14,
}

function noir(): Node {
  const k = kit(noirPalette)
  const p = noirPalette
  return k.page([
    darkNav(k, 'NOIR™', ['Work', 'Studio', 'Services', 'Contact']),
    // hero — huge editorial type
    k.section([
      k.container([
        k.eyebrow('Independent design studio', { backgroundColor: hexA(p.brand, 0.14), color: p.brand }),
        k.heading('We craft brands\nthat refuse to\nbe ignored.', {
          fontSize: '84px', lineHeight: '0.98', letterSpacing: '-0.04em', color: p.ink, maxWidth: '14ch',
        }, 'h1'),
        k.row([
          k.text('A multidisciplinary studio blending strategy, identity and motion for ambitious founders.', { fontSize: '18px', color: p.muted, maxWidth: '44ch' }),
          k.button('See our work', 'solid', { backgroundColor: p.brand, color: '#0b0b0c', boxShadow: 'none' }),
        ], { justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px', marginTop: '10px' }),
      ], { gap: '30px' }),
    ], { paddingTop: '120px', paddingBottom: '70px' }),
    // full-bleed gallery
    k.section([
      k.container([
        k.columns([
          k.image(U('photo-1618005182384-a83a8bd57fbe'), { aspectRatio: '3/4', borderRadius: '10px' }),
          k.image(U('photo-1620121692029-d088224ddc74'), { aspectRatio: '3/4', borderRadius: '10px', marginTop: '40px' }),
          k.image(U('photo-1558655146-9f40138edfeb'), { aspectRatio: '3/4', borderRadius: '10px' }),
        ], 3, '20px'),
      ], { maxWidth: '1280px' }),
    ], { paddingTop: '20px', paddingBottom: '90px' }),
    // services list
    k.section([
      k.container([
        k.row([
          k.heading('What we do', { fontSize: '40px', color: p.ink }),
          k.text('Selected capabilities across the full brand lifecycle.', { color: p.muted, maxWidth: '30ch' }),
        ], { justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }),
        k.stack([
          serviceRow(k, '01', 'Brand strategy & positioning'),
          serviceRow(k, '02', 'Visual identity & systems'),
          serviceRow(k, '03', 'Motion & art direction'),
          serviceRow(k, '04', 'Web design & build'),
        ], { gap: '0px', marginTop: '18px' }),
      ], { gap: '30px' }),
    ], { backgroundColor: p.surface }),
    testimonial(k, U('photo-1507003211169-0a1dd7228f2d', 300), 'They didn’t just design a logo — they gave our company a spine. Six months later we raised our Series A on the story they built.', 'Daniel Rhys', 'Founder, Fathom', { dark: true }),
    // big CTA
    k.section([
      k.container([
        k.heading('Let’s make\nsomething iconic.', { fontSize: '72px', lineHeight: '1.0', letterSpacing: '-0.03em', color: p.ink, textAlign: 'center', maxWidth: '16ch' }),
        k.button('Start a project', 'solid', { backgroundColor: p.brand, color: '#0b0b0c', boxShadow: 'none', paddingLeft: '34px', paddingRight: '34px' }),
      ], { alignItems: 'center', textAlign: 'center', gap: '30px' }),
    ], { paddingTop: '110px', paddingBottom: '110px' }),
    darkFooter(k, 'NOIR™', ['Work', 'Studio', 'Contact', 'Instagram']),
  ])
}

/* ================================================================== */
/*  3 — FOLIO  ·  personal portfolio (light, serif)                    */
/* ================================================================== */

const folioPalette: Palette = {
  brand: '#b45309', brand2: '#92400e', ink: '#1c1917', muted: '#78716c',
  bg: '#faf8f4', surface: '#ffffff', line: '#eae5dc', dark: '#1c1917',
  onDark: '#faf8f4', onDarkMuted: '#a8a29e', fontHead: PLAYFAIR, fontBody: DMSANS, radius: 14,
}

function folio(): Node {
  const k = kit(folioPalette)
  const p = folioPalette
  return k.page([
    navbar(k, 'Elena Vance', ['Work', 'About', 'Journal', 'Contact'], { border: false }),
    // hero
    k.section([
      k.container([
        k.row([
          k.stack([
            k.eyebrow('Product designer · London', { backgroundColor: 'transparent', color: p.brand, paddingLeft: '0', letterSpacing: '0.12em' }),
            k.heading('Designing calm,\nhuman-centred\nproducts.', { fontSize: '62px', lineHeight: '1.04', letterSpacing: '-0.01em', fontWeight: '600', maxWidth: '14ch' }, 'h1'),
            k.text('I’m Elena — a designer and occasional writer helping teams turn complex problems into products that feel obvious.', { fontSize: '18px', maxWidth: '46ch' }),
            k.row([k.button('View work', 'solid'), k.button('Read journal', 'ghost')], { width: 'fit-content', gap: '14px' }),
          ], { gap: '22px', flex: '1', width: 'auto', minWidth: '320px' }),
          k.image(U('photo-1494790108377-be9c29b29330', 700), { width: '360px', flexShrink: '0', aspectRatio: '4/5', borderRadius: '20px' }),
        ], { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }),
      ]),
    ], { paddingTop: '96px', paddingBottom: '70px' }),
    // selected work
    k.section([
      k.container([
        k.row([k.heading('Selected work', { fontSize: '34px', fontWeight: '600' }), k.link('All projects →', { color: p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          projectCard(k, U('photo-1611224885990-ab7363d1f2a9'), 'Fintech', 'Ledger — banking, reimagined'),
          projectCard(k, U('photo-1512941937669-90a1b58e7e9c'), 'Health', 'Vitals — a calmer care app'),
          projectCard(k, U('photo-1517245386807-bb43f82c33c4'), 'Retail', 'Marketplace design system'),
          projectCard(k, U('photo-1522542550221-31fd19575a2d'), 'AI', 'Copilot for researchers'),
        ], 2, '30px'),
      ], { gap: '36px' }),
    ]),
    // about / quote
    k.section([
      k.container([
        k.heading('“Good design is invisible — it just gets out of the way and lets people do what they came to do.”', {
          fontSize: '38px', lineHeight: '1.4', fontWeight: '500', textAlign: 'center', maxWidth: '24ch', fontStyle: 'italic',
        }),
      ], { alignItems: 'center' }),
    ], { backgroundColor: p.surface }),
    ctaSimple(k, 'Have a project in mind?', 'I’m open to select freelance and advisory work.', 'Get in touch'),
    footer(k, 'Elena Vance', { minimal: true }),
  ])
}

/* ================================================================== */
/*  4 — PULSE  ·  startup / mobile app (vivid gradient)                */
/* ================================================================== */

const pulsePalette: Palette = {
  brand: '#0d9488', brand2: '#059669', ink: '#062b2b', muted: '#4b6b6a',
  bg: '#f2fbf9', surface: '#ffffff', line: '#d9efeb', dark: '#052321',
  onDark: '#eafaf6', onDarkMuted: '#8fc7bd', fontHead: MANROPE, fontBody: INTER, radius: 20,
}

function pulse(): Node {
  const k = kit(pulsePalette)
  const p = pulsePalette
  return k.page([
    navbar(k, 'Pulse', ['Features', 'Pricing', 'Reviews']),
    k.section([
      k.container([
        k.row([
          k.stack([
            k.eyebrow('Your money, in motion'),
            k.heading('Save, spend and\ninvest — beautifully.', { fontSize: '58px', lineHeight: '1.04', letterSpacing: '-0.03em', maxWidth: '16ch' }, 'h1'),
            k.text('Pulse is the all-in-one money app that rounds up spare change, auto-invests it, and shows exactly where every rupee goes.', { fontSize: '18px', maxWidth: '50ch' }),
            k.row([k.button('Get the app'), k.button('▶  Watch film', 'ghost')], { width: 'fit-content', gap: '14px' }),
            k.text('★★★★★  50,000+ five-star reviews', { fontSize: '14px', fontWeight: '600', color: p.ink, marginTop: '4px' }),
          ], { gap: '22px', flex: '1', width: 'auto', minWidth: '320px' }),
          k.image(U('photo-1512941937669-90a1b58e7e9c', 700), { width: '340px', flexShrink: '0', aspectRatio: '9/16', borderRadius: '32px', boxShadow: '0 50px 90px -35px rgba(13,148,136,0.5)' }),
        ], { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }),
      ]),
    ], { paddingTop: '110px', paddingBottom: '90px', background: `radial-gradient(900px 500px at 80% 0%, ${hexA(p.brand, 0.14)}, transparent), ${p.bg}` }),
    // feature columns with icons
    k.section([
      k.container([
        centered(k, 'Everything money', 'Banking that pays attention', 'Smart by default, private by design.'),
        k.columns([
          featureCard(k, 'gauge', 'Round-ups', 'Every purchase rounds up and quietly invests the change.'),
          featureCard(k, 'chart', 'Auto-invest', 'Diversified portfolios rebalanced for you, weekly.'),
          featureCard(k, 'lock', 'Bank-grade security', 'Biometrics, freezes and alerts you fully control.'),
        ], 3, '22px'),
      ], { gap: '56px' }),
    ]),
    splitShowcase(k, U('photo-1526304640581-d334cdbbf45e'), 'Left', 'Insights', 'See your money think', 'Pulse groups your spending into living categories and forecasts your month before it happens — so there are never surprises.', ['Predictive budgets', 'Subscription radar', 'Instant round-up reports']),
    k.section([
      k.container([
        k.columns([stat(k, '₹4.2B', 'Invested by users', true), stat(k, '1.8M', 'Downloads', true), stat(k, '4.9★', 'App Store', true), stat(k, '0', 'Hidden fees', true)]),
      ]),
    ], { backgroundColor: p.dark, paddingTop: '76px', paddingBottom: '76px' }),
    testimonial(k, U('photo-1489424731084-a5d8b219a5bb', 300), 'I’ve tried every finance app. Pulse is the only one that made me actually excited to check my balance.', 'Aditi Sharma', 'Designer, Bangalore'),
    ctaGradient(k, 'Download Pulse today', 'Free to start. Available on iOS and Android.'),
    footer(k, 'Pulse'),
  ])
}

/* ================================================================== */
/*  5 — SUMMIT  ·  conference / event (warm)                           */
/* ================================================================== */

const summitPalette: Palette = {
  brand: '#e11d48', brand2: '#be123c', ink: '#1a1013', muted: '#6b5860',
  bg: '#fff8f5', surface: '#ffffff', line: '#f4e3db', dark: '#1a0f12',
  onDark: '#fff1ec', onDarkMuted: '#c99f96', fontHead: SPACE, fontBody: INTER, radius: 16,
}

function summit(): Node {
  const k = kit(summitPalette)
  const p = summitPalette
  return k.page([
    navbar(k, 'SUMMIT ’26', ['Speakers', 'Schedule', 'Venue', 'Tickets']),
    // hero
    k.section([
      k.container([
        k.eyebrow('Nov 14–16 · San Francisco'),
        k.heading('The gathering for\npeople who build\nthe future.', { fontSize: '72px', lineHeight: '1.0', letterSpacing: '-0.035em', textAlign: 'center', maxWidth: '15ch' }, 'h1'),
        k.text('Three days of talks, workshops and late-night ideas with 2,000 founders, engineers and designers.', { fontSize: '19px', textAlign: 'center', maxWidth: '52ch' }),
        k.row([k.button('Get your ticket'), k.button('View schedule', 'ghost')], { width: 'fit-content', gap: '14px' }),
      ], { alignItems: 'center', gap: '24px' }),
    ], { paddingTop: '116px', paddingBottom: '80px', background: `radial-gradient(1000px 480px at 50% 0%, ${hexA(p.brand, 0.12)}, transparent), ${p.bg}` }),
    // speakers
    k.section([
      k.container([
        centered(k, 'Speakers', 'Voices you’ll remember', 'A hand-picked lineup across product, research and craft.'),
        k.columns([
          speaker(k, U('photo-1500648767791-00dcc994a43e'), 'Jordan Lee', 'CTO, Vercel'),
          speaker(k, U('photo-1544005313-94ddf0286df2'), 'Priya Nair', 'Head of AI, Figma'),
          speaker(k, U('photo-1506794778202-cad84cf45f1d'), 'Marcus Webb', 'Founder, Linear'),
          speaker(k, U('photo-1573497019940-1c28c88b4f3e'), 'Sofia Cruz', 'VP Design, Stripe'),
        ], 4, '22px'),
      ], { gap: '52px' }),
    ]),
    // schedule
    k.section([
      k.container([
        k.heading('Day one', { fontSize: '34px', textAlign: 'center' }),
        k.stack([
          scheduleRow(k, '09:00', 'Registration & coffee', 'Main hall'),
          scheduleRow(k, '10:00', 'Opening keynote: Building for a billion', 'Jordan Lee'),
          scheduleRow(k, '11:30', 'Workshop: Designing with AI', 'Priya Nair'),
          scheduleRow(k, '14:00', 'Panel: The next interface', 'All speakers'),
        ], { gap: '0px', marginTop: '10px' }),
      ], { gap: '20px', maxWidth: '820px' }),
    ], { backgroundColor: p.surface }),
    ctaGradient(k, 'Only 2,000 seats. Don’t miss it.', 'Early-bird tickets end September 30.'),
    footer(k, 'SUMMIT ’26'),
  ])
}

/* ================================================================== */
/*  6 — BLOOM  ·  product / e-commerce (clean)                         */
/* ================================================================== */

const bloomPalette: Palette = {
  brand: '#db2777', brand2: '#be185d', ink: '#1f1520', muted: '#6d5f68',
  bg: '#ffffff', surface: '#fdf2f8', line: '#f3e2ec', dark: '#1a0f16',
  onDark: '#fdeef6', onDarkMuted: '#c99bb4', fontHead: INSTRUMENT, fontBody: INTER, radius: 18,
}

function bloom(): Node {
  const k = kit(bloomPalette)
  const p = bloomPalette
  return k.page([
    navbar(k, 'Bloom', ['Shop', 'Science', 'Reviews', 'Journal']),
    k.section([
      k.container([
        k.row([
          k.stack([
            k.eyebrow('New · Barrier repair serum'),
            k.heading('Skincare that\nworks while you\nsleep.', { fontSize: '60px', lineHeight: '1.02', fontWeight: '500', letterSpacing: '-0.01em', maxWidth: '14ch' }, 'h1'),
            k.text('Clinically-backed formulas with clean ingredients your skin actually recognises. Dermatologist-tested, cruelty-free, forever.', { fontSize: '18px', maxWidth: '46ch' }),
            k.row([k.button('Shop the range'), k.text('★ 4.9 · 12,000 reviews', { fontSize: '14px', fontWeight: '600', color: p.ink })], { width: 'fit-content', gap: '20px' }),
          ], { gap: '22px', flex: '1', width: 'auto', minWidth: '320px' }),
          k.image(U('photo-1556228578-8c89e6adf883', 800), { width: '420px', flexShrink: '0', aspectRatio: '4/5', borderRadius: '24px' }),
        ], { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }),
      ]),
    ], { paddingTop: '96px', paddingBottom: '80px', backgroundColor: p.surface }),
    logoCloud(k, 'As seen in'),
    // product grid
    k.section([
      k.container([
        k.row([k.heading('Bestsellers', { fontSize: '38px', fontWeight: '500' }), k.link('Shop all →', { color: p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          productCard(k, U('photo-1620916566398-39f1143ab7be'), 'Radiance Serum', '₹1,290'),
          productCard(k, U('photo-1608248543803-ba4f8c70ae0b'), 'Barrier Cream', '₹1,490'),
          productCard(k, U('photo-1571781926291-c477ebfd024b'), 'Gentle Cleanser', '₹890'),
          productCard(k, U('photo-1598452963314-b09f397a5c48'), 'Night Oil', '₹1,690'),
        ], 4, '22px'),
      ], { gap: '34px' }),
    ]),
    splitShowcase(k, U('photo-1612817288484-6f916006741a'), 'Right', 'The science', 'Backed by clinical results', 'In an 8-week study, 94% of participants saw visibly stronger, smoother skin. No fillers, no empty promises — just formulas that hold up.', ['Ceramide + peptide complex', 'Fragrance-free & non-comedogenic', 'Third-party lab verified']),
    testimonial(k, U('photo-1487412720507-e7ab37603c6f', 300), 'My skin barrier has never been happier. Three weeks in and I retired half my shelf. Bloom just works.', 'Riya Kapoor', 'Verified buyer'),
    ctaGradient(k, 'Your best skin starts tonight', 'Free shipping over ₹999 · 30-day happiness guarantee.'),
    footer(k, 'Bloom'),
  ])
}

/* ================================================================== */
/*  Shared section builders (parametrised by kit/palette)              */
/* ================================================================== */

type K = ReturnType<typeof kit>

function navbar(k: K, brand: string, links: string[], opts: { border?: boolean } = {}): Node {
  const p = k.p
  return k.section([
    k.row([
      k.row([k.icon('sparkles', p.brand, 22), k.heading(brand, { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }, 'h3')], { width: 'fit-content', gap: '10px' }),
      k.row(links.map((l) => k.link(l)), { width: 'fit-content', gap: '28px', flexWrap: 'wrap' }),
      k.row([k.link('Sign in'), k.button('Get started', 'solid', { paddingTop: '11px', paddingBottom: '11px', paddingLeft: '20px', paddingRight: '20px' })], { width: 'fit-content', gap: '16px' }),
    ], { maxWidth: '1152px', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }),
  ], {
    paddingTop: '20px', paddingBottom: '20px', backgroundColor: p.bg,
    ...(opts.border === false ? {} : { borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: p.line }),
  })
}

function darkNav(k: K, brand: string, links: string[]): Node {
  const p = k.p
  return k.section([
    k.row([
      k.heading(brand, { fontSize: '20px', fontWeight: '700', color: p.ink, letterSpacing: '0.02em' }, 'h3'),
      k.row(links.map((l) => k.link(l, { color: p.muted })), { width: 'fit-content', gap: '28px', flexWrap: 'wrap' }),
      k.button('Let’s talk', 'solid', { backgroundColor: p.brand, color: '#0b0b0c', boxShadow: 'none', paddingTop: '10px', paddingBottom: '10px' }),
    ], { maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }),
  ], { paddingTop: '22px', paddingBottom: '22px', backgroundColor: p.bg, borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: p.line })
}

function centered(k: K, eyebrow: string, title: string, sub: string): Node {
  return k.stack([
    k.eyebrow(eyebrow),
    k.heading(title, { fontSize: '46px', maxWidth: '22ch', textAlign: 'center' }),
    k.text(sub, { fontSize: '18px', textAlign: 'center', maxWidth: '52ch' }),
  ], { alignItems: 'center', textAlign: 'center', gap: '16px' })
}

function featureCard(k: K, icon: string, title: string, body: string): Node {
  return k.card([
    k.iconBadge(icon),
    k.heading(title, { fontSize: '20px', fontWeight: '700' }, 'h3'),
    k.text(body, { fontSize: '15px' }),
  ], { gap: '16px' })
}

function stat(k: K, big: string, label: string, onDark = false): Node {
  const p = k.p
  return k.stack([
    k.heading(big, { fontSize: '46px', fontWeight: '800', letterSpacing: '-0.02em', color: onDark ? p.onDark : p.brand }, 'h3'),
    k.text(label, { fontSize: '14px', color: onDark ? p.onDarkMuted : p.muted }),
  ], { alignItems: 'center', textAlign: 'center', gap: '6px' })
}

function logoCloud(k: K, label: string): Node {
  const p = k.p
  return k.section([
    k.container([
      k.text(label, { fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: p.muted, textAlign: 'center' }),
      k.row(['Vercel', 'Linear', 'Notion', 'Framer', 'Retool'].map((n) => k.heading(n, { fontSize: '22px', fontWeight: '700', color: hexA(p.ink, 0.32) }, 'h4')), { justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }),
    ], { gap: '26px', alignItems: 'center' }),
  ], { paddingTop: '52px', paddingBottom: '52px' })
}

function splitShowcase(k: K, img: string, imgSide: 'Left' | 'Right', eyebrow: string, title: string, body: string, points: string[]): Node {
  const p = k.p
  const textCol = k.stack([
    k.eyebrow(eyebrow),
    k.heading(title, { fontSize: '40px', maxWidth: '16ch' }),
    k.text(body, { fontSize: '17px', maxWidth: '48ch' }),
    k.list(points, { marginTop: '4px' }),
  ], { gap: '18px', width: 'auto', flex: '1', minWidth: '320px' })
  const imgCol = k.image(img, { flexShrink: '0', width: '46%', minWidth: '300px', aspectRatio: '4/3', borderRadius: '20px' })
  const children = imgSide === 'Left' ? [imgCol, textCol] : [textCol, imgCol]
  return k.section([
    k.container([
      k.row(children, { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }),
    ]),
  ], { backgroundColor: p.surface })
}

function testimonial(k: K, avatar: string, quote: string, name: string, role: string, opts: { dark?: boolean } = {}): Node {
  const p = k.p
  const col = opts.dark ? p.onDark : p.ink
  const colMuted = opts.dark ? p.onDarkMuted : p.muted
  return k.section([
    k.container([
      k.icon('sparkles', p.brand, 30),
      k.heading(quote, { fontSize: '30px', lineHeight: '1.4', fontWeight: '600', color: col, textAlign: 'center', maxWidth: '26ch' }),
      k.row([
        k.avatar(avatar),
        k.stack([k.heading(name, { fontSize: '16px', fontWeight: '700', color: col }, 'h4'), k.text(role, { fontSize: '14px', color: colMuted })], { width: 'fit-content', gap: '2px' }),
      ], { width: 'fit-content', gap: '14px' }),
    ], { alignItems: 'center', textAlign: 'center', gap: '26px', maxWidth: '780px' }),
  ], opts.dark ? { backgroundColor: p.dark } : {})
}

function pricing(k: K): Node {
  const p = k.p
  const plan = (name: string, price: string, sub: string, feats: string[], featured: boolean) =>
    k.card([
      ...(featured ? [k.eyebrow('Most popular')] : []),
      k.heading(name, { fontSize: '20px', fontWeight: '700' }, 'h3'),
      k.row([k.heading(price, { fontSize: '46px', fontWeight: '800', letterSpacing: '-0.02em' }, 'h4'), k.text('/mo', { fontSize: '15px', color: p.muted })], { width: 'fit-content', alignItems: 'flex-end', gap: '4px' }),
      k.text(sub, { fontSize: '14px' }),
      k.list(feats),
      k.button(featured ? 'Start free trial' : 'Choose plan', featured ? 'solid' : 'ghost', { width: '100%' }),
    ], { gap: '18px', ...(featured ? { borderColor: p.brand, borderWidth: '2px', boxShadow: `0 30px 60px -30px ${hexA(p.brand, 0.45)}` } : {}) })
  return k.section([
    k.container([
      centered(k, 'Pricing', 'Plans that scale with you', 'Start free. Upgrade only when it pays for itself.'),
      k.columns([
        plan('Starter', '$0', 'For individuals', ['1 workspace', 'Core blocks', 'Community support'], false),
        plan('Pro', '$18', 'For professionals', ['Unlimited workspaces', 'Automations', 'Custom domains', 'Priority support'], true),
        plan('Team', '$49', 'For teams', ['Everything in Pro', 'SSO & SAML', 'Shared library', 'Audit log'], false),
      ], 3, '22px'),
    ], { gap: '52px' }),
  ])
}

function ctaGradient(k: K, title: string, sub: string): Node {
  const p = k.p
  return k.section([
    k.container([
      k.heading(title, { fontSize: '48px', color: '#ffffff', textAlign: 'center', maxWidth: '20ch' }),
      k.text(sub, { fontSize: '18px', color: hexA('#ffffff', 0.8), textAlign: 'center' }),
      k.row([k.button('Start free', 'light', { backgroundColor: '#ffffff', color: p.brand, borderColor: 'transparent' }), k.button('Contact sales', 'light')], { width: 'fit-content', gap: '14px', marginTop: '6px' }),
    ], { alignItems: 'center', textAlign: 'center', gap: '20px' }),
  ], { background: `linear-gradient(135deg, ${p.brand} 0%, ${p.brand2} 100%)` })
}

function ctaSimple(k: K, title: string, sub: string, btn: string): Node {
  return k.section([
    k.container([
      k.heading(title, { fontSize: '44px', textAlign: 'center' }),
      k.text(sub, { fontSize: '18px', textAlign: 'center' }),
      k.button(btn, 'solid'),
    ], { alignItems: 'center', textAlign: 'center', gap: '20px' }),
  ])
}

function footer(k: K, brand: string, opts: { minimal?: boolean } = {}): Node {
  const p = k.p
  if (opts.minimal) {
    return k.section([
      k.container([
        k.divider(p.line),
        k.row([
          k.text(`© 2026 ${brand}`, { fontSize: '14px', color: p.muted }),
          k.row(['Twitter', 'Dribbble', 'LinkedIn'].map((l) => k.link(l, { fontSize: '14px' })), { width: 'fit-content', gap: '20px' }),
        ], { justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }),
      ], { gap: '24px' }),
    ], { paddingTop: '48px', paddingBottom: '48px' })
  }
  const col = (title: string, links: string[]) =>
    k.stack([
      k.text(title, { fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: p.onDark }),
      ...links.map((l) => k.link(l, { color: p.onDarkMuted })),
    ], { gap: '12px' })
  return k.section([
    k.container([
      k.columns([
        k.stack([
          k.row([k.icon('sparkles', p.brand, 22), k.heading(brand, { fontSize: '20px', fontWeight: '800', color: p.onDark }, 'h3')], { width: 'fit-content', gap: '10px' }),
          k.text('Built with Nova — the visual builder for teams who care about craft.', { fontSize: '15px', color: p.onDarkMuted, maxWidth: '32ch' }),
        ], { gap: '14px' }),
        col('Product', ['Features', 'Pricing', 'Changelog', 'Roadmap']),
        col('Company', ['About', 'Blog', 'Careers', 'Contact']),
        col('Legal', ['Privacy', 'Terms', 'Security']),
      ], 4, '32px'),
      k.divider(hexA('#ffffff', 0.1)),
      k.text(`© 2026 ${brand}, Inc. All rights reserved.`, { fontSize: '13px', color: p.onDarkMuted, textAlign: 'center' }),
    ], { gap: '40px' }),
  ], { backgroundColor: p.dark, paddingTop: '72px', paddingBottom: '40px' })
}

function darkFooter(k: K, brand: string, links = ['Product', 'Company', 'Docs', 'Contact']): Node {
  const p = k.p
  return k.section([
    k.container([
      k.row([
        k.heading(brand, { fontSize: '22px', fontWeight: '700', color: p.ink }, 'h3'),
        k.row(links.map((l) => k.link(l, { color: p.muted })), { width: 'fit-content', gap: '24px' }),
      ], { justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }),
      k.divider(p.line),
      k.text(`© 2026 ${brand}. All rights reserved.`, { fontSize: '13px', color: p.muted }),
    ], { gap: '28px' }),
  ], { backgroundColor: p.surface, paddingTop: '56px', paddingBottom: '44px' })
}

function serviceRow(k: K, num: string, label: string): Node {
  const p = k.p
  return k.row([
    k.text(num, { fontSize: '15px', color: p.brand, fontWeight: '700', width: '48px' }),
    k.heading(label, { fontSize: '26px', fontWeight: '600', color: p.ink }, 'h3'),
  ], { justifyContent: 'flex-start', gap: '20px', paddingTop: '22px', paddingBottom: '22px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: p.line })
}

function projectCard(k: K, img: string, tag: string, title: string): Node {
  const p = k.p
  return k.stack([
    k.image(img, { aspectRatio: '4/3', borderRadius: '16px' }),
    k.text(tag.toUpperCase(), { fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', color: p.brand }),
    k.heading(title, { fontSize: '24px', fontWeight: '600' }, 'h3'),
  ], { gap: '10px' })
}

function productCard(k: K, img: string, name: string, price: string): Node {
  const p = k.p
  return k.stack([
    k.image(img, { aspectRatio: '1/1', borderRadius: '16px' }),
    k.row([k.heading(name, { fontSize: '17px', fontWeight: '600' }, 'h4'), k.text(price, { fontSize: '16px', fontWeight: '700', color: p.ink })], { justifyContent: 'space-between' }),
    k.button('Add to bag', 'ghost', { width: '100%', paddingTop: '10px', paddingBottom: '10px' }),
  ], { gap: '12px' })
}

function speaker(k: K, img: string, name: string, role: string): Node {
  const p = k.p
  return k.stack([
    k.image(img, { aspectRatio: '1/1', borderRadius: '18px' }),
    k.heading(name, { fontSize: '18px', fontWeight: '700' }, 'h4'),
    k.text(role, { fontSize: '14px', color: p.muted }),
  ], { gap: '10px' })
}

function scheduleRow(k: K, time: string, title: string, meta: string): Node {
  const p = k.p
  return k.row([
    k.text(time, { fontSize: '15px', fontWeight: '700', color: p.brand, width: '70px' }),
    k.heading(title, { fontSize: '18px', fontWeight: '600' }, 'h4'),
    k.text(meta, { fontSize: '14px', color: p.muted, marginLeft: 'auto', width: 'fit-content' }),
  ], { justifyContent: 'flex-start', gap: '18px', paddingTop: '20px', paddingBottom: '20px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: p.line })
}

/* ================================================================== */
/*  7 — HORIZON  ·  SaaS (bento layout, blue)                          */
/* ================================================================== */

const horizonPalette: Palette = {
  brand: '#2563eb', brand2: '#3b82f6', ink: '#0b1220', muted: '#51607a',
  bg: '#ffffff', surface: '#f7f9fc', line: '#e6ecf5', dark: '#0b1220',
  onDark: '#f2f6ff', onDarkMuted: '#93a4c4', fontHead: SORA, fontBody: INTER, radius: 18,
}

function horizon(): Node {
  const k = kit(horizonPalette)
  const p = horizonPalette
  return k.page([
    navbar(k, 'Horizon', ['Platform', 'Customers', 'Pricing', 'Docs']),
    k.section([
      k.container([
        k.eyebrow('The developer data platform'),
        k.heading('Ship data-rich apps\nat the speed of thought.', { fontSize: '62px', lineHeight: '1.04', letterSpacing: '-0.03em', textAlign: 'center', maxWidth: '18ch' }, 'h1'),
        k.text('One API for search, analytics and vectors. Horizon scales from prototype to billions of rows without a rewrite.', { fontSize: '19px', textAlign: 'center', maxWidth: '54ch' }),
        k.row([k.button('Start building'), k.button('Read the docs', 'ghost')], { width: 'fit-content', gap: '14px' }),
      ], { alignItems: 'center', gap: '22px' }),
    ], { paddingTop: '112px', paddingBottom: '70px', background: `radial-gradient(1000px 460px at 50% 0%, ${hexA(p.brand, 0.1)}, transparent), #fff` }),
    // bento grid
    k.section([
      k.container([
        centered(k, 'Platform', 'A complete data toolkit', 'Batteries included, escape hatches everywhere.'),
        k.columns([
          bento(k, 'search', 'Full-text & vector search', 'Blend keyword and semantic ranking in a single query.', true),
          bento(k, 'gauge', 'Real-time analytics', 'Sub-second aggregations over live event streams.'),
        ], 2, '22px', { gridTemplateColumns: '1.5fr 1fr' }),
        k.columns([
          bento(k, 'shield', 'SOC 2 & HIPAA', 'Compliance built in.'),
          bento(k, 'globe', 'Global edge', '19 regions, one endpoint.'),
          bento(k, 'code', 'Typed SDKs', 'For TS, Python and Go.'),
        ], 3, '22px'),
      ], { gap: '52px' }),
    ], { backgroundColor: p.surface }),
    splitShowcase(k, U('photo-1551288049-bebda4e38f71'), 'Right', 'Observability', 'See every query, live', 'Trace latency down to the shard, replay slow queries and get proactive alerts before your users notice a thing.', ['P99 latency tracing', 'Query replay & explain', 'Anomaly alerts']),
    k.section([
      k.container([k.columns([stat(k, '8B+', 'Rows indexed', true), stat(k, '12ms', 'p50 query', true), stat(k, '19', 'Edge regions', true), stat(k, '99.99%', 'Uptime', true)])]),
    ], { backgroundColor: p.dark, paddingTop: '76px', paddingBottom: '76px' }),
    pricing(k),
    ctaGradient(k, 'Build your first index in minutes', 'Free tier includes 1M rows and 100k queries a month.'),
    footer(k, 'Horizon'),
  ])
}

/* ================================================================== */
/*  8 — GAZETTE  ·  blog / magazine (editorial serif)                  */
/* ================================================================== */

const gazettePalette: Palette = {
  brand: '#b91c1c', brand2: '#dc2626', ink: '#161413', muted: '#6b625d',
  bg: '#fbfaf7', surface: '#ffffff', line: '#e9e4dc', dark: '#161413',
  onDark: '#fbfaf7', onDarkMuted: '#a8a29e', fontHead: PLAYFAIR, fontBody: DMSANS, radius: 8,
}

function gazette(): Node {
  const k = kit(gazettePalette)
  const p = gazettePalette
  return k.page([
    // masthead
    k.section([
      k.container([
        k.heading('The Gazette', { fontSize: '40px', fontWeight: '800', letterSpacing: '0.02em', textAlign: 'center' }, 'h3'),
        k.divider(p.line),
        k.row(['Culture', 'Technology', 'Design', 'Business', 'Science'].map((l) => k.link(l, { fontSize: '14px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' })), { justifyContent: 'center', gap: '30px' }),
      ], { gap: '18px', maxWidth: '960px' }),
    ], { paddingTop: '36px', paddingBottom: '20px' }),
    // hero article
    k.section([
      k.container([
        k.image(U('photo-1499750310107-5fef28a66643', 1400), { aspectRatio: '21/9', borderRadius: '10px' }),
        k.stack([
          k.text('FEATURED · TECHNOLOGY', { fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', color: p.brand }),
          k.heading('The quiet return of the personal website', { fontSize: '52px', lineHeight: '1.08', fontWeight: '700', maxWidth: '20ch' }, 'h1'),
          k.text('In an age of algorithmic feeds, a new generation is rediscovering the joy of owning a small corner of the internet.', { fontSize: '19px', maxWidth: '60ch' }),
          k.row([k.text('By Elena Vance', { fontSize: '14px', fontWeight: '600', color: p.ink, width: 'fit-content' }), k.text('· 8 min read', { fontSize: '14px', color: p.muted, width: 'fit-content' })], { width: 'fit-content', gap: '8px' }),
        ], { gap: '14px', alignItems: 'center', textAlign: 'center' }),
      ], { gap: '32px', alignItems: 'center' }),
    ], { paddingTop: '40px', paddingBottom: '70px' }),
    // article grid
    k.section([
      k.container([
        k.row([k.heading('Latest stories', { fontSize: '30px', fontWeight: '700' }), k.link('Archive →', { color: p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          articleCard(k, U('photo-1467232004584-a241de8bcf5d'), 'Design', 'Why constraints make better products'),
          articleCard(k, U('photo-1519389950473-47ba0277781c'), 'Business', 'The four-day week, two years on'),
          articleCard(k, U('photo-1451187580459-43490279c0fa'), 'Science', 'What deep-sea vents teach us about life'),
        ], 3, '30px'),
      ], { gap: '34px' }),
    ], { backgroundColor: p.surface }),
    // newsletter
    k.section([
      k.container([
        k.heading('Get the Sunday edition', { fontSize: '40px', textAlign: 'center' }),
        k.text('One thoughtful email each week. No noise, no ads.', { fontSize: '17px', textAlign: 'center' }),
        k.row([
          makeNode('input', { placeholder: 'you@email.com', inputType: 'email', name: 'email' }, { width: '300px', paddingTop: '13px', paddingBottom: '13px', paddingLeft: '16px', paddingRight: '16px', fontSize: '15px', backgroundColor: '#fff', borderWidth: '1px', borderStyle: 'solid', borderColor: p.line, borderRadius: '8px', fontFamily: p.fontBody }),
          k.button('Subscribe'),
        ], { width: 'fit-content', gap: '10px' }),
      ], { alignItems: 'center', gap: '20px' }),
    ]),
    darkFooter(k, 'The Gazette'),
  ])
}

/* ================================================================== */
/*  9 — SAFFRON  ·  restaurant / café (warm)                           */
/* ================================================================== */

const saffronPalette: Palette = {
  brand: '#b45309', brand2: '#92400e', ink: '#20160c', muted: '#6f5f4e',
  bg: '#fbf6ee', surface: '#ffffff', line: '#efe4d3', dark: '#20160c',
  onDark: '#fbf6ee', onDarkMuted: '#c4b096', fontHead: PLAYFAIR, fontBody: DMSANS, radius: 14,
}

function saffron(): Node {
  const k = kit(saffronPalette)
  const p = saffronPalette
  return k.page([
    navbar(k, 'Saffron', ['Menu', 'About', 'Gallery', 'Reserve'], { border: false }),
    k.section([
      k.container([
        k.row([
          k.stack([
            k.eyebrow('Modern Indian kitchen', { backgroundColor: 'transparent', color: p.brand, paddingLeft: '0', letterSpacing: '0.14em' }),
            k.heading('A table set\nfor stories.', { fontSize: '68px', lineHeight: '1.0', fontWeight: '700', maxWidth: '12ch' }, 'h1'),
            k.text('Seasonal plates rooted in tradition, plated for today. Open for dinner, Tuesday to Sunday, in the heart of the old quarter.', { fontSize: '18px', maxWidth: '44ch' }),
            k.row([k.button('Reserve a table'), k.button('View menu', 'ghost')], { width: 'fit-content', gap: '14px' }),
          ], { gap: '22px', flex: '1', width: 'auto', minWidth: '320px' }),
          k.image(U('photo-1517248135467-4c7edcad34c4', 800), { width: '440px', flexShrink: '0', aspectRatio: '4/5', borderRadius: '20px' }),
        ], { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }),
      ]),
    ], { paddingTop: '84px', paddingBottom: '80px' }),
    // menu
    k.section([
      k.container([
        centered(k, 'The menu', 'Chef’s selection', 'A rotating menu of small and large plates to share.'),
        k.columns([
          k.stack([menuItem(k, 'Charred aubergine', 'Smoked yoghurt, pomegranate, mint', '₹420'), menuItem(k, 'Saffron risotto', 'Aged parmesan, toasted pine', '₹560'), menuItem(k, 'Tandoori cauliflower', 'Cashew cream, curry leaf', '₹480')], { gap: '0px' }),
          k.stack([menuItem(k, 'Lamb shank rogan', 'Kashmiri chilli, saffron rice', '₹720'), menuItem(k, 'Sea bass moilee', 'Coconut, raw mango, curry leaf', '₹680'), menuItem(k, 'Dark chocolate & chai', 'Cardamom cream, honeycomb', '₹360')], { gap: '0px' }),
        ], 2, '48px'),
      ], { gap: '52px' }),
    ], { backgroundColor: p.surface }),
    splitShowcase(k, U('photo-1424847651672-bf20a4b0982b'), 'Left', 'Our story', 'From our family table to yours', 'Founded in 2014 by siblings Aarav and Meera, Saffron began as a supper club and grew into a room full of regulars who feel like family.', ['Locally sourced produce', 'House-ground spices, daily', 'Vegetarian & vegan friendly']),
    testimonial(k, U('photo-1438761681033-6461ffad8d80', 300), 'The best meal we’ve had in the city, full stop. Every plate felt personal, every flavour intentional. We’ve already booked again.', 'Anaya & Rohan', 'Regulars since 2019'),
    // reserve CTA
    k.section([
      k.container([
        k.heading('Join us this evening', { fontSize: '46px', color: '#fff', textAlign: 'center' }),
        k.text('Reservations recommended · Walk-ins welcome at the bar.', { fontSize: '18px', color: hexA('#ffffff', 0.8), textAlign: 'center' }),
        k.button('Book your table', 'light', { backgroundColor: '#fff', color: p.brand, borderColor: 'transparent' }),
      ], { alignItems: 'center', gap: '20px' }),
    ], { background: `linear-gradient(135deg, ${p.brand}, ${p.brand2})` }),
    footer(k, 'Saffron'),
  ])
}

/* ================================================================== */
/*  10 — HAVEN  ·  real estate (clean, trustworthy)                    */
/* ================================================================== */

const havenPalette: Palette = {
  brand: '#0f766e', brand2: '#0d9488', ink: '#0c1a19', muted: '#4f6664',
  bg: '#ffffff', surface: '#f4faf9', line: '#e0efec', dark: '#0c1a19',
  onDark: '#eefaf8', onDarkMuted: '#8fb7b1', fontHead: SORA, fontBody: INTER, radius: 16,
}

function haven(): Node {
  const k = kit(havenPalette)
  const p = havenPalette
  return k.page([
    navbar(k, 'Haven', ['Buy', 'Rent', 'Sell', 'Agents']),
    k.section([
      k.container([
        k.eyebrow('20,000+ homes across the country'),
        k.heading('Find the place\nyou’ll call home.', { fontSize: '60px', lineHeight: '1.04', letterSpacing: '-0.02em', textAlign: 'center', maxWidth: '16ch' }, 'h1'),
        k.text('Search thousands of verified listings, book viewings instantly and get pre-approved — all in one place.', { fontSize: '18px', textAlign: 'center', maxWidth: '52ch' }),
        // search bar
        k.row([
          makeNode('input', { placeholder: 'City, neighbourhood or ZIP', inputType: 'text', name: 'q' }, { flex: '1', width: 'auto', paddingTop: '15px', paddingBottom: '15px', paddingLeft: '18px', paddingRight: '18px', fontSize: '16px', backgroundColor: '#fff', borderWidth: '1px', borderStyle: 'solid', borderColor: p.line, borderRadius: '14px', fontFamily: p.fontBody }),
          k.button('Search homes', 'solid', { paddingTop: '15px', paddingBottom: '15px' }),
        ], { width: '100%', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto', gap: '10px' }),
      ], { alignItems: 'center', gap: '22px' }),
    ], { paddingTop: '104px', paddingBottom: '80px', background: `radial-gradient(900px 440px at 50% 0%, ${hexA(p.brand, 0.1)}, transparent), #fff` }),
    // featured listings
    k.section([
      k.container([
        k.row([k.heading('Featured homes', { fontSize: '34px' }), k.link('View all listings →', { color: p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          propertyCard(k, U('photo-1568605114967-8130f3a36994'), '₹1.8 Cr', 'Sunlit 3BHK with garden', 'Bandra West · 1,450 sqft'),
          propertyCard(k, U('photo-1570129477492-45c003edd2be'), '₹2.4 Cr', 'Modern villa with pool', 'Whitefield · 2,800 sqft'),
          propertyCard(k, U('photo-1512917774080-9991f1c4c750'), '₹95 L', 'Cosy 2BHK near the lake', 'Powai · 980 sqft'),
        ], 3, '24px'),
      ], { gap: '34px' }),
    ], { backgroundColor: p.surface }),
    k.section([
      k.container([k.columns([stat(k, '20k+', 'Active listings', true), stat(k, '4,200', 'Homes sold', true), stat(k, '98%', 'Client satisfaction', true), stat(k, '15 min', 'Avg. response', true)])]),
    ], { backgroundColor: p.dark, paddingTop: '76px', paddingBottom: '76px' }),
    splitShowcase(k, U('photo-1560518883-ce09059eeffa'), 'Right', 'For sellers', 'Sell for more, with less stress', 'List with a dedicated Haven agent, get a data-backed price and reach qualified buyers from day one.', ['Free professional photography', 'Transparent 1% fee', 'Dedicated closing manager']),
    ctaGradient(k, 'Your next chapter starts here', 'Browse homes or talk to a local Haven agent today.'),
    footer(k, 'Haven'),
  ])
}

/* ================================================================== */
/*  11 — FORGE  ·  fitness / gym (bold, dark)                          */
/* ================================================================== */

const forgePalette: Palette = {
  brand: '#f97316', brand2: '#ea580c', ink: '#f6f6f4', muted: '#a1a09b',
  bg: '#0a0a0b', surface: '#141416', line: '#242427', dark: '#0a0a0b',
  onDark: '#f6f6f4', onDarkMuted: '#a1a09b', fontHead: SPACE, fontBody: MANROPE, radius: 12,
}

function forge(): Node {
  const k = kit(forgePalette)
  const p = forgePalette
  return k.page([
    darkNav(k, 'FORGE', ['Classes', 'Coaches', 'Pricing', 'Join']),
    k.section([
      k.container([
        k.eyebrow('Strength · Conditioning · Community', { backgroundColor: hexA(p.brand, 0.15), color: p.brand }),
        k.heading('Become\nunbreakable.', { fontSize: '92px', lineHeight: '0.95', letterSpacing: '-0.03em', color: p.ink, textAlign: 'center', maxWidth: '10ch' }, 'h1'),
        k.text('World-class coaching, brutal-but-fair programming and a community that shows up. Your first week is on us.', { fontSize: '18px', color: p.muted, textAlign: 'center', maxWidth: '50ch' }),
        k.row([k.button('Claim free week', 'solid', { boxShadow: 'none' }), k.button('Watch a class', 'ghost')], { width: 'fit-content', gap: '14px' }),
      ], { alignItems: 'center', gap: '24px' }),
    ], { paddingTop: '104px', paddingBottom: '80px', background: `radial-gradient(900px 460px at 50% 0%, ${hexA(p.brand, 0.14)}, transparent), ${p.bg}` }),
    k.section([
      k.container([
        centered(k, 'Programs', 'Train with intent', 'Pick your path — or do it all.'),
        k.columns([
          featureCard(k, 'flame', 'Strength', 'Progressive barbell programming to build real, lasting power.'),
          featureCard(k, 'gauge', 'Conditioning', 'High-intensity intervals that torch calories and build engine.'),
          featureCard(k, 'users', 'Community WODs', 'Partner and team workouts that make the hard days fun.'),
        ], 3, '22px'),
      ], { gap: '52px' }),
    ], { backgroundColor: p.surface }),
    // schedule
    k.section([
      k.container([
        k.heading('This week’s schedule', { fontSize: '34px', color: p.ink, textAlign: 'center' }),
        k.stack([
          scheduleRow(k, '06:00', 'Sunrise Strength', 'Coach Mara'),
          scheduleRow(k, '12:15', 'Lunch Metcon', 'Coach Dev'),
          scheduleRow(k, '18:30', 'Barbell Club', 'Coach Alex'),
          scheduleRow(k, '19:45', 'Mobility & Recovery', 'Coach Mara'),
        ], { gap: '0px', marginTop: '10px' }),
      ], { gap: '18px', maxWidth: '820px' }),
    ]),
    testimonial(k, U('photo-1534438327276-14e5300c3a48', 300), 'I came for the workouts and stayed for the people. Down 14kg, up three pull-ups, and stronger than I was at 25.', 'Vikram S.', 'Member, 2 years', { dark: true }),
    k.section([
      k.container([
        k.heading('Your first week is free.', { fontSize: '52px', color: '#fff', textAlign: 'center', maxWidth: '16ch' }),
        k.text('No contracts. No pressure. Just show up.', { fontSize: '18px', color: hexA('#ffffff', 0.85), textAlign: 'center' }),
        k.button('Start free trial', 'light', { backgroundColor: '#fff', color: p.brand, borderColor: 'transparent' }),
      ], { alignItems: 'center', gap: '20px' }),
    ], { background: `linear-gradient(135deg, ${p.brand}, ${p.brand2})` }),
    darkFooter(k, 'FORGE'),
  ])
}

/* ================================================================== */
/*  12 — LEDGER  ·  fintech / web3 (dark, techy)                       */
/* ================================================================== */

const ledgerPalette: Palette = {
  brand: '#22d3ee', brand2: '#3b82f6', ink: '#eef4ff', muted: '#8ea1c4',
  bg: '#070b16', surface: '#0e1424', line: '#1c2740', dark: '#070b16',
  onDark: '#eef4ff', onDarkMuted: '#8ea1c4', fontHead: SPACE, fontBody: INTER, radius: 16,
}

function ledger(): Node {
  const k = kit(ledgerPalette)
  const p = ledgerPalette
  return k.page([
    darkNav(k, 'Ledger', ['Product', 'Developers', 'Security', 'Company']),
    k.section([
      k.container([
        k.eyebrow('Self-custody, done right', { backgroundColor: hexA(p.brand, 0.14), color: p.brand }),
        k.heading('The wallet for\nthe on-chain economy.', { fontSize: '64px', lineHeight: '1.03', letterSpacing: '-0.03em', color: p.ink, textAlign: 'center', maxWidth: '17ch' }, 'h1'),
        k.text('Send, swap and stake across 40+ chains with hardware-grade security and fees that finally make sense.', { fontSize: '19px', color: p.muted, textAlign: 'center', maxWidth: '54ch' }),
        k.row([k.button('Download wallet', 'solid'), k.button('Read the whitepaper', 'ghost')], { width: 'fit-content', gap: '14px' }),
      ], { alignItems: 'center', gap: '22px' }),
    ], { paddingTop: '112px', paddingBottom: '70px', background: `radial-gradient(1000px 480px at 50% 0%, ${hexA(p.brand, 0.12)}, transparent), ${p.bg}` }),
    logoCloud(k, 'Integrated with'),
    k.section([
      k.container([
        centered(k, 'Why Ledger', 'Own your keys, own your future', 'Non-custodial by design, effortless by default.'),
        k.columns([
          featureCard(k, 'lock', 'Hardware-grade', 'Keys never leave your device. Not even we can touch them.'),
          featureCard(k, 'zap', 'Instant swaps', 'Best-price routing across every major DEX in one tap.'),
          featureCard(k, 'trending', 'Earn safely', 'Stake blue-chip assets with transparent, audited yields.'),
        ], 3, '22px'),
      ], { gap: '52px' }),
    ], { backgroundColor: p.surface }),
    k.section([
      k.container([k.columns([stat(k, '$40B+', 'Secured', true), stat(k, '40+', 'Chains', true), stat(k, '6M', 'Wallets', true), stat(k, '0', 'Custody risk', true)])]),
    ], { backgroundColor: p.surface, paddingTop: '76px', paddingBottom: '76px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: p.line }),
    testimonial(k, U('photo-1519085360753-af0119f7cbe7', 300), 'Finally a self-custody wallet my whole team can actually use. The security model is serious without getting in the way.', 'Nadia Rahman', 'Ops lead, a DAO you know', { dark: true }),
    ctaGradient(k, 'Take custody in 60 seconds', 'Free, open-source, and audited by the best in the space.'),
    darkFooter(k, 'Ledger'),
  ])
}

/* ------------------------------------------------------------------ */
/*  extra shared builders for the templates above                      */
/* ------------------------------------------------------------------ */

function bento(k: K, icon: string, title: string, body: string, big = false): Node {
  return k.card([
    k.iconBadge(icon),
    k.heading(title, { fontSize: big ? '26px' : '20px', fontWeight: '700' }, 'h3'),
    k.text(body, { fontSize: big ? '16px' : '15px' }),
  ], { gap: '14px', justifyContent: 'flex-start', minHeight: big ? '220px' : 'auto' })
}

function articleCard(k: K, img: string, cat: string, title: string): Node {
  const p = k.p
  return k.stack([
    k.image(img, { aspectRatio: '3/2', borderRadius: '10px' }),
    k.text(cat.toUpperCase(), { fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', color: p.brand }),
    k.heading(title, { fontSize: '24px', fontWeight: '700', lineHeight: '1.2' }, 'h3'),
    k.link('Read article →', { color: p.muted, fontSize: '14px' }),
  ], { gap: '10px' })
}

function menuItem(k: K, name: string, desc: string, price: string): Node {
  const p = k.p
  return k.stack([
    k.row([
      k.heading(name, { fontSize: '20px', fontWeight: '700' }, 'h4'),
      makeNode('divider', { color: p.line }, { flex: '1', width: 'auto', height: '1px', border: 'none', marginLeft: '10px', marginRight: '10px', alignSelf: 'center' }),
      k.text(price, { fontSize: '16px', fontWeight: '700', color: p.brand, width: 'fit-content' }),
    ], { alignItems: 'baseline' }),
    k.text(desc, { fontSize: '14px', color: p.muted }),
  ], { gap: '4px', paddingTop: '18px', paddingBottom: '18px', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: p.line })
}

function propertyCard(k: K, img: string, price: string, title: string, meta: string): Node {
  const p = k.p
  return k.card([
    k.image(img, { aspectRatio: '3/2', borderRadius: '12px' }),
    k.row([k.heading(price, { fontSize: '22px', fontWeight: '800' }, 'h4'), k.eyebrow('For sale', { fontSize: '11px' })], { justifyContent: 'space-between', alignItems: 'center' }),
    k.heading(title, { fontSize: '17px', fontWeight: '600' }, 'h4'),
    k.text(meta, { fontSize: '14px', color: p.muted }),
  ], { gap: '12px', padding: '16px' })
}

/* ================================================================== */
/*  13 — MEDIVA  ·  medical / healthcare (clean, clinical)             */
/* ================================================================== */

const medivaPalette: Palette = {
  brand: '#0369a1', brand2: '#0891b2', ink: '#0b1b26', muted: '#4c6472',
  bg: '#ffffff', surface: '#f2f8fb', line: '#e0edf3', dark: '#0b1b26',
  onDark: '#eef7fb', onDarkMuted: '#8fb2c4', fontHead: SORA, fontBody: INTER, radius: 16,
}

function mediva(): Node {
  const k = kit(medivaPalette)
  const p = medivaPalette
  return k.page([
    navbar(k, 'Mediva', ['Services', 'Doctors', 'Patients', 'Contact']),
    k.section([
      k.container([
        k.row([
          k.stack([
            k.eyebrow('Trusted care since 1998'),
            k.heading('Compassionate care,\nclose to home.', { fontSize: '58px', lineHeight: '1.05', letterSpacing: '-0.02em', maxWidth: '15ch' }, 'h1'),
            k.text('Same-day appointments, expert specialists and a team that treats you like family. Your health, our priority — every single day.', { fontSize: '18px', maxWidth: '46ch' }),
            k.row([k.button('Book appointment'), k.button('Call 1800-MEDIVA', 'ghost')], { width: 'fit-content', gap: '14px' }),
          ], { gap: '22px', flex: '1', width: 'auto', minWidth: '320px' }),
          k.image(U('photo-1519494026892-80bbd2d6fd0d', 800), { width: '460px', flexShrink: '0', aspectRatio: '4/3', borderRadius: '20px' }),
        ], { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }),
      ]),
    ], { paddingTop: '92px', paddingBottom: '80px', background: `radial-gradient(900px 440px at 80% 0%, ${hexA(p.brand, 0.08)}, transparent), #fff` }),
    k.section([
      k.container([
        centered(k, 'Our services', 'Complete care under one roof', 'From routine check-ups to specialist treatment.'),
        k.columns([
          featureCard(k, 'heart', 'Cardiology', 'Advanced heart care with state-of-the-art diagnostics.'),
          featureCard(k, 'shield', 'Preventive care', 'Screenings and wellness plans tailored to you.'),
          featureCard(k, 'users', 'Family medicine', 'Trusted primary care for every age and stage.'),
          featureCard(k, 'clock', '24/7 emergency', 'Round-the-clock care when minutes matter most.'),
          featureCard(k, 'phone', 'Telehealth', 'See a doctor from home in minutes, not days.'),
          featureCard(k, 'award', 'Accredited', 'Nationally recognised for safety and quality.'),
        ], 3, '22px'),
      ], { gap: '52px' }),
    ], { backgroundColor: p.surface }),
    k.section([
      k.container([k.columns([stat(k, '250k+', 'Patients cared for', true), stat(k, '120', 'Expert doctors', true), stat(k, '4.9★', 'Patient rating', true), stat(k, '25+', 'Years of service', true)])]),
    ], { backgroundColor: p.dark, paddingTop: '76px', paddingBottom: '76px' }),
    testimonial(k, U('photo-1607990281513-2c110a25bd8c', 300), 'From the front desk to the surgeon, every person made a scary time feel manageable. I finally found a clinic I trust completely.', 'Meera Joshi', 'Patient since 2016'),
    ctaGradient(k, 'Your health can’t wait', 'Book an appointment today — most visits available same week.'),
    footer(k, 'Mediva'),
  ])
}

/* ================================================================== */
/*  14 — SCHOLAR  ·  education / online courses                        */
/* ================================================================== */

const scholarPalette: Palette = {
  brand: '#4f46e5', brand2: '#7c3aed', ink: '#161428', muted: '#5b586f',
  bg: '#ffffff', surface: '#f6f5fe', line: '#e8e6f7', dark: '#141227',
  onDark: '#f1effc', onDarkMuted: '#a19dc4', fontHead: MANROPE, fontBody: INTER, radius: 18,
}

function scholar(): Node {
  const k = kit(scholarPalette)
  const p = scholarPalette
  return k.page([
    navbar(k, 'Scholar', ['Courses', 'Mentors', 'Pricing', 'For teams']),
    k.section([
      k.container([
        k.eyebrow('Learn by building'),
        k.heading('Master in-demand skills,\none project at a time.', { fontSize: '58px', lineHeight: '1.05', letterSpacing: '-0.025em', textAlign: 'center', maxWidth: '18ch' }, 'h1'),
        k.text('Project-based courses in design, code and data — taught by people who actually do the work. Learn at your pace, get a certificate that counts.', { fontSize: '18px', textAlign: 'center', maxWidth: '56ch' }),
        k.row([k.button('Start learning free'), k.button('Browse courses', 'ghost')], { width: 'fit-content', gap: '14px' }),
      ], { alignItems: 'center', gap: '22px' }),
    ], { paddingTop: '104px', paddingBottom: '70px', background: `radial-gradient(900px 440px at 50% 0%, ${hexA(p.brand, 0.1)}, transparent), #fff` }),
    logoCloud(k, 'Our grads work at'),
    k.section([
      k.container([
        k.row([k.heading('Popular courses', { fontSize: '34px' }), k.link('View all →', { color: p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          courseCard(k, U('photo-1461749280684-dccba630e2f6'), 'Code', 'Full-Stack Web Development', '48 lessons · 12h'),
          courseCard(k, U('photo-1558655146-9f40138edfeb'), 'Design', 'Product Design Masterclass', '36 lessons · 9h'),
          courseCard(k, U('photo-1551288049-bebda4e38f71'), 'Data', 'Data Science with Python', '52 lessons · 15h'),
        ], 3, '24px'),
      ], { gap: '34px' }),
    ], { backgroundColor: p.surface }),
    splitShowcase(k, U('photo-1522202176988-66273c2fd55f'), 'Left', 'Why Scholar', 'Learn with a mentor, not a playlist', 'Weekly live sessions, code reviews and a community that keeps you accountable. You’ll finish with real projects in your portfolio.', ['1:1 mentor feedback', 'Verified certificates', 'Lifetime course access']),
    pricing(k),
    testimonial(k, U('photo-1500648767791-00dcc994a43e', 300), 'I went from zero to a junior dev job in seven months. The projects gave me a portfolio and the mentors gave me confidence.', 'Karan Mehta', 'Now @ a startup you know'),
    ctaGradient(k, 'Invest in yourself today', 'Start free — no card required. Cancel anytime.'),
    footer(k, 'Scholar'),
  ])
}

/* ================================================================== */
/*  15 — WANDER  ·  travel / tours (vibrant imagery)                   */
/* ================================================================== */

const wanderPalette: Palette = {
  brand: '#ea580c', brand2: '#f59e0b', ink: '#1c1206', muted: '#6b5a48',
  bg: '#fffaf3', surface: '#ffffff', line: '#f2e6d6', dark: '#1c1206',
  onDark: '#fff6ec', onDarkMuted: '#c9ad91', fontHead: SORA, fontBody: DMSANS, radius: 20,
}

function wander(): Node {
  const k = kit(wanderPalette)
  const p = wanderPalette
  return k.page([
    navbar(k, 'Wander', ['Destinations', 'Tours', 'Stories', 'Book']),
    k.section([
      k.container([
        k.eyebrow('Handcrafted journeys'),
        k.heading('Go somewhere\nthat changes you.', { fontSize: '66px', lineHeight: '1.02', letterSpacing: '-0.03em', textAlign: 'center', maxWidth: '14ch' }, 'h1'),
        k.text('Small-group adventures to the world’s most breathtaking places, led by local guides who know the stories behind every view.', { fontSize: '19px', textAlign: 'center', maxWidth: '52ch' }),
        k.row([k.button('Find your trip'), k.button('Watch the film', 'ghost')], { width: 'fit-content', gap: '14px' }),
        k.image(U('photo-1476514525535-07fb3b4ae5f1', 1600), { marginTop: '48px', aspectRatio: '21/9', borderRadius: '24px' }),
      ], { alignItems: 'center', gap: '22px' }),
    ], { paddingTop: '104px', paddingBottom: '70px', background: `radial-gradient(1000px 460px at 50% 0%, ${hexA(p.brand, 0.1)}, transparent), ${p.bg}` }),
    k.section([
      k.container([
        centered(k, 'Destinations', 'Where will you wander?', 'Curated trips across six continents.'),
        k.columns([
          destCard(k, U('photo-1526772662000-3f88f10405ff'), 'Kyoto, Japan', '7 days'),
          destCard(k, U('photo-1503917988258-f87a78e3c995'), 'Patagonia, Chile', '10 days'),
          destCard(k, U('photo-1502602898657-3e91760cbb34'), 'Amalfi, Italy', '6 days'),
          destCard(k, U('photo-1590523277543-a94d2e4eb00b'), 'Marrakech, Morocco', '5 days'),
          destCard(k, U('photo-1548013146-72479768bada'), 'Rajasthan, India', '9 days'),
          destCard(k, U('photo-1504457047772-27faf1c00561'), 'Reykjavík, Iceland', '8 days'),
        ], 3, '22px'),
      ], { gap: '52px' }),
    ], { backgroundColor: p.surface }),
    k.section([
      k.container([k.columns([stat(k, '60+', 'Destinations', true), stat(k, '12k', 'Happy travellers', true), stat(k, '4.9★', 'Avg. trip rating', true), stat(k, '100%', 'Local guides', true)])]),
    ], { backgroundColor: p.dark, paddingTop: '76px', paddingBottom: '76px' }),
    testimonial(k, U('photo-1521252659862-eec69941b071', 300), 'Ten days in Patagonia with Wander was the best trip of my life. Every detail was handled — I just had to show up and be amazed.', 'Sara Lin', 'Traveller · Patagonia ’25'),
    ctaGradient(k, 'Your next adventure is calling', 'Limited spots each season — reserve yours today.'),
    footer(k, 'Wander'),
  ])
}

/* ================================================================== */
/*  16 — VOWS  ·  wedding (elegant, romantic)                          */
/* ================================================================== */

const vowsPalette: Palette = {
  brand: '#b08968', brand2: '#9c6f4e', ink: '#2b2018', muted: '#7c6c5e',
  bg: '#faf5ef', surface: '#ffffff', line: '#ece0d3', dark: '#2b2018',
  onDark: '#faf5ef', onDarkMuted: '#c3b3a2', fontHead: PLAYFAIR, fontBody: DMSANS, radius: 14,
}

function vows(): Node {
  const k = kit(vowsPalette)
  const p = vowsPalette
  return k.page([
    navbar(k, 'A & R', ['Story', 'Details', 'Gallery', 'RSVP'], { border: false }),
    k.section([
      k.container([
        k.eyebrow('We’re getting married', { backgroundColor: 'transparent', color: p.brand, letterSpacing: '0.2em', paddingLeft: '0' }),
        k.heading('Aarav\n&\nRhea', { fontSize: '84px', lineHeight: '1.0', fontWeight: '500', textAlign: 'center', fontStyle: 'italic', maxWidth: '10ch' }, 'h1'),
        k.text('Together with our families, we invite you to celebrate our wedding — 14 December 2026, Udaipur.', { fontSize: '18px', textAlign: 'center', maxWidth: '40ch' }),
        k.button('RSVP now', 'solid'),
        k.image(U('photo-1519741497674-611481863552', 1400), { marginTop: '40px', aspectRatio: '21/9', borderRadius: '18px' }),
      ], { alignItems: 'center', gap: '20px' }),
    ], { paddingTop: '88px', paddingBottom: '64px' }),
    splitShowcase(k, U('photo-1522673607200-164d1b6ce486'), 'Left', 'Our story', 'How we met', 'What began as a chance meeting at a friend’s rooftop dinner became five years of adventures, inside jokes and a love we can’t wait to celebrate with you.', ['First date: a rainy café in 2021', 'Engaged in the mountains, 2025', 'Forever starts this December']),
    k.section([
      k.container([
        k.heading('The celebration', { fontSize: '40px', textAlign: 'center' }),
        k.stack([
          scheduleRow(k, '4 PM', 'Mehndi & music', 'Garden Lawn'),
          scheduleRow(k, '7 PM', 'Sangeet night', 'The Grand Ballroom'),
          scheduleRow(k, '11 AM', 'Wedding ceremony', 'Lakeside Pavilion'),
          scheduleRow(k, '8 PM', 'Reception & dinner', 'Terrace Rooftop'),
        ], { gap: '0px', marginTop: '10px' }),
      ], { gap: '18px', maxWidth: '780px' }),
    ], { backgroundColor: p.surface }),
    k.section([
      k.container([
        centered(k, 'Moments', 'A few of our favourites', 'More memories to come — with you in them.'),
        k.columns([
          k.image(U('photo-1465495976277-4387d4b0b4c6'), { aspectRatio: '3/4', borderRadius: '12px' }),
          k.image(U('photo-1511285560929-80b456fea0bc'), { aspectRatio: '3/4', borderRadius: '12px', marginTop: '30px' }),
          k.image(U('photo-1519225421980-715cb0215aed'), { aspectRatio: '3/4', borderRadius: '12px' }),
        ], 3, '18px'),
      ], { gap: '48px' }),
    ]),
    k.section([
      k.container([
        k.heading('Will you join us?', { fontSize: '46px', color: '#fff', textAlign: 'center' }),
        k.text('Kindly reply before 1 November 2026.', { fontSize: '18px', color: hexA('#ffffff', 0.85), textAlign: 'center' }),
        k.button('RSVP', 'light', { backgroundColor: '#fff', color: p.brand, borderColor: 'transparent' }),
      ], { alignItems: 'center', gap: '20px' }),
    ], { background: `linear-gradient(135deg, ${p.brand}, ${p.brand2})` }),
    footer(k, 'Aarav & Rhea', { minimal: true }),
  ])
}

/* ---- extra card helpers for templates 13–16 ---- */

function courseCard(k: K, img: string, tag: string, title: string, meta: string): Node {
  const p = k.p
  return k.card([
    k.image(img, { aspectRatio: '16/10', borderRadius: '12px' }),
    k.text(tag.toUpperCase(), { fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', color: p.brand }),
    k.heading(title, { fontSize: '19px', fontWeight: '700' }, 'h3'),
    k.text(meta, { fontSize: '13px', color: p.muted }),
  ], { gap: '10px', padding: '16px' })
}

function destCard(k: K, img: string, name: string, meta: string): Node {
  const p = k.p
  return makeNode(
    'container',
    {},
    { position: 'relative', width: '100%', borderRadius: '18px', overflow: 'hidden', display: 'flex', minHeight: '300px' },
    [
      k.image(img, { position: 'absolute', inset: '0', width: '100%', height: '100%', borderRadius: '0px' }),
      makeNode('container', {}, { position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '2px', width: '100%', padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)' }, [
        k.heading(name, { fontSize: '22px', fontWeight: '700', color: '#fff' }, 'h4'),
        k.text(meta, { fontSize: '14px', color: 'rgba(255,255,255,0.85)' }),
      ]),
    ],
  )
}

/* ================================================================== */
/*  17 — LUMEN  ·  AI platform (dark, glow)                            */
/* ================================================================== */

const lumenPalette: Palette = {
  brand: '#7c5cff', brand2: '#22d3ee', ink: '#f4f3ff', muted: '#9d99c4',
  bg: '#0a0912', surface: '#131126', line: '#241f42', dark: '#070610',
  onDark: '#f4f3ff', onDarkMuted: '#9d99c4', fontHead: SPACE, fontBody: INTER, radius: 16,
}

function lumen(): Node {
  const k = kit(lumenPalette)
  const p = lumenPalette
  return k.page([
    darkNav(k, 'Lumen', ['Platform', 'Models', 'Pricing', 'Docs']),
    k.section([
      k.container([
        k.eyebrow('Now with frontier-grade reasoning'),
        k.resp(
          k.heading('Build with AI that\nactually understands.', {
            fontSize: '68px', lineHeight: '1.02', letterSpacing: '-0.035em', maxWidth: '16ch', textAlign: 'center', color: p.ink,
          }, 'h1'),
          undefined, { fontSize: '38px', lineHeight: '1.06' },
        ),
        k.text('Lumen turns your data into a reasoning engine — grounded, fast and private. Ship agents and copilots your users can actually trust.', {
          fontSize: '19px', textAlign: 'center', maxWidth: '54ch', color: p.muted,
        }),
        k.row([k.button('Start building'), k.button('Talk to sales', 'ghost', { borderColor: p.line, color: p.ink })], { width: 'fit-content', gap: '14px', marginTop: '6px' }),
        k.image(U('photo-1620712943543-bcc4688e7485'), { marginTop: '54px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid', borderColor: p.line, boxShadow: `0 60px 120px -40px ${hexA(p.brand, 0.55)}` }),
      ], { alignItems: 'center', textAlign: 'center', gap: '22px' }),
    ], {
      paddingTop: '116px', paddingBottom: '96px',
      background: `radial-gradient(900px 460px at 50% -8%, ${hexA(p.brand, 0.28)}, transparent 70%), radial-gradient(700px 400px at 85% 12%, ${hexA(p.brand2, 0.14)}, transparent 60%), ${p.bg}`,
    }),
    logoCloud(k, 'Trusted by teams shipping AI'),
    k.section([
      k.container([
        centered(k, 'Platform', 'Everything you need to ship AI', 'From retrieval to evaluation — one platform, no glue code.'),
        k.columns([
          featureCard(k, 'cpu', 'Grounded reasoning', 'Answers from your data with citations, not hallucinations.'),
          featureCard(k, 'zap', 'Sub-second latency', 'Streaming responses on a globally distributed inference layer.'),
          featureCard(k, 'shield', 'Private by default', 'Your data never trains shared models. SOC 2 and HIPAA ready.'),
          featureCard(k, 'layers', 'Agent workflows', 'Compose tools, memory and guardrails in a visual builder.'),
          featureCard(k, 'chart', 'Built-in evals', 'Catch regressions before users do with automatic scoring.'),
          featureCard(k, 'cloud', '100+ integrations', 'Connect Slack, Notion, Postgres, S3 and everything between.'),
        ], 3, '20px'),
      ], { gap: '52px' }),
    ]),
    splitShowcase(k, U('photo-1517245386807-bb43f82c33c4'), 'Right', 'Retrieval', 'Answers grounded in your knowledge', 'Point Lumen at your docs, tickets and databases. It indexes, chunks and retrieves the right context automatically — so every answer is accurate and cited.', ['Hybrid semantic + keyword search', 'Automatic re-indexing', 'Row-level access control']),
    k.section([
      k.container([
        k.columns([stat(k, '99.99%', 'Uptime SLA', true), stat(k, '120ms', 'Median latency', true), stat(k, '4B+', 'Tokens / day', true), stat(k, 'SOC 2', 'Type II certified', true)], 4, '24px'),
      ]),
    ], { backgroundColor: p.dark }),
    testimonial(k, U('photo-1500648767791-00dcc994a43e'), '“Lumen replaced three tools and a month of glue code. Our copilot shipped in a week.”', 'Priya Nair', 'Head of AI, Northwind', { dark: true }),
    pricing(k),
    ctaGradient(k, 'Put AI to work today', 'Free to start. Scale when you’re ready.'),
    footer(k, 'Lumen'),
  ])
}

/* ================================================================== */
/*  18 — ATELIER  ·  luxury fashion (editorial serif)                  */
/* ================================================================== */

const atelierPalette: Palette = {
  brand: '#a8743a', brand2: '#8a5a2b', ink: '#1b1712', muted: '#6d6357',
  bg: '#f6f1e9', surface: '#ffffff', line: '#e6ddcd', dark: '#1b1712',
  onDark: '#f6f1e9', onDarkMuted: '#bcb2a1', fontHead: PLAYFAIR, fontBody: DMSANS, radius: 4,
}

function atelier(): Node {
  const k = kit(atelierPalette)
  const p = atelierPalette
  const piece = (img: string, name: string, price: string) =>
    k.stack([
      k.image(img, { aspectRatio: '3/4', borderRadius: '2px' }),
      k.row([k.heading(name, { fontSize: '18px', fontWeight: '500' }, 'h4'), k.text(price, { fontSize: '15px', color: p.ink })], { justifyContent: 'space-between' }),
    ], { gap: '12px' })
  return k.page([
    navbar(k, 'Atelier', ['Collections', 'Atelier', 'Journal', 'Stores'], { border: false }),
    k.section([
      k.container([
        k.split(
          k.stack([
            k.eyebrow('Autumn / Winter 2026'),
            k.resp(
              k.heading('Quiet luxury,\nmade to last.', { fontSize: '58px', lineHeight: '1.05', fontWeight: '600', letterSpacing: '-0.01em' }, 'h1'),
              undefined, { fontSize: '40px' },
            ),
            k.text('A considered wardrobe of timeless pieces, cut from natural fibres in our Florence atelier.', { fontSize: '18px', maxWidth: '40ch' }),
            k.row([k.button('Shop the collection'), k.button('Our story', 'ghost')], { width: 'fit-content', gap: '14px', marginTop: '8px' }),
          ], { gap: '20px', flex: '1', width: 'auto' }),
          k.image(U('photo-1483985988355-763728e1935b'), { flex: '1', width: 'auto', aspectRatio: '4/5', borderRadius: '3px' }),
        ),
      ]),
    ], { paddingTop: '72px', paddingBottom: '96px' }),
    k.section([
      k.container([
        k.row([k.heading('The edit', { fontSize: '34px', fontWeight: '600' }), k.link('View all →', { color: p.brand, width: 'fit-content' })], { justifyContent: 'space-between' }),
        k.columns([
          piece(U('photo-1490481651871-ab68de25d43d'), 'Cashmere coat', '$890'),
          piece(U('photo-1539109136881-3be0616acf4b'), 'Silk blouse', '$320'),
          piece(U('photo-1594633312681-425c7b97ccd1'), 'Wool trousers', '$280'),
          piece(U('photo-1483118714900-540cf339fd46'), 'Leather bag', '$540'),
        ], 4, '24px'),
      ], { gap: '40px' }),
    ], { backgroundColor: p.surface }),
    splitShowcase(k, U('photo-1441984904996-e0b6ba687e04'), 'Left', 'The atelier', 'Made by hand, in Florence', 'Every garment is cut and finished by artisans we’ve worked with for decades. We produce in small runs, never in excess — because the most sustainable piece is the one you keep for life.', ['Natural, traceable fibres', 'Small-batch production', 'Repairs for life']),
    testimonial(k, U('photo-1438761681033-6461ffad8d80'), '“The finest pieces I own. Understated, impeccably made, and better with every wear.”', 'Camille Laurent', 'Vogue Paris'),
    ctaSimple(k, 'Join the atelier', 'Early access to new collections and private events.', 'Subscribe'),
    darkFooter(k, 'Atelier', ['Collections', 'Journal', 'Stores', 'Contact']),
  ])
}

/* ================================================================== */
/*  19 — COBALT  ·  enterprise analytics SaaS                          */
/* ================================================================== */

const cobaltPalette: Palette = {
  brand: '#1d4ed8', brand2: '#3b82f6', ink: '#0a1531', muted: '#4c5a79',
  bg: '#ffffff', surface: '#f4f7ff', line: '#e2eafc', dark: '#0a1531',
  onDark: '#eef3ff', onDarkMuted: '#93a4c4', fontHead: MANROPE, fontBody: INTER, radius: 14,
}

function cobalt(): Node {
  const k = kit(cobaltPalette)
  const p = cobaltPalette
  return k.page([
    navbar(k, 'Cobalt', ['Platform', 'Solutions', 'Customers', 'Pricing']),
    k.section([
      k.container([
        k.split(
          k.stack([
            k.eyebrow('Analytics for modern teams'),
            k.resp(
              k.heading('Every metric that\nmoves your business.', { fontSize: '56px', lineHeight: '1.05', letterSpacing: '-0.03em' }, 'h1'),
              undefined, { fontSize: '36px' },
            ),
            k.text('Cobalt unifies product, revenue and marketing data into dashboards your whole company can trust — no SQL required.', { fontSize: '18px', maxWidth: '46ch' }),
            k.row([k.button('Start free'), k.button('Book a demo', 'ghost')], { width: 'fit-content', gap: '14px', marginTop: '6px' }),
            k.text('SOC 2 Type II · GDPR · 99.99% uptime', { fontSize: '13px', color: p.muted, marginTop: '2px' }),
          ], { gap: '18px', flex: '1', width: 'auto' }),
          k.image(U('photo-1551288049-bebda4e38f71'), { flex: '1', width: 'auto', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', borderColor: p.line, boxShadow: '0 40px 80px -40px rgba(29,78,216,0.4)' }),
        ),
      ]),
    ], { background: `radial-gradient(1000px 420px at 82% -10%, ${hexA(p.brand, 0.1)}, transparent), #ffffff`, paddingTop: '92px', paddingBottom: '80px' }),
    logoCloud(k, 'Powering data teams at'),
    k.section([k.container([k.columns([stat(k, '10x', 'Faster reporting', true), stat(k, '250+', 'Data sources', true), stat(k, '$2.4B', 'Revenue tracked', true), stat(k, '4.9/5', 'G2 rating', true)], 4, '24px')])], { backgroundColor: p.dark }),
    k.section([
      k.container([
        centered(k, 'Platform', 'One source of truth', 'Connect your stack in minutes and let everyone self-serve.'),
        k.columns([
          featureCard(k, 'gauge', 'Real-time dashboards', 'Live metrics that refresh the moment your data changes.'),
          featureCard(k, 'layers', 'Unified modeling', 'Define a metric once and reuse it across every report.'),
          featureCard(k, 'users', 'Self-serve for all', 'Non-technical teammates explore data without writing SQL.'),
          featureCard(k, 'shield', 'Governed & secure', 'Row-level permissions, audit logs and SSO out of the box.'),
          featureCard(k, 'chart', 'Forecasting', 'Project revenue and churn with built-in predictive models.'),
          featureCard(k, 'globe', 'Warehouse-native', 'Runs on Snowflake, BigQuery and Redshift — data stays put.'),
        ], 3, '20px'),
      ], { gap: '52px' }),
    ]),
    splitShowcase(k, U('photo-1460925895917-afdab827c52f'), 'Right', 'Insights', 'From dashboard to decision', 'Set goals, get alerted on anomalies and share annotated insights — so your team acts on data instead of arguing about it.', ['Anomaly detection', 'Slack & email alerts', 'Shareable insight boards']),
    pricing(k),
    testimonial(k, U('photo-1472099645785-5658abf4ff4e'), '“Cobalt paid for itself in a quarter. Every team now starts the week in the same dashboard.”', 'Marcus Webb', 'VP Growth, Fintechly'),
    ctaGradient(k, 'See your data in Cobalt', 'Connect a source and get your first dashboard in 10 minutes.'),
    footer(k, 'Cobalt'),
  ])
}

/* ================================================================== */
/*  20 — HALO  ·  personal brand / creator                             */
/* ================================================================== */

const haloPalette: Palette = {
  brand: '#e8623d', brand2: '#f59e0b', ink: '#241a15', muted: '#736459',
  bg: '#fdf8f3', surface: '#ffffff', line: '#f0e6da', dark: '#241a15',
  onDark: '#fdf8f3', onDarkMuted: '#c2b3a5', fontHead: SORA, fontBody: INTER, radius: 20,
}

function halo(): Node {
  const k = kit(haloPalette)
  const p = haloPalette
  return k.page([
    navbar(k, 'Maya Rivers', ['About', 'Coaching', 'Podcast', 'Journal'], { border: false }),
    k.section([
      k.container([
        k.split(
          k.stack([
            k.eyebrow('1:1 coaching · now enrolling'),
            k.resp(
              k.heading('Do the work that\nfeels like you.', { fontSize: '56px', lineHeight: '1.04', letterSpacing: '-0.02em' }, 'h1'),
              undefined, { fontSize: '38px' },
            ),
            k.text('I help ambitious creatives build calm, sustainable careers — without burning out. Part strategy, part permission slip.', { fontSize: '18px', maxWidth: '44ch' }),
            k.row([k.button('Work with me'), k.button('Listen to the podcast', 'ghost')], { width: 'fit-content', gap: '14px', marginTop: '6px' }),
          ], { gap: '18px', flex: '1', width: 'auto' }),
          k.image(U('photo-1494790108377-be9c29b29330'), { flex: '1', width: 'auto', aspectRatio: '1/1', borderRadius: '28px' }),
        ),
      ]),
    ], { paddingTop: '80px', paddingBottom: '88px' }),
    k.section([
      k.container([
        centered(k, 'How I help', 'Three ways to work together', 'Wherever you are, there’s a way in.'),
        k.columns([
          featureCard(k, 'heart', '1:1 coaching', 'Twelve weeks of focused, personal sessions to get unstuck and moving.'),
          featureCard(k, 'users', 'Group program', 'A small cohort of creatives building in public, together.'),
          featureCard(k, 'sparkles', 'The workshop', 'A self-paced course on designing a career that lasts.'),
        ], 3, '20px'),
      ], { gap: '48px' }),
    ], { backgroundColor: p.surface }),
    splitShowcase(k, U('photo-1522075469751-3a6694fb2f61'), 'Left', 'The podcast', 'Honest conversations on the creative life', 'Every week I sit down with makers, founders and artists to talk about the messy middle — the part no one posts about. Over 2 million downloads and counting.', ['New episodes every Tuesday', 'Ad-free for members', 'Full transcripts']),
    testimonial(k, U('photo-1531123897727-8f129e1688ce'), '“Maya helped me rebuild my business around my actual life. I’ve never felt more clear.”', 'Devon Clarke', 'Illustrator & member'),
    ctaGradient(k, 'Ready to begin?', 'Enrolment for the next cohort closes soon.'),
    footer(k, 'Maya Rivers', { minimal: true }),
  ])
}

/* ================================================================== */
/*  21 — VERDANT  ·  nonprofit / climate (green, hopeful)              */
/* ================================================================== */

const verdantPalette: Palette = {
  brand: '#15803d', brand2: '#65a30d', ink: '#12241a', muted: '#566b5e',
  bg: '#f5faf3', surface: '#ffffff', line: '#dcebdd', dark: '#12241a',
  onDark: '#eefaef', onDarkMuted: '#9cc0a6', fontHead: SORA, fontBody: MANROPE, radius: 18,
}

function verdant(): Node {
  const k = kit(verdantPalette)
  const p = verdantPalette
  return k.page([
    navbar(k, 'Verdant', ['Mission', 'Programs', 'Stories', 'Donate']),
    // hero
    k.section([
      k.container([
        k.split(
          k.stack([
            k.eyebrow('Climate action, together'),
            k.resp(
              k.heading('A greener planet\nstarts with us.', { fontSize: '60px', lineHeight: '1.03', letterSpacing: '-0.03em' }, 'h1'),
              undefined, { fontSize: '40px' },
            ),
            k.text('Verdant is a community of people restoring forests, cleaning oceans and protecting the wild places we all depend on. Join us — every action counts.', { fontSize: '18px', maxWidth: '46ch' }),
            k.row([k.button('Donate'), k.button('Get involved', 'ghost')], { width: 'fit-content', gap: '14px', marginTop: '6px' }),
          ], { gap: '18px', flex: '1', width: 'auto' }),
          k.image(U('photo-1441974231531-c6227db76b6e'), { flex: '1', width: 'auto', aspectRatio: '4/5', borderRadius: '24px' }),
        ),
      ]),
    ], { paddingTop: '84px', paddingBottom: '80px', background: `radial-gradient(900px 420px at 15% 0%, ${hexA(p.brand, 0.1)}, transparent), ${p.bg}` }),
    // impact stats
    k.section([
      k.container([k.columns([
        stat(k, '2.4M', 'Trees planted', true),
        stat(k, '58', 'Countries', true),
        stat(k, '120k', 'Volunteers', true),
        stat(k, '$18M', 'Raised for the wild', true),
      ])]),
    ], { backgroundColor: p.dark, paddingTop: '72px', paddingBottom: '72px' }),
    // programs
    k.section([
      k.container([
        centered(k, 'Our work', 'Three fronts, one planet', 'We fund and run programs where they make the biggest difference.'),
        k.columns([
          featureCard(k, 'leaf', 'Reforestation', 'Restoring native forests with local communities, one watershed at a time.'),
          featureCard(k, 'globe', 'Clean oceans', 'Removing plastic and protecting marine life across 40 coastlines.'),
          featureCard(k, 'sun', 'Clean energy', 'Bringing solar power to off-grid villages and schools.'),
        ], 3, '20px'),
      ], { gap: '48px' }),
    ], { backgroundColor: p.surface }),
    splitShowcase(k, U('photo-1466611653911-95081537e5b7'), 'Left', 'Our story', 'Started by volunteers, powered by millions', 'What began as a weekend beach cleanup is now a global movement. We keep our overheads tiny so more of every dollar reaches the ground — and we publish exactly where it goes.', ['91¢ of every dollar goes to programs', 'Independently audited each year', 'Local teams in every region']),
    testimonial(k, U('photo-1507003211169-0a1dd7228f2d', 300), 'I gave a few hours a month and watched a barren hillside turn green in two years. Verdant makes you believe change is actually possible.', 'Amara Osei', 'Volunteer since 2021'),
    ctaGradient(k, 'Help us plant the next million', 'Every $1 plants a tree and protects it for a decade.'),
    footer(k, 'Verdant'),
  ])
}

/* ================================================================== */
/*  22 — APERTURE  ·  photography portfolio (minimal, image-forward)   */
/* ================================================================== */

const aperturePalette: Palette = {
  brand: '#171717', brand2: '#404040', ink: '#0a0a0a', muted: '#6b6b6b',
  bg: '#ffffff', surface: '#fafafa', line: '#ebebeb', dark: '#0a0a0a',
  onDark: '#fafafa', onDarkMuted: '#a3a3a3', fontHead: INSTRUMENT, fontBody: DMSANS, radius: 4,
}

function aperture(): Node {
  const k = kit(aperturePalette)
  const p = aperturePalette
  return k.page([
    navbar(k, 'Aperture', ['Work', 'About', 'Journal', 'Contact'], { border: false }),
    // hero
    k.section([
      k.container([
        k.stack([
          k.eyebrow('Photographer · Lisbon & worldwide', { backgroundColor: 'transparent', color: p.muted, paddingLeft: '0', letterSpacing: '0.14em' }),
          k.resp(
            k.heading('Light, patience\nand a little luck.', { fontSize: '72px', lineHeight: '1.02', fontWeight: '500', letterSpacing: '-0.01em', maxWidth: '16ch' }, 'h1'),
            undefined, { fontSize: '44px' },
          ),
          k.text('I photograph people and places with a quiet, documentary eye — for editorials, brands and anyone with a story worth keeping.', { fontSize: '18px', maxWidth: '48ch' }),
        ], { gap: '20px', alignItems: 'center', textAlign: 'center' }),
        k.image(U('photo-1500916434205-0c77489c6cf7', 1600), { aspectRatio: '16/9', borderRadius: '6px', marginTop: '20px' }),
      ], { gap: '32px', alignItems: 'center' }),
    ], { paddingTop: '80px', paddingBottom: '60px' }),
    // gallery
    k.section([
      k.container([
        k.row([k.heading('Selected work', { fontSize: '34px', fontWeight: '500' }), k.link('All series →', { color: p.ink })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          k.image(U('photo-1519741497674-611481863552'), { aspectRatio: '4/5', borderRadius: '4px' }),
          k.image(U('photo-1492691527719-9d1e07e534b4'), { aspectRatio: '4/5', borderRadius: '4px', marginTop: '36px' }),
          k.image(U('photo-1520962880247-cfaf541c8724'), { aspectRatio: '4/5', borderRadius: '4px' }),
        ], 3, '20px'),
      ], { gap: '30px', maxWidth: '1240px' }),
    ], { paddingTop: '30px', paddingBottom: '80px' }),
    splitShowcase(k, U('photo-1554048612-b6a482bc67e5'), 'Right', 'About', 'Fifteen years behind the lens', 'From weddings in the hills to campaigns for global brands, I chase the same thing every time — a real moment, honestly seen. No stiff poses, no artificial light unless the story asks for it.', ['Editorial & commercial', 'Featured in Kinfolk & Cereal', 'Shooting on film and digital']),
    testimonial(k, U('photo-1544005313-94ddf0286df2', 300), 'The photographs didn’t just document our day — they remembered it better than we did. Every frame feels like the moment it was.', 'Noah & Priya', 'Wedding clients'),
    ctaSimple(k, 'Let’s create something', 'Available for commissions worldwide — tell me about your project.', 'Get in touch'),
    footer(k, 'Aperture', { minimal: true }),
  ])
}

/* ================================================================== */
/*  23 — CADENCE  ·  podcast / audio show (dark, vibrant)              */
/* ================================================================== */

const cadencePalette: Palette = {
  brand: '#a855f7', brand2: '#ec4899', ink: '#f4f1fb', muted: '#a79fc0',
  bg: '#0e0b1a', surface: '#171332', line: '#2a2450', dark: '#0e0b1a',
  onDark: '#f4f1fb', onDarkMuted: '#a79fc0', fontHead: SPACE, fontBody: INTER, radius: 18,
}

function cadence(): Node {
  const k = kit(cadencePalette)
  const p = cadencePalette
  const episode = (img: string, num: string, title: string) =>
    k.stack([
      k.image(img, { aspectRatio: '1/1', borderRadius: '16px' }),
      k.text(num, { fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', color: p.brand }),
      k.heading(title, { fontSize: '19px', fontWeight: '600', color: p.ink }, 'h3'),
      k.row([k.icon('play', p.brand, 16), k.text('Listen · 48 min', { fontSize: '13px', color: p.muted, width: 'fit-content' })], { width: 'fit-content', gap: '8px' }),
    ], { gap: '10px' })
  return k.page([
    darkNav(k, 'Cadence', ['Episodes', 'Guests', 'About', 'Subscribe']),
    // hero
    k.section([
      k.container([
        k.eyebrow('New episode every Thursday', { backgroundColor: hexA(p.brand, 0.16), color: p.brand }),
        k.resp(
          k.heading('Conversations\nthat resonate.', { fontSize: '68px', lineHeight: '1.02', letterSpacing: '-0.03em', color: p.ink, textAlign: 'center' }, 'h1'),
          undefined, { fontSize: '42px' },
        ),
        k.text('Cadence is a weekly show about creativity, technology and the people building the future — one honest conversation at a time.', { fontSize: '19px', textAlign: 'center', maxWidth: '52ch', color: p.muted }),
        k.row([k.button('Listen now'), k.button('Subscribe', 'light')], { width: 'fit-content', gap: '14px', marginTop: '4px' }),
        k.row(['Spotify', 'Apple Podcasts', 'YouTube', 'RSS'].map((n) => k.text(n, { fontSize: '14px', fontWeight: '600', color: hexA(p.ink, 0.4), width: 'fit-content' })), { width: 'fit-content', gap: '26px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }),
      ], { alignItems: 'center', gap: '22px' }),
    ], { paddingTop: '104px', paddingBottom: '80px', background: `radial-gradient(900px 460px at 50% -10%, ${hexA(p.brand, 0.22)}, transparent), ${p.bg}` }),
    // latest episodes
    k.section([
      k.container([
        k.row([k.heading('Latest episodes', { fontSize: '34px', color: p.ink }), k.link('All episodes →', { color: p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          episode(U('photo-1478737270239-2f02b77fc618'), 'EP. 84', 'Designing for trust in an AI world'),
          episode(U('photo-1590602847861-f357a9332bbc'), 'EP. 83', 'The quiet power of small teams'),
          episode(U('photo-1516280440614-37939bbacd81'), 'EP. 82', 'How great ideas actually travel'),
        ], 3, '26px'),
      ], { gap: '34px' }),
    ], { backgroundColor: p.surface }),
    // stats
    k.section([
      k.container([k.columns([stat(k, '3.2M', 'Monthly listens', true), stat(k, '84', 'Episodes', true), stat(k, '4.9★', 'Apple rating', true), stat(k, '120+', 'Countries', true)])]),
    ], { paddingTop: '70px', paddingBottom: '70px' }),
    splitShowcase(k, U('photo-1589903308904-1010c2294adc'), 'Left', 'Your host', 'Hi, I’m Sam — I ask the questions', 'For six years I’ve sat down with founders, artists and scientists to get past the highlight reel and into how the work really happens. No fluff, no hard sells — just curiosity.', ['Unedited, long-form talks', 'Guest picks & show notes', 'Ad-free for members']),
    testimonial(k, U('photo-1544005313-94ddf0286df2', 300), 'The only podcast I never skip. It’s like eavesdropping on the smartest, kindest dinner party every week.', 'Jordan Lee', 'Member since day one', { dark: true }),
    ctaGradient(k, 'Never miss an episode', 'Subscribe wherever you listen — or join as a member for bonus episodes.'),
    darkFooter(k, 'Cadence', ['Episodes', 'Guests', 'Subscribe', 'Contact']),
  ])
}

/* ================================================================== */
/*  24 — MONARCH  ·  architecture / interior studio (minimal, serif)   */
/* ================================================================== */

const monarchPalette: Palette = {
  brand: '#9a7b4f', brand2: '#6b5636', ink: '#1c1a17', muted: '#7a746c',
  bg: '#faf9f6', surface: '#ffffff', line: '#e9e5dd', dark: '#1c1a17',
  onDark: '#faf9f6', onDarkMuted: '#b3ac9f', fontHead: PLAYFAIR, fontBody: INTER, radius: 2,
}

function monarch(): Node {
  const k = kit(monarchPalette)
  const p = monarchPalette
  return k.page([
    navbar(k, 'Monarch', ['Projects', 'Studio', 'Journal', 'Contact'], { border: false }),
    // hero
    k.section([
      k.container([
        k.stack([
          k.eyebrow('Architecture & interiors · est. 2004', { backgroundColor: 'transparent', color: p.brand, paddingLeft: '0', letterSpacing: '0.16em' }),
          k.resp(
            k.heading('Spaces that\nhold the light.', { fontSize: '74px', lineHeight: '1.02', fontWeight: '500', letterSpacing: '-0.01em', maxWidth: '16ch' }, 'h1'),
            undefined, { fontSize: '44px' },
          ),
          k.text('Monarch is a design studio crafting calm, enduring architecture — homes, workspaces and cultural spaces built around how people actually live.', { fontSize: '18px', maxWidth: '50ch' }),
        ], { gap: '20px', alignItems: 'center', textAlign: 'center' }),
        k.image(U('photo-1487958449943-2429e8be8625', 1600), { aspectRatio: '16/8', borderRadius: '4px', marginTop: '18px' }),
      ], { gap: '30px', alignItems: 'center' }),
    ], { paddingTop: '78px', paddingBottom: '56px' }),
    // projects
    k.section([
      k.container([
        k.row([k.heading('Selected projects', { fontSize: '34px', fontWeight: '500' }), k.link('All projects →', { color: p.brand })], { justifyContent: 'space-between', alignItems: 'baseline' }),
        k.columns([
          projectCard(k, U('photo-1600585154340-be6161a56a0c'), 'Residential', 'Hillside House, Ojai'),
          projectCard(k, U('photo-1600607687939-ce8a6c25118c'), 'Workspace', 'The Foundry, Lisbon'),
          projectCard(k, U('photo-1600566753086-00f18fb6b3ea'), 'Cultural', 'Riverside Pavilion'),
          projectCard(k, U('photo-1600210492486-724fe5c67fb0'), 'Interior', 'Warm Minimal Loft'),
        ], 2, '30px'),
      ], { gap: '34px' }),
    ], { backgroundColor: p.surface }),
    splitShowcase(k, U('photo-1503387762-592deb58ef4e'), 'Left', 'The studio', 'Restraint, light and honest materials', 'We believe good architecture disappears into daily life. Every project starts with the site and the people — then we remove everything that isn’t essential.', ['RIBA & AIA award-winning', 'End-to-end: concept to build', 'Sustainable by default']),
    k.section([
      k.container([k.columns([stat(k, '120+', 'Projects delivered', true), stat(k, '20', 'Years of practice', true), stat(k, '14', 'Design awards', true), stat(k, '9', 'Countries', true)])]),
    ], { backgroundColor: p.dark, paddingTop: '72px', paddingBottom: '72px' }),
    testimonial(k, U('photo-1507003211169-0a1dd7228f2d', 300), 'They listened for months before drawing a single line. The house they gave us feels less designed than inevitable.', 'The Almeida Family', 'Hillside House'),
    ctaSimple(k, 'Have a project in mind?', 'We take on a handful of new commissions each year. Tell us about yours.', 'Start a project'),
    footer(k, 'Monarch'),
  ])
}

/* ================================================================== */

/* ================================================================== */
/*  MULTI-PAGE ENGINE                                                   */
/*  Every template becomes a real site: a page behind every nav link,   */
/*  sharing the home page's exact navbar + footer, with live links.     */
/* ================================================================== */

function slug(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page'
}

/** Rewrite every link/button whose label names a page so it navigates there. */
function wireNavLinks(root: Node, routes: Record<string, string>): void {
  const visit = (n: Node) => {
    if ((n.type === 'link' || n.type === 'button') && typeof n.props?.label === 'string') {
      const hit = routes[slug(n.props.label)]
      if (hit) n.props.href = hit
    }
    n.children?.forEach(visit)
  }
  visit(root)
}

/** A centered page header used at the top of every companion page. */
function pageHero(k: K, eyebrow: string, title: string, sub: string): Node {
  const p = k.p
  return k.section(
    [
      k.container(
        [
          k.eyebrow(eyebrow),
          k.heading(title, { fontSize: '54px', lineHeight: '1.05', maxWidth: '18ch', textAlign: 'center' }, 'h1'),
          k.text(sub, { fontSize: '19px', textAlign: 'center', maxWidth: '56ch' }),
        ],
        { alignItems: 'center', textAlign: 'center', gap: '18px' },
      ),
    ],
    { paddingTop: '96px', paddingBottom: '30px', background: `radial-gradient(1000px 460px at 50% 0%, ${hexA(p.brand, 0.09)}, transparent), ${p.bg}` },
  )
}

function valuesSection(k: K): Node {
  return k.section([
    k.container([
      centered(k, 'What drives us', 'Principles we build on', 'A few beliefs that shape every decision we make.'),
      k.columns([
        featureCard(k, 'compass', 'Clarity first', 'We strip away the noise so the work that matters is always obvious.'),
        featureCard(k, 'heart', 'Craft over speed', 'Details aren’t details — they are the product. We sweat every one.'),
        featureCard(k, 'users', 'People, always', 'The best tools disappear and let people do their finest work.'),
      ], 3, '22px'),
    ], { gap: '52px' }),
  ])
}

function faqSection(k: K): Node {
  const qa = (q: string, a: string) =>
    k.card([k.heading(q, { fontSize: '18px', fontWeight: '700' }, 'h3'), k.text(a, { fontSize: '15px' })], { gap: '10px' })
  return k.section([
    k.container([
      centered(k, 'FAQ', 'Questions, answered', 'Everything you need to know before getting started.'),
      k.columns([
        qa('Is there a free plan?', 'Yes — start free with no credit card, and upgrade only when you’re ready.'),
        qa('Can I cancel anytime?', 'Absolutely. Plans are month-to-month and cancel in a single click.'),
        qa('Do you offer support?', 'Every plan includes support, with priority response on Pro and Team.'),
        qa('Can I switch plans later?', 'Change plans whenever you like — upgrades and downgrades are instant.'),
      ], 2, '20px'),
    ], { gap: '48px' }),
  ])
}

function statsBand(k: K, items: [string, string][]): Node {
  const p = k.p
  return k.section([k.container([k.columns(items.map(([b, l]) => stat(k, b, l, true)))])], {
    backgroundColor: p.dark, paddingTop: '74px', paddingBottom: '74px',
  })
}

function field(k: K, placeholder: string, type: string, name: string): Node {
  const p = k.p
  return makeNode('input', { placeholder, inputType: type, name }, {
    width: '100%', paddingTop: '13px', paddingBottom: '13px', paddingLeft: '16px', paddingRight: '16px',
    fontSize: '15px', color: p.ink, backgroundColor: p.bg === p.surface ? '#ffffff' : p.surface,
    borderWidth: '1px', borderStyle: 'solid', borderColor: p.line, borderRadius: `${Math.min(p.radius, 12)}px`,
    fontFamily: p.fontBody, outline: 'none',
  })
}

function detailRow(k: K, icon: string, label: string, value: string): Node {
  const p = k.p
  return k.row([
    k.iconBadge(icon),
    k.stack([
      k.text(label, { fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: p.muted }),
      k.heading(value, { fontSize: '18px', fontWeight: '600' }, 'h4'),
    ], { gap: '2px', width: 'auto' }),
  ], { justifyContent: 'flex-start', gap: '16px' })
}

const B = {
  work: U('photo-1522071820081-009f0129c71c'),
  office: U('photo-1497366216548-37526070297c'),
  a1: U('photo-1467232004584-a241de8bcf5d'),
  a2: U('photo-1519389950473-47ba0277781c'),
  a3: U('photo-1451187580459-43490279c0fa'),
  a4: U('photo-1499750310107-5fef28a66643'),
  a5: U('photo-1504384308090-c894fdcc538d'),
  a6: U('photo-1526304640581-d334cdbbf45e'),
  g1: U('photo-1618005182384-a83a8bd57fbe'),
  g2: U('photo-1620121692029-d088224ddc74'),
  g3: U('photo-1558655146-9f40138edfeb'),
  g4: U('photo-1611224885990-ab7363d1f2a9'),
  g5: U('photo-1512941937669-90a1b58e7e9c'),
  g6: U('photo-1517245386807-bb43f82c33c4'),
  show1: U('photo-1531403009284-440f080d1e12'),
  show2: U('photo-1551288049-bebda4e38f71'),
}

/* ---- companion page bodies (return full section list, incl. hero) ---- */

function pricingBody(k: K): Node[] {
  return [
    pageHero(k, 'Pricing', 'Simple, honest pricing', 'Start free and upgrade only when it pays for itself. No hidden fees, ever.'),
    pricing(k),
    faqSection(k),
    ctaGradient(k, 'Ready when you are', 'Join thousands of teams already building with us.'),
  ]
}

function aboutBody(k: K, brand: string): Node[] {
  return [
    pageHero(k, 'About', `The story behind ${brand}`, `We’re a small team with an outsized obsession: making ${brand} feel effortless.`),
    splitShowcase(k, B.work, 'Right', 'Our story', 'Built by people who cared', 'What began as a side project grew into a product used by teams around the world — but the mission never changed: do fewer things, exceptionally well.', ['Founded by a team of three', 'Backed by mission-aligned investors', 'Trusted in 40+ countries']),
    valuesSection(k),
    statsBand(k, [['2019', 'Founded'], ['40+', 'Countries'], ['20k+', 'Customers'], ['4.9/5', 'Rating']]),
    ctaGradient(k, 'Come build with us', 'We’re always looking for people who care about craft.'),
  ]
}

function contactBody(k: K, brand: string, title: string): Node[] {
  const submit = k.button('Send message', 'solid', { width: '100%', marginTop: '4px' })
  submit.props.submit = true
  const form = makeNode('form', { name: `${brand} contact`, success: 'Thanks! We’ll be in touch shortly.', method: 'post' }, {
    display: 'flex', flexDirection: 'column', gap: '14px', width: '100%',
  }, [field(k, 'Full name', 'text', 'name'), field(k, 'you@email.com', 'email', 'email'), textareaField(k), submit])
  return [
    pageHero(k, title, 'We’d love to hear from you', `Questions, partnerships, or just a hello — reach the ${brand} team and we’ll reply within a day.`),
    k.section([
      k.container([
        k.split(
          k.card([k.heading('Send a message', { fontSize: '22px', fontWeight: '700' }, 'h3'), form], { gap: '18px' }),
          k.stack([
            detailRow(k, 'mail', 'Email', `hello@${slug(brand)}.com`),
            detailRow(k, 'phone', 'Phone', '+1 (555) 012-3456'),
            detailRow(k, 'pin', 'Studio', '221B Craft Street · Remote-first'),
            detailRow(k, 'clock', 'Hours', 'Mon–Fri · 9am–6pm'),
          ], { gap: '24px', width: 'auto' }),
          { alignItems: 'flex-start', gap: '48px' },
        ),
      ]),
    ], { paddingTop: '20px' }),
  ]
}

function textareaField(k: K): Node {
  const p = k.p
  return makeNode('textarea', { placeholder: 'How can we help?', name: 'message' }, {
    width: '100%', minHeight: '130px', paddingTop: '13px', paddingBottom: '13px', paddingLeft: '16px', paddingRight: '16px',
    fontSize: '15px', color: p.ink, backgroundColor: p.bg === p.surface ? '#ffffff' : p.surface,
    borderWidth: '1px', borderStyle: 'solid', borderColor: p.line, borderRadius: `${Math.min(p.radius, 12)}px`,
    fontFamily: p.fontBody, outline: 'none', resize: 'vertical',
  })
}

function articlesBody(k: K, brand: string, title: string): Node[] {
  return [
    pageHero(k, title, `${title} — the latest`, `Ideas, stories and updates from the ${brand} team.`),
    k.section([
      k.container([
        k.columns([
          articleCard(k, B.a1, title, 'Why constraints make better products'),
          articleCard(k, B.a2, title, 'The quiet craft of good defaults'),
          articleCard(k, B.a3, title, 'Lessons from shipping slowly'),
          articleCard(k, B.a4, title, 'Designing for the long term'),
          articleCard(k, B.a5, title, 'What we learned this year'),
          articleCard(k, B.a6, title, 'A field guide to focus'),
        ], 3, '30px'),
      ], { gap: '40px' }),
    ]),
    ctaGradient(k, 'Never miss a story', 'Get our best writing in your inbox, once a week.'),
  ]
}

function galleryBody(k: K, brand: string, title: string): Node[] {
  const imgs = [B.g1, B.g2, B.g3, B.g4, B.g5, B.g6]
  const tags = ['Featured', 'New', 'Popular', 'Editors’ pick', 'Trending', 'Recent']
  return [
    pageHero(k, title, title, `Explore everything ${brand} has to offer.`),
    k.section([
      k.container([
        k.columns(imgs.map((img, i) => projectCard(k, img, tags[i], `${title} · ${String(i + 1).padStart(2, '0')}`)), 3, '28px'),
      ]),
    ]),
    ctaGradient(k, `Discover more from ${brand}`, 'There’s always something new to explore.'),
  ]
}

function featuresBody(k: K, brand: string, title: string): Node[] {
  return [
    pageHero(k, title, `Everything ${brand}, in one place`, `A closer look at what makes ${brand} work — and why teams love it.`),
    k.section([
      k.container([
        centered(k, 'Capabilities', 'Built for real work', 'Powerful primitives that snap together into anything.'),
        k.columns([
          featureCard(k, 'zap', 'Fast by default', 'Everything stays instant, even at scale — no waiting, no loading spinners.'),
          featureCard(k, 'layers', 'Composable', 'Small pieces that combine into exactly the workflow you need.'),
          featureCard(k, 'shield', 'Secure', 'Enterprise-grade security and privacy, on by default from day one.'),
          featureCard(k, 'users', 'Collaborative', 'Real-time by design so your whole team moves as one.'),
          featureCard(k, 'gauge', 'Insightful', 'Turn activity into decisions with dashboards that update live.'),
          featureCard(k, 'globe', 'Global', 'A fast, reliable experience for every user, everywhere.'),
        ], 3, '22px'),
      ], { gap: '52px' }),
    ]),
    splitShowcase(k, B.show1, 'Right', 'How it works', 'Set up in minutes', 'Connect your tools, invite your team, and you’re live. No migration project, no consultants — just value on day one.', ['Guided onboarding', 'One-click integrations', 'Import your existing data']),
    splitShowcase(k, B.show2, 'Left', 'Under the hood', 'Engineered to last', 'Built on a modern, resilient foundation that scales quietly in the background so you never have to think about it.', ['99.99% uptime SLA', 'Automatic backups', 'Transparent status page']),
    statsBand(k, [['20k+', 'Teams'], ['99.99%', 'Uptime'], ['4.9/5', 'Rating'], ['150ms', 'Median response']]),
    ctaGradient(k, `See ${brand} in action`, 'Start free today — no credit card required.'),
  ]
}

/** Pick the right body for a nav label. */
function bodyFor(k: K, brand: string, label: string): Node[] {
  const l = label.toLowerCase()
  if (/pric|plan|ticket|member/.test(l)) return pricingBody(k)
  if (/about|story|studio|company|team|mission/.test(l)) return aboutBody(k, brand)
  if (/contact|reserve|book|rsvp|visit|join|sell|appoint|enquir|donate|volunteer|apply|get.?involved/.test(l)) return contactBody(k, brand, label)
  if (/journal|blog|stories|news|press|culture|science|technolog|design|business|review/.test(l)) return articlesBody(k, brand, label)
  if (/work|project|portfolio|series|album|gallery|collection|destination|tour|menu|shop|class|course|listing|home|model|doctor|coach|mentor|speaker|schedule|detail|agent|rent|buy|patient|podcast|program|impact/.test(l)) return galleryBody(k, brand, label)
  return featuresBody(k, brand, label)
}

/** Build a full multi-page site: home + a page behind every nav link, with the
 *  navbar and footer extracted into shared Header/Footer symbols so editing one
 *  updates every page (Framer/Webflow-style). */
function buildSite(build: () => Node, palette: Palette, brand: string, nav: string[]): SiteBuild {
  const k = kit(palette)
  const home = build()
  const kids = home.children ?? []
  const navSrc = kids[0]
  const footSrc = kids.length > 1 ? kids[kids.length - 1] : null

  // Route table: every nav label → its own path; home → "/".
  const routes: Record<string, string> = { home: '/' }
  const seen = new Set<string>()
  const labels = nav.filter((l) => {
    const s = slug(l)
    if (seen.has(s)) return false
    seen.add(s)
    return true
  })
  for (const l of labels) routes[slug(l)] = '/' + slug(l)

  // Shared symbols — the master trees, with their links wired to real pages.
  const headerId = 'hdr-' + nanoid(6)
  const footerId = 'ftr-' + nanoid(6)
  const components: SiteComponent[] = []
  const headerRoot = cloneNode(navSrc)
  wireNavLinks(headerRoot, routes)
  components.push({ id: headerId, name: 'Header', root: headerRoot })
  if (footSrc) {
    const footerRoot = cloneNode(footSrc)
    wireNavLinks(footerRoot, routes)
    components.push({ id: footerId, name: 'Footer', root: footerRoot })
  }
  const header = () => makeNode('instance', { componentId: headerId, name: 'Header' }, { display: 'block', width: '100%' })
  const footer = () => makeNode('instance', { componentId: footerId, name: 'Footer' }, { display: 'block', width: '100%' })

  const wrap = (body: Node[]): Node[] => {
    body.forEach((n) => wireNavLinks(n, routes)) // in-page CTAs that name a page also route
    const children = [header(), ...body]
    if (footSrc) children.push(footer())
    return children
  }

  // Home keeps its original body; only nav/footer become symbol instances.
  const homeBody = kids.slice(1, footSrc ? kids.length - 1 : kids.length)
  home.children = wrap(homeBody)
  home.props.name = 'Home'
  home.props.seoTitle = home.props.seoTitle ?? brand
  const pages: SitePage[] = [{ name: 'Home', path: '/', root: home }]

  for (const label of labels) {
    const root = k.page(wrap(bodyFor(k, brand, label)))
    root.props.name = label
    root.props.seoTitle = `${label} · ${brand}`
    pages.push({ name: label, path: slug(label), root })
  }
  return { pages, components }
}

interface Spec {
  id: string
  name: string
  category: string
  description: string
  accent: string
  build: () => Node
  palette: Palette
  nav: string[]
}

const SPECS: Spec[] = [
  { id: 'aurora', name: 'Aurora', category: 'SaaS', description: 'A modern software landing page with features, pricing and social proof.', accent: '#6d28d9', build: aurora, palette: auroraPalette, nav: ['Product', 'Solutions', 'Pricing', 'Docs'] },
  { id: 'horizon', name: 'Horizon', category: 'SaaS', description: 'A developer-platform landing page with a bento feature grid.', accent: '#2563eb', build: horizon, palette: horizonPalette, nav: ['Platform', 'Customers', 'Pricing', 'Docs'] },
  { id: 'noir', name: 'Noir', category: 'Agency', description: 'A bold, dark editorial site for a creative studio or agency.', accent: '#e0ff4f', build: noir, palette: noirPalette, nav: ['Work', 'Studio', 'Services', 'Contact'] },
  { id: 'folio', name: 'Folio', category: 'Portfolio', description: 'An elegant serif portfolio for designers, writers and freelancers.', accent: '#b45309', build: folio, palette: folioPalette, nav: ['Work', 'About', 'Journal', 'Contact'] },
  { id: 'pulse', name: 'Pulse', category: 'Mobile app', description: 'A vibrant product page for a fintech or consumer mobile app.', accent: '#0d9488', build: pulse, palette: pulsePalette, nav: ['Features', 'Pricing', 'Reviews'] },
  { id: 'bloom', name: 'Bloom', category: 'E-commerce', description: 'A clean storefront for a beauty, wellness or DTC product brand.', accent: '#db2777', build: bloom, palette: bloomPalette, nav: ['Shop', 'Science', 'Reviews', 'Journal'] },
  { id: 'gazette', name: 'Gazette', category: 'Blog', description: 'An editorial magazine layout with a featured story and article grid.', accent: '#b91c1c', build: gazette, palette: gazettePalette, nav: ['Culture', 'Technology', 'Design', 'Business'] },
  { id: 'saffron', name: 'Saffron', category: 'Restaurant', description: 'A warm restaurant site with menu, story and reservations.', accent: '#b45309', build: saffron, palette: saffronPalette, nav: ['Menu', 'About', 'Gallery', 'Reserve'] },
  { id: 'haven', name: 'Haven', category: 'Real estate', description: 'A property marketplace with search and featured listings.', accent: '#0f766e', build: haven, palette: havenPalette, nav: ['Buy', 'Rent', 'Sell', 'Agents'] },
  { id: 'summit', name: 'Summit', category: 'Event', description: 'A conference site with speakers, schedule and ticket CTA.', accent: '#e11d48', build: summit, palette: summitPalette, nav: ['Speakers', 'Schedule', 'Venue', 'Tickets'] },
  { id: 'forge', name: 'Forge', category: 'Fitness', description: 'A bold, dark gym site with programs, schedule and a free-trial CTA.', accent: '#f97316', build: forge, palette: forgePalette, nav: ['Classes', 'Coaches', 'Pricing', 'Join'] },
  { id: 'ledger', name: 'Ledger', category: 'Fintech', description: 'A sleek dark landing page for a crypto wallet or fintech product.', accent: '#22d3ee', build: ledger, palette: ledgerPalette, nav: ['Product', 'Developers', 'Security', 'Company'] },
  { id: 'mediva', name: 'Mediva', category: 'Medical', description: 'A trustworthy clinic/healthcare site with services and appointments.', accent: '#0369a1', build: mediva, palette: medivaPalette, nav: ['Services', 'Doctors', 'Patients', 'Contact'] },
  { id: 'scholar', name: 'Scholar', category: 'Education', description: 'An online-course platform with courses, pricing and testimonials.', accent: '#4f46e5', build: scholar, palette: scholarPalette, nav: ['Courses', 'Mentors', 'Pricing', 'For teams'] },
  { id: 'wander', name: 'Wander', category: 'Travel', description: 'A vibrant travel/tours site with destinations and big imagery.', accent: '#ea580c', build: wander, palette: wanderPalette, nav: ['Destinations', 'Tours', 'Stories', 'Book'] },
  { id: 'vows', name: 'Vows', category: 'Wedding', description: 'An elegant wedding invitation with story, schedule and RSVP.', accent: '#b08968', build: vows, palette: vowsPalette, nav: ['Story', 'Details', 'Gallery', 'RSVP'] },
  { id: 'lumen', name: 'Lumen', category: 'AI', description: 'A premium dark landing page for an AI platform, with glow, features and pricing.', accent: '#7c5cff', build: lumen, palette: lumenPalette, nav: ['Platform', 'Models', 'Pricing', 'Docs'] },
  { id: 'atelier', name: 'Atelier', category: 'Luxury', description: 'An editorial fashion-house site with a split hero, collection grid and story.', accent: '#a8743a', build: atelier, palette: atelierPalette, nav: ['Collections', 'Atelier', 'Journal', 'Stores'] },
  { id: 'cobalt', name: 'Cobalt', category: 'Enterprise', description: 'A polished B2B analytics SaaS site with dashboards, stats and pricing.', accent: '#1d4ed8', build: cobalt, palette: cobaltPalette, nav: ['Platform', 'Solutions', 'Customers', 'Pricing'] },
  { id: 'halo', name: 'Halo', category: 'Personal', description: 'A warm personal-brand page for a coach, creator or podcaster.', accent: '#e8623d', build: halo, palette: haloPalette, nav: ['About', 'Coaching', 'Podcast', 'Journal'] },
  { id: 'verdant', name: 'Verdant', category: 'Nonprofit', description: 'A hopeful nonprofit/climate site with impact stats, programs and a donate CTA.', accent: '#15803d', build: verdant, palette: verdantPalette, nav: ['Mission', 'Programs', 'Stories', 'Donate'] },
  { id: 'aperture', name: 'Aperture', category: 'Photography', description: 'A minimal, image-forward portfolio for a photographer or visual artist.', accent: '#171717', build: aperture, palette: aperturePalette, nav: ['Work', 'About', 'Journal', 'Contact'] },
  { id: 'cadence', name: 'Cadence', category: 'Podcast', description: 'A vibrant dark podcast site with episodes, host bio and subscribe CTAs.', accent: '#a855f7', build: cadence, palette: cadencePalette, nav: ['Episodes', 'Guests', 'About', 'Subscribe'] },
  { id: 'monarch', name: 'Monarch', category: 'Architecture', description: 'A minimal, elegant studio site for architects and interior designers.', accent: '#9a7b4f', build: monarch, palette: monarchPalette, nav: ['Projects', 'Studio', 'Journal', 'Contact'] },
]

export const TEMPLATES: Template[] = SPECS.map((s) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  description: s.description,
  accent: s.accent,
  build: s.build,
  site: () => buildSite(s.build, s.palette, s.name, s.nav),
}))

