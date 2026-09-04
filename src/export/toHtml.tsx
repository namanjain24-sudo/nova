import { renderToStaticMarkup } from 'react-dom/server'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import type { Node } from '../core/schema'
import { autoResponsive, cloneNode } from '../core/schema'
import { Renderer } from '../core/Renderer'
import { slugify, getSiteFonts, getComponents, type Page } from '../store/editor'
import { fontFaceCss, fontsUsedIn, type CustomFont } from '../theme/fonts'
import { getTheme } from '../theme/engine'

const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />\n' +
  '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' +
  '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />'

const BASE_CSS = `
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0}
    body{font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    img{max-width:100%}
    a{color:inherit}
    input,textarea,button,select{font:inherit}`

/** Scroll-reveal + hover-effect rules (paired with REVEAL_JS). */
const FX_CSS = `
    [data-anim]{opacity:0;transition:opacity .7s ease,transform .75s cubic-bezier(.16,1,.3,1),filter .7s ease;will-change:opacity,transform}
    [data-anim="fade-up"]{transform:translateY(26px)}
    [data-anim="fade-down"]{transform:translateY(-26px)}
    [data-anim="zoom"]{transform:scale(.92)}
    [data-anim="slide-left"]{transform:translateX(42px)}
    [data-anim="slide-right"]{transform:translateX(-42px)}
    [data-anim="blur-up"]{transform:translateY(22px);filter:blur(14px)}
    [data-anim="rotate"]{transform:rotate(-5deg) scale(.92)}
    [data-anim="flip-up"]{transform:perspective(1200px) rotateX(34deg);transform-origin:top center}
    [data-anim].nv-in{opacity:1;transform:none;filter:none}
    @keyframes nv-page-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    body{animation:nv-page-in .5s cubic-bezier(.16,1,.3,1)}
    [data-hover]{transition:transform .22s ease,box-shadow .22s ease,filter .22s ease,opacity .22s ease}
    [data-hover="lift"]:hover{transform:translateY(-5px);box-shadow:0 24px 44px -18px rgba(15,23,42,.35)}
    [data-hover="grow"]:hover{transform:scale(1.035)}
    [data-hover="glow"]:hover{box-shadow:0 0 0 3px rgba(124,92,246,.35),0 12px 30px -12px rgba(124,92,246,.5)}
    [data-hover="dim"]:hover{opacity:.82}
    [data-hover="brighten"]:hover{filter:brightness(1.08)}
    .nv-faq>summary.nv-faq-q{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 0;font-weight:600}
    .nv-faq>summary.nv-faq-q::-webkit-details-marker{display:none}
    .nv-faq>summary.nv-faq-q::after{content:'+';font-size:24px;line-height:1;opacity:.45}
    .nv-faq[open]>summary.nv-faq-q::after{content:'−'}
    .nv-faq>.nv-faq-a{padding:0 0 20px;opacity:.72;line-height:1.6;font-weight:400;max-width:60ch}
    @keyframes nv-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    @media (prefers-reduced-motion: reduce){[data-anim]{opacity:1!important;transform:none!important;filter:none!important;transition:none}[style*="nv-marquee"]{animation:none!important}body{animation:none!important}}`

const REVEAL_JS = `
    (function(){
      var els=document.querySelectorAll('[data-anim]');
      if(!('IntersectionObserver' in window)){for(var i=0;i<els.length;i++)els[i].classList.add('nv-in');return}
      var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('nv-in');io.unobserve(x.target)}})},{threshold:.12});
      els.forEach(function(e){io.observe(e)});
    })();`

/** Count-up animation for [data-nv-count] stat numbers when scrolled into view. */
const COUNT_JS = `
    (function(){
      function grp(s){return s.replace(/\\B(?=(\\d{3})+(?!\\d))/g,',')}
      function fmt(n,d,p,s){var f=d>0?n.toFixed(d):String(Math.round(n));var a=f.split('.');a[0]=grp(a[0]);return p+a.join('.')+s}
      var els=document.querySelectorAll('[data-nv-count]');
      if(!('IntersectionObserver' in window))return;
      var io=new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting)return;var el=x.target;io.unobserve(el);
        var t=parseFloat(el.getAttribute('data-nv-count'))||0,d=parseInt(el.getAttribute('data-nv-dec'))||0,p=el.getAttribute('data-nv-prefix')||'',s=el.getAttribute('data-nv-suffix')||'',dur=parseInt(el.getAttribute('data-nv-dur'))||1600,st=performance.now();
        function tick(now){var pr=Math.min(1,(now-st)/dur),e=1-Math.pow(1-pr,3);el.textContent=fmt(t*e,d,p,s);if(pr<1)requestAnimationFrame(tick)}
        requestAnimationFrame(tick);
      })},{threshold:.4});
      els.forEach(function(e){io.observe(e)});
    })();`

/** Make [data-nv-tabs] switch panels on tab click. */
const TABS_JS = `
    (function(){
      document.querySelectorAll('[data-nv-tabs]').forEach(function(root){
        var tabs=root.querySelectorAll('[data-nv-tab]'), panels=root.querySelectorAll('[data-nv-panel]');
        function show(i){tabs.forEach(function(t,j){t.style.opacity=j==i?'1':'.5';t.style.borderBottomColor=j==i?'currentColor':'transparent'});panels.forEach(function(p,j){p.style.display=j==i?'block':'none'})}
        tabs.forEach(function(t,i){t.addEventListener('click',function(){show(i)})});
      });
    })();`

/** Click any [data-nv-lightbox] image to open it full-screen. */
const LIGHTBOX_JS = `
    (function(){
      function open(src){if(!src)return;var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:24px';var i=document.createElement('img');i.src=src;i.style.cssText='max-width:95%;max-height:95%;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.5)';o.appendChild(i);o.addEventListener('click',function(){o.remove()});document.addEventListener('keydown',function h(e){if(e.key==='Escape'){o.remove();document.removeEventListener('keydown',h)}});document.body.appendChild(o)}
      document.addEventListener('click',function(e){var t=e.target.closest('[data-nv-lightbox]');if(t){e.preventDefault();open(t.getAttribute('src'))}});
    })();`

/** Intercepts form submits and POSTs them as JSON to the Nova backend. */
const FORM_JS = `
    (function(){
      var ep=window.NOVA_FORM_ENDPOINT; if(!ep) return;
      document.querySelectorAll('form[data-nova-form]').forEach(function(f){
        f.addEventListener('submit',function(e){
          e.preventDefault();
          var hp=f.querySelector('[name=_gotcha]'); if(hp&&hp.value) return;
          var data={}; new FormData(f).forEach(function(v,k){ if(k!=='_gotcha') data[k]=v; });
          var btn=f.querySelector('button,[type=submit]'); if(btn) btn.disabled=true;
          fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form:f.getAttribute('data-form-name'),page:location.pathname,data:data})})
            .then(function(r){ if(!r.ok) throw 0; f.innerHTML='<div style="padding:18px 0;font-size:16px;font-weight:600;color:inherit">'+(f.getAttribute('data-success')||'Thanks!')+'</div>'; })
            .catch(function(){ if(btn) btn.disabled=false; alert('Something went wrong. Please try again.'); });
        });
      });
    })();`

/** Auto-responsive rules so exported sites work on tablet & phone. */
const RESPONSIVE_CSS = `
    @media (max-width: 900px){
      [data-nova-grid]{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    }
    @media (max-width: 640px){
      [data-nova-grid]{grid-template-columns:1fr!important}
      section,header,footer{padding-left:20px!important;padding-right:20px!important}
      h1{font-size:2.4rem!important;line-height:1.1!important}
      h2{font-size:1.9rem!important;line-height:1.18!important}
      h3{font-size:1.4rem!important}
    }`

/* ------------------------------------------------------------------ */
/*  Page → HTML                                                        */
/* ------------------------------------------------------------------ */

function pageTitle(root: Node, fallback: string): string {
  return (root.props?.seoTitle as string) || (root.props?.name as string) || fallback
}

/** Prop keys that hold human-readable copy, in priority order for auto-descriptions. */
const TEXT_KEYS = ['subtitle', 'subheading', 'text', 'body', 'content', 'quote', 'title', 'heading']

/** Walk the tree and stitch together a ~155-char description from real page copy. */
function deriveDescription(root: Node): string {
  const parts: string[] = []
  const visit = (n: Node) => {
    for (const k of TEXT_KEYS) {
      const v = n.props?.[k]
      if (typeof v === 'string') {
        const t = v.trim()
        if (t.length > 12 && !/^(https?:|data:|#|\/)/.test(t)) parts.push(t)
      }
    }
    n.children?.forEach(visit)
  }
  visit(root)
  const text = parts.join(' — ').replace(/\s+/g, ' ').trim()
  return text.length > 158 ? text.slice(0, 155).replace(/\s+\S*$/, '') + '…' : text
}

/** Build the SEO + social-share `<meta>` block for a page. */
function buildMeta(root: Node, title: string): string {
  const desc = ((root.props?.seoDescription as string) || deriveDescription(root)).trim()
  const image = (root.props?.ogImage as string) || ''
  const accent = getTheme(root).accent
  const tags: string[] = [
    `<meta name="theme-color" content="${escapeAttr(accent)}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
  ]
  if (desc) {
    tags.unshift(`<meta name="description" content="${escapeAttr(desc)}" />`)
    tags.push(`<meta property="og:description" content="${escapeAttr(desc)}" />`)
    tags.push(`<meta name="twitter:description" content="${escapeAttr(desc)}" />`)
  }
  if (image) {
    tags.push(`<meta property="og:image" content="${escapeAttr(image)}" />`)
    tags.push(`<meta name="twitter:image" content="${escapeAttr(image)}" />`)
  }
  return tags.join('\n  ')
}

/** Serialize one page root into a clean, self-contained HTML document. */
export function buildPageHtml(
  root: Node,
  title: string,
  links?: LinkMap,
  fonts?: CustomFont[],
  formEndpoint?: string | null,
): string {
  // Inline reusable-component instances into real markup (fresh ids → responsive works).
  root = resolveInstances(root, getComponents())
  let body = renderToStaticMarkup(<Renderer doc={root} device="desktop" editMode={false} />)
  if (links) body = resolveLinks(body, links)
  // Embed only the uploaded fonts this page references (keeps files lean).
  const used = fonts?.length ? fontsUsedIn(body, fonts) : []
  const faceCss = used.length ? `\n    ${fontFaceCss(used)}` : ''
  // Per-node responsive overrides → real media queries (matches editor device preview).
  const respCss = collectResponsiveCss(root)
  // Wire live form submissions only when a backend endpoint is known (published sites).
  const hasForm = formEndpoint && /data-nova-form/.test(body)
  const formScript = hasForm
    ? `\n  <script>window.NOVA_FORM_ENDPOINT=${JSON.stringify(formEndpoint)}</script>\n  <script>${FORM_JS}</script>`
    : ''
  // Only ship the count-up / lightbox scripts when the page actually uses them.
  const countScript = /data-nv-count/.test(body) ? `\n  <script>${COUNT_JS}</script>` : ''
  const lightboxScript = /data-nv-lightbox/.test(body) ? `\n  <script>${LIGHTBOX_JS}</script>` : ''
  const tabsScript = /data-nv-tabs/.test(body) ? `\n  <script>${TABS_JS}</script>` : ''
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  ${buildMeta(root, title)}
  ${FONT_LINK}
  <style>${faceCss}${BASE_CSS}${FX_CSS}${RESPONSIVE_CSS}${respCss}
  </style>
</head>
<body>
${body}
  <script>${REVEAL_JS}</script>${countScript}${lightboxScript}${tabsScript}${formScript}
</body>
</html>`
}

/** Replace every `instance` node with a fresh clone of its component master. */
function resolveInstances(node: Node, comps: Record<string, { root: Node }>, depth = 0): Node {
  if (node.type === 'instance' && depth < 8) {
    const master = comps[node.props?.componentId as string]
    if (master) return resolveInstances(cloneNode(master.root), comps, depth + 1)
    return { ...node, type: 'container', children: [] } // missing → collapse to empty
  }
  if (!node.children) return node
  return { ...node, children: node.children.map((c) => resolveInstances(c, comps, depth + 1)) }
}

/* ------------------------------------------------------------------ */
/*  Per-node responsive → media queries                                */
/* ------------------------------------------------------------------ */

/** camelCase style object → a CSS declaration string. */
const UNITLESS = new Set([
  'opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order', 'zoom',
])
function styleToCss(style: Record<string, any>): string {
  // Base styles render inline, which outrank class selectors — so responsive
  // overrides must be !important to actually take effect at each breakpoint.
  return Object.entries(style)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => {
      const prop = k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
      const val = typeof v === 'number' && !UNITLESS.has(k) ? `${v}px` : String(v)
      return `${prop}:${val} !important`
    })
    .join(';')
}

/**
 * Walk the tree and emit `.nv-<id>` rules for every node that carries tablet/mobile
 * overrides. Tablet applies ≤1024px, mobile ≤640px (mobile wins, matching the editor
 * cascade where mobile = base ← tablet ← mobile).
 */
function collectResponsiveCss(root: Node): string {
  const tablet: string[] = []
  const mobile: string[] = []
  const walk = (n: Node) => {
    if (n.props?._hidden) return // whole subtree is dropped from export
    // Auto responsive defaults, with any explicit per-device overrides winning.
    const t = { ...(autoResponsive(n.style, 'tablet') ?? {}), ...(n.responsive?.tablet ?? {}) }
    const m = { ...(autoResponsive(n.style, 'mobile') ?? {}), ...(n.responsive?.mobile ?? {}) }
    if (Object.keys(t).length) {
      const css = styleToCss(t)
      if (css) tablet.push(`.nv-${n.id}{${css}}`)
    }
    if (Object.keys(m).length) {
      const css = styleToCss(m)
      if (css) mobile.push(`.nv-${n.id}{${css}}`)
    }
    n.children?.forEach(walk)
  }
  walk(root)
  let css = ''
  if (tablet.length) css += `\n    @media (max-width:1024px){${tablet.join('')}}`
  if (mobile.length) css += `\n    @media (max-width:640px){${mobile.join('')}}`
  return css
}

/** Download the current page as a single HTML file. */
export function exportPageHtml(root: Node) {
  const title = pageTitle(root, 'Nova Site')
  const html = buildPageHtml(root, title, undefined, getSiteFonts())
  saveAs(new Blob([html], { type: 'text/html;charset=utf-8' }), `${slugify(title) || 'page'}.html`)
}

/* ------------------------------------------------------------------ */
/*  Whole site → ZIP (deploy-ready for Netlify Drop)                   */
/* ------------------------------------------------------------------ */

type LinkMap = Record<string, string>

/** filename for a page: the first page is the home page (index.html). */
function fileNameFor(page: Page, index: number): string {
  if (index === 0 || page.path === '/') return 'index.html'
  const base = page.path && page.path !== '/' ? slugify(page.path) : slugify(page.name)
  return `${base || 'page'}.html`
}

/** Map every internal href form a user might type to the real filename. */
function buildLinkMap(pages: Page[]): LinkMap {
  const map: LinkMap = {}
  pages.forEach((p, i) => {
    const file = fileNameFor(p, i)
    const nameSlug = slugify(p.name)
    const pathSlug = p.path && p.path !== '/' ? slugify(p.path) : ''
    for (const key of [
      `/${nameSlug}`,
      pathSlug ? `/${pathSlug}` : '',
      `#${p.id}`,
      `#${nameSlug}`,
      i === 0 ? '/' : '',
      i === 0 ? '/home' : '',
    ]) {
      if (key) map[key] = file
    }
  })
  return map
}

function resolveLinks(html: string, map: LinkMap): string {
  return html.replace(/href="([^"]*)"/g, (whole, href) => {
    const hit = map[href]
    return hit ? `href="${hit}"` : whole
  })
}

/** Build the { filename: html } map for a site (used by ZIP export and cloud publish). */
export function buildSiteFiles(
  pages: Page[],
  fonts: CustomFont[] = getSiteFonts(),
  formEndpoint?: string | null,
): Record<string, string> {
  const links = buildLinkMap(pages)
  const files: Record<string, string> = {}
  pages.forEach((p, i) => {
    files[fileNameFor(p, i)] = buildPageHtml(p.root, pageTitle(p.root, p.name), links, fonts, formEndpoint)
  })
  return files
}

/** Build a downloadable ZIP of the whole multi-page site. */
export async function buildSiteZip(pages: Page[], siteName = 'nova-site'): Promise<Blob> {
  const zip = new JSZip()
  const links = buildLinkMap(pages)
  const fonts = getSiteFonts()
  pages.forEach((p, i) => {
    const html = buildPageHtml(p.root, pageTitle(p.root, p.name), links, fonts)
    zip.file(fileNameFor(p, i), html)
  })
  // A tiny readme so users know what to do with it.
  zip.file(
    'README.txt',
    `${siteName}\n\nThis folder is a complete static website exported from Nova.\n` +
      `To publish it free in seconds:\n` +
      `  1. Go to https://app.netlify.com/drop\n` +
      `  2. Drag this whole folder (or the .zip) onto the page.\n` +
      `  3. You'll get a live URL instantly.\n\n` +
      `Or open index.html directly in any browser.\n`,
  )
  return zip.generateAsync({ type: 'blob' })
}

export async function exportSiteZip(pages: Page[], siteName = 'nova-site') {
  const blob = await buildSiteZip(pages, siteName)
  saveAs(blob, `${slugify(siteName) || 'nova-site'}.zip`)
}

/* ------------------------------------------------------------------ */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
}

/** Escape a string for use inside a double-quoted HTML attribute. */
function escapeAttr(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
}
