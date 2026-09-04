import { nanoid } from 'nanoid'

/** A user-uploaded font file, embedded as a data URI so it travels with the site. */
export interface CustomFont {
  id: string
  /** Family name used in CSS font stacks, e.g. "Cabinet Grotesk". */
  name: string
  /** data: URI of the font file. */
  src: string
  /** CSS `format()` token: woff2 | woff | truetype | opentype. */
  format: string
  /** Numeric weight (100–900). */
  weight: number
  italic: boolean
}

export const FONT_ACCEPT = '.woff2,.woff,.ttf,.otf'
const MAX_BYTES = 4 * 1024 * 1024 // 4 MB per file

const EXT_FORMAT: Record<string, string> = {
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
}

/** A safe CSS font stack that falls back gracefully if the file fails to load. */
export function familyStack(name: string): string {
  return `'${name.replace(/'/g, '')}', 'Inter', system-ui, sans-serif`
}

/** True if a theme font value points at this custom family. */
export function stackUsesFamily(stack: string | undefined, name: string): boolean {
  return !!stack && stack.toLowerCase().includes(`'${name.toLowerCase()}'`)
}

/** Build the `@font-face` block for a set of custom fonts (editor + export share this). */
export function fontFaceCss(fonts: CustomFont[]): string {
  return fonts
    .map(
      (f) =>
        `@font-face{font-family:'${f.name.replace(/'/g, '')}';` +
        `src:url(${f.src}) format('${f.format}');` +
        `font-weight:${f.weight};font-style:${f.italic ? 'italic' : 'normal'};font-display:swap}`,
    )
    .join('\n')
}

/** Only the families a page actually references — keeps exports lean. */
export function fontsUsedIn(css: string, fonts: CustomFont[]): CustomFont[] {
  // Rendered markup escapes quotes (font-family:&#x27;Name&#x27;), so normalize first.
  const norm = css.toLowerCase().replace(/&#x27;|&#39;|&quot;|&#34;/g, "'")
  return fonts.filter((f) => norm.includes(`'${f.name.toLowerCase()}'`))
}

const WEIGHTS: [RegExp, number][] = [
  [/thin|hairline/i, 100],
  [/extra[-\s]?light|ultra[-\s]?light/i, 200],
  [/light/i, 300],
  [/regular|normal|book/i, 400],
  [/medium/i, 500],
  [/semi[-\s]?bold|demi[-\s]?bold/i, 600],
  [/extra[-\s]?bold|ultra[-\s]?bold/i, 800],
  [/black|heavy/i, 900],
  [/bold/i, 700],
]

function guessWeight(filename: string): number {
  for (const [re, w] of WEIGHTS) if (re.test(filename)) return w
  return 400
}

/** Turn "CabinetGrotesk-BoldItalic.woff2" into a clean family name: "Cabinet Grotesk". */
function prettifyName(filename: string): string {
  let n = filename.replace(/\.[^.]+$/, '') // drop extension
  n = n.replace(/[-_]/g, ' ')
  // strip weight / style tokens
  n = n.replace(
    /\b(thin|hairline|extra ?light|ultra ?light|light|regular|normal|book|medium|semi ?bold|demi ?bold|extra ?bold|ultra ?bold|bold|black|heavy|italic|oblique|variablefont|vf)\b/gi,
    '',
  )
  n = n.replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → spaced
  n = n.replace(/\s+/g, ' ').trim()
  if (!n) n = 'Custom Font'
  return n.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Read an uploaded font file into an embeddable CustomFont (throws with a friendly message). */
export function fileToFont(file: File): Promise<CustomFont> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const format = EXT_FORMAT[ext]
  if (!format) throw new Error('Please upload a .woff2, .woff, .ttf, or .otf file.')
  if (file.size > MAX_BYTES) throw new Error('That font is over 4 MB — try a .woff2 version.')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        id: nanoid(6),
        name: prettifyName(file.name),
        src: String(reader.result),
        format,
        weight: guessWeight(file.name),
        italic: /italic|oblique/i.test(file.name),
      })
    reader.onerror = () => reject(new Error('Could not read that file. Please try again.'))
    reader.readAsDataURL(file)
  })
}
