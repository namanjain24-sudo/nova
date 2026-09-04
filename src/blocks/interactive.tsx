import { Code2, ListCollapse, GalleryHorizontal, MessageCircleQuestion } from 'lucide-react'
import { makeNode, registerBlock } from '../core/schema'

/* ------------------------------------------------------------------ */
/*  Embed — iframe URL or raw HTML/embed code                          */
/* ------------------------------------------------------------------ */

registerBlock({
  type: 'embed',
  name: 'Embed',
  category: 'media',
  icon: Code2,
  keywords: ['iframe', 'html', 'code', 'map', 'youtube', 'calendly', 'typeform', 'widget'],
  inspector: ['size', 'spacing', 'border', 'effects'],
  fields: [
    { key: 'url', label: 'Embed URL', type: 'url', placeholder: 'https://… (map, form, video)' },
    { key: 'html', label: 'Or paste embed code', type: 'textarea', placeholder: '<iframe …> or any HTML' },
  ],
  create: () =>
    makeNode(
      'embed',
      { url: 'https://www.google.com/maps?q=Eiffel+Tower&output=embed', html: '' },
      { display: 'block', width: '100%', minHeight: '320px', borderRadius: '16px', overflow: 'hidden' },
    ),
  render: ({ node, style, editMode }) => {
    const html = typeof node.props.html === 'string' ? node.props.html.trim() : ''
    const url = node.props.url as string
    const inner = html ? (
      <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />
    ) : url ? (
      <iframe
        src={url}
        title="Embedded content"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={{ width: '100%', height: '100%', minHeight: 'inherit', border: 'none', display: 'block' }}
      />
    ) : (
      <div style={placeholderStyle}>Add an embed URL or paste code</div>
    )
    return (
      <div style={{ position: 'relative', minHeight: 'inherit', ...style }}>
        {inner}
        {/* Click-shield so selecting the block in the editor doesn't hit the iframe. */}
        {editMode && <div style={{ position: 'absolute', inset: 0 }} />}
      </div>
    )
  },
})

const placeholderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  minHeight: '200px',
  background: 'rgba(148,163,184,0.08)',
  border: '1.5px dashed #cbd5e1',
  borderRadius: '12px',
  color: '#94a3b8',
  fontSize: '13px',
  fontFamily: 'Inter, system-ui, sans-serif',
} as const

/* ------------------------------------------------------------------ */
/*  FAQ — native <details> accordion (zero JS in export)               */
/* ------------------------------------------------------------------ */

registerBlock({
  type: 'faqItem',
  name: 'FAQ item',
  category: 'content',
  icon: MessageCircleQuestion,
  keywords: ['question', 'answer', 'accordion', 'toggle', 'collapse'],
  inspector: ['typography', 'spacing', 'border'],
  fields: [
    { key: 'question', label: 'Question', type: 'text', placeholder: 'Your question?' },
    { key: 'answer', label: 'Answer', type: 'textarea', placeholder: 'The answer…' },
  ],
  create: () =>
    makeNode(
      'faqItem',
      { question: 'Can I export my site?', answer: 'Yes — export clean HTML/CSS or publish to a live URL in one click.' },
      {
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'rgba(15,23,42,0.1)',
        color: '#0f172a',
        fontSize: '17px',
      },
    ),
  render: ({ node, style, editMode }) => (
    <details className="nv-faq" style={style} open={editMode || undefined}>
      <summary className="nv-faq-q">{node.props.question}</summary>
      <div className="nv-faq-a">{node.props.answer}</div>
    </details>
  ),
})

registerBlock({
  type: 'faq',
  name: 'FAQ list',
  category: 'content',
  icon: ListCollapse,
  keywords: ['faq', 'accordion', 'questions', 'frequently asked'],
  isContainer: true,
  inspector: ['spacing', 'size', 'background', 'border', 'effects'],
  create: () =>
    makeNode(
      'faq',
      {},
      { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '760px' },
      [
        faqItem('Do I need to know how to code?', 'Not at all. Design visually and Nova writes clean, production-ready HTML and CSS for you.'),
        faqItem('Can I use my own domain?', 'Yes. Export the site and deploy it anywhere, or publish to a free live URL instantly.'),
        faqItem('Is it responsive?', 'Every site adapts to phones, tablets and desktops automatically — with per-device control when you want it.'),
      ],
    ),
  render: ({ style, children }) => <div style={style}>{children}</div>,
})

function faqItem(question: string, answer: string) {
  return makeNode(
    'faqItem',
    { question, answer },
    {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'rgba(15,23,42,0.1)',
      color: '#0f172a',
      fontSize: '17px',
    },
  )
}

/* ------------------------------------------------------------------ */
/*  Marquee — infinite auto-scrolling strip                            */
/* ------------------------------------------------------------------ */

registerBlock({
  type: 'marquee',
  name: 'Marquee',
  category: 'content',
  icon: GalleryHorizontal,
  keywords: ['scroll', 'ticker', 'logos', 'carousel', 'infinite', 'loop'],
  isContainer: true,
  inspector: ['spacing', 'size', 'background', 'effects'],
  fields: [
    { key: 'speed', label: 'Speed (seconds)', type: 'number', placeholder: '25' },
  ],
  create: () =>
    makeNode(
      'marquee',
      { speed: 25 },
      { width: '100%', paddingTop: '8px', paddingBottom: '8px' },
      ['Framer', 'Webflow', 'WordPress', 'Notion', 'Figma', 'Linear'].map((t) =>
        makeNode('heading', { text: t, level: 'h4' }, {
          fontSize: '26px', fontWeight: '700', color: 'rgba(15,23,42,0.32)', margin: '0', whiteSpace: 'nowrap',
        }),
      ),
    ),
  render: ({ node, style, children, editMode }) => {
    const speed = Number(node.props.speed) > 0 ? Number(node.props.speed) : 25
    const gap = (style.gap as string) || '56px'
    const trackStyle: React.CSSProperties = {
      display: 'inline-flex',
      width: 'max-content',
      animationName: 'nv-marquee',
      animationDuration: `${speed}s`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      animationPlayState: editMode ? 'paused' : 'running',
    }
    const groupStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap, paddingRight: gap }
    return (
      <div style={{ overflow: 'hidden', width: '100%', ...style, gap: undefined }}>
        <div style={trackStyle}>
          <div style={groupStyle}>{children}</div>
          <div style={groupStyle} aria-hidden>{children}</div>
        </div>
      </div>
    )
  },
})
