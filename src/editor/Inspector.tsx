import { Fragment, useState, type CSSProperties } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronRight,
  Component,
  ImagePlus,
  MousePointer2,
} from 'lucide-react'
import { getBlock, resolveStyle, type FieldDef, type Node } from '../core/schema'
import { findNode, pathTo } from '../lib/tree'
import { cn } from '../lib/cn'
import { useEditor } from '../store/editor'
import { ImagePicker } from './ImagePicker'
import {
  ColorInput,
  NumberInput,
  Row,
  Section,
  SegmentedControl,
  Select,
  TextArea,
  TextInput,
} from './controls'

export function Inspector() {
  const doc = useEditor((s) => s.doc)
  const device = useEditor((s) => s.device)
  const selectedId = useEditor((s) => s.selectedId)
  const updateProps = useEditor((s) => s.updateProps)
  const updateStyle = useEditor((s) => s.updateStyle)

  const node = selectedId ? findNode(doc, selectedId) : null
  const def = node ? getBlock(node.type) : null

  if (!node || !def) {
    return (
      <aside className="flex h-full w-72 shrink-0 flex-col border-l border-ink-800 bg-ink-900">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="grid size-11 place-items-center rounded-xl border border-ink-700 bg-ink-850">
            <MousePointer2 className="size-5 text-ink-500" />
          </div>
          <div className="text-[13px] font-medium text-ink-300">Nothing selected</div>
          <div className="text-[12px] leading-relaxed text-ink-500">
            Click any element on the canvas to edit its content and style.
          </div>
        </div>
      </aside>
    )
  }

  const s = resolveStyle(node, device)
  const set = (patch: CSSProperties) => updateStyle(node.id, patch)
  const groups = def.inspector ?? []

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-ink-800 bg-ink-900">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3">
        <def.icon className="size-4 text-brand-400" />
        <span className="text-[13px] font-semibold text-ink-100">{def.name}</span>
        {device !== 'desktop' && (
          <span className="ml-auto rounded-md bg-accent-500/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-400">
            {device} styles
          </span>
        )}
      </div>

      <Breadcrumb doc={doc} nodeId={node.id} />

      {node.id !== doc.id && (
        <div className="border-b border-ink-800 px-4 py-2.5">
          {def.type === 'instance' ? (
            <button
              onClick={() => useEditor.getState().enterComponent(node.props.componentId)}
              className="nova-focus flex w-full items-center justify-center gap-2 rounded-lg border border-brand-500/50 bg-brand-500/10 px-3 py-2 text-[12.5px] font-semibold text-brand-300 transition hover:bg-brand-500/20"
            >
              <Component className="size-3.5" />
              Edit component
            </button>
          ) : (
            <button
              onClick={() => {
                const name = window.prompt('Name this component (reuse it on any page):', def.name)
                if (name?.trim()) useEditor.getState().saveAsComponent(node.id, name.trim())
              }}
              className="nova-focus flex w-full items-center justify-center gap-2 rounded-lg border border-ink-700 px-3 py-2 text-[12.5px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
            >
              <Component className="size-3.5 text-brand-400" />
              Save as component
            </button>
          )}
        </div>
      )}

      <div className="nova-scroll flex-1 overflow-y-auto">
        {node.type === 'collectionList' && (
          <Section title="Collection">
            <Row label="Source">
              <Select
                value={(node.props.collectionId as string) || ''}
                onChange={(v) => updateProps(node.id, { collectionId: v })}
                options={[
                  { label: '— pick a collection —', value: '' },
                  ...useEditor.getState().collections.map((c) => ({ label: c.name, value: c.id })),
                ]}
              />
            </Row>
            <button
              onClick={() => useEditor.getState().setCmsOpen(true)}
              className="nova-focus mx-3 mb-1 flex items-center justify-center gap-1.5 rounded-lg border border-ink-700 px-3 py-1.5 text-[12px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
            >
              Manage content in CMS
            </button>
          </Section>
        )}

        {/* content fields */}
        {def.fields && def.fields.length > 0 && (
          <Section title="Content">
            {def.fields.map((f) => (
              <ContentField
                key={f.key}
                field={f}
                value={node.props[f.key]}
                onChange={(v) => updateProps(node.id, { [f.key]: v })}
              />
            ))}
          </Section>
        )}

        {groups.includes('layout') && (
          <Section title="Layout">
            <Row label="Display">
              <Select
                value={(s.display as string) ?? 'block'}
                onChange={(v) => set({ display: v })}
                options={opt('block', 'flex', 'grid', 'inline-flex', 'none')}
              />
            </Row>
            <Row label="Sticky">
              <SegmentedControl
                value={s.position === 'sticky' ? 'sticky' : 'off'}
                onChange={(v) =>
                  v === 'sticky'
                    ? set({ position: 'sticky', top: 0 as any, zIndex: 50 as any })
                    : set({ position: undefined, top: undefined, zIndex: undefined })
                }
                options={[
                  { value: 'off', label: 'Off' },
                  { value: 'sticky', label: 'Sticks to top' },
                ]}
              />
            </Row>
            {(s.display === 'flex' || s.display === 'inline-flex') && (
              <>
                <Row label="Direction">
                  <Select
                    value={(s.flexDirection as string) ?? 'row'}
                    onChange={(v) => set({ flexDirection: v as any })}
                    options={opt('row', 'column')}
                  />
                </Row>
                <Row label="Justify">
                  <Select
                    value={(s.justifyContent as string) ?? 'flex-start'}
                    onChange={(v) => set({ justifyContent: v })}
                    options={opt(
                      'flex-start',
                      'center',
                      'flex-end',
                      'space-between',
                      'space-around',
                    )}
                  />
                </Row>
                <Row label="Align">
                  <Select
                    value={(s.alignItems as string) ?? 'stretch'}
                    onChange={(v) => set({ alignItems: v })}
                    options={opt('stretch', 'flex-start', 'center', 'flex-end')}
                  />
                </Row>
              </>
            )}
            {node.type === 'columns' && (
              <Row label="Columns">
                <NumberInput
                  suffix=""
                  value={String(colCount(s))}
                  onChange={(v) =>
                    set({
                      gridTemplateColumns: `repeat(${Math.max(1, parseInt(v) || 1)}, minmax(0, 1fr))`,
                    })
                  }
                />
              </Row>
            )}
            <Row label="Gap">
              <NumberInput value={s.gap as string} onChange={(v) => set({ gap: v })} />
            </Row>
          </Section>
        )}

        {groups.includes('typography') && (
          <Section title="Typography">
            <Row label="Size">
              <NumberInput
                value={s.fontSize as string}
                onChange={(v) => set({ fontSize: v })}
              />
            </Row>
            <Row label="Weight">
              <Select
                value={(s.fontWeight as string) ?? '400'}
                onChange={(v) => set({ fontWeight: v })}
                options={['300', '400', '500', '600', '700', '800', '900'].map((w) => ({
                  label: w,
                  value: w,
                }))}
              />
            </Row>
            <Row label="Color">
              <ColorInput value={s.color as string} onChange={(v) => set({ color: v })} />
            </Row>
            <Row label="Align">
              <SegmentedControl
                value={(s.textAlign as string) ?? 'left'}
                onChange={(v) => set({ textAlign: v as any })}
                options={[
                  { value: 'left', label: <AlignLeft className="size-3.5" /> },
                  { value: 'center', label: <AlignCenter className="size-3.5" /> },
                  { value: 'right', label: <AlignRight className="size-3.5" /> },
                ]}
              />
            </Row>
            <Row label="Line H">
              <NumberInput
                suffix=""
                value={s.lineHeight as string}
                onChange={(v) => set({ lineHeight: v })}
                placeholder="1.5"
              />
            </Row>
          </Section>
        )}

        {groups.includes('background') && (
          <Section title="Background">
            <BackgroundControl s={s} set={set} />
          </Section>
        )}

        {groups.includes('spacing') && (
          <Section title="Spacing">
            <BoxControl label="Padding" side="padding" s={s} set={set} />
            <BoxControl label="Margin" side="margin" s={s} set={set} />
          </Section>
        )}

        {groups.includes('size') && (
          <Section title="Size">
            <Row label="Width">
              <TextInput
                value={(s.width as string) ?? ''}
                onChange={(v) => set({ width: v })}
                placeholder="auto"
              />
            </Row>
            <Row label="Max W">
              <TextInput
                value={(s.maxWidth as string) ?? ''}
                onChange={(v) => set({ maxWidth: v })}
                placeholder="none"
              />
            </Row>
            <Row label="Height">
              <TextInput
                value={(s.height as string) ?? ''}
                onChange={(v) => set({ height: v })}
                placeholder="auto"
              />
            </Row>
          </Section>
        )}

        {groups.includes('border') && (
          <Section title="Border">
            <Row label="Radius">
              <NumberInput
                value={s.borderRadius as string}
                onChange={(v) => set({ borderRadius: v })}
              />
            </Row>
            <Row label="Width">
              <NumberInput
                value={s.borderWidth as string}
                onChange={(v) =>
                  set({ borderWidth: v, borderStyle: v ? 'solid' : undefined })
                }
              />
            </Row>
            <Row label="Color">
              <ColorInput
                value={s.borderColor as string}
                onChange={(v) => set({ borderColor: v })}
              />
            </Row>
          </Section>
        )}

        {groups.includes('effects') && (
          <Section title="Effects">
            <Row label="Shadow">
              <Select
                value={shadowPreset(s.boxShadow as string)}
                onChange={(v) => set({ boxShadow: SHADOWS[v] })}
                options={Object.keys(SHADOWS).map((k) => ({ label: k, value: k }))}
              />
            </Row>
            <Row label="Opacity">
              <NumberInput
                suffix=""
                value={s.opacity != null ? String(s.opacity) : ''}
                onChange={(v) => set({ opacity: v === '' ? undefined : (Number(v) as any) })}
                placeholder="1"
              />
            </Row>
          </Section>
        )}

        {node.id !== doc.id && (
          <Section title="Interactions">
            <Row label="Animate in">
              <Select
                value={(node.props._anim as string) ?? 'none'}
                onChange={(v) => updateProps(node.id, { _anim: v === 'none' ? undefined : v })}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Fade', value: 'fade' },
                  { label: 'Fade up', value: 'fade-up' },
                  { label: 'Fade down', value: 'fade-down' },
                  { label: 'Zoom in', value: 'zoom' },
                  { label: 'Slide left', value: 'slide-left' },
                  { label: 'Slide right', value: 'slide-right' },
                  { label: 'Blur up', value: 'blur-up' },
                  { label: 'Rotate in', value: 'rotate' },
                  { label: 'Flip up', value: 'flip-up' },
                ]}
              />
            </Row>
            {node.props._anim && (
              <Row label="Delay">
                <NumberInput
                  suffix="ms"
                  value={node.props._animDelay != null ? String(node.props._animDelay) : ''}
                  onChange={(v) =>
                    updateProps(node.id, { _animDelay: v === '' ? undefined : Number(v) })
                  }
                  placeholder="0"
                />
              </Row>
            )}
            <Row label="On hover">
              <Select
                value={(node.props._hover as string) ?? 'none'}
                onChange={(v) => updateProps(node.id, { _hover: v === 'none' ? undefined : v })}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Lift', value: 'lift' },
                  { label: 'Grow', value: 'grow' },
                  { label: 'Glow', value: 'glow' },
                  { label: 'Dim', value: 'dim' },
                  { label: 'Brighten', value: 'brighten' },
                ]}
              />
            </Row>
            <p className="mt-1 text-[10px] leading-relaxed text-ink-500">
              Preview or export to see animations play.
            </p>
          </Section>
        )}
      </div>
    </aside>
  )
}

function ContentField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: any
  onChange: (v: any) => void
}) {
  if (field.type === 'textarea')
    return (
      <div>
        <div className="mb-1 text-[11px] text-ink-400">{field.label}</div>
        <TextArea value={value ?? ''} onChange={onChange} placeholder={field.placeholder} />
      </div>
    )
  if (field.type === 'select')
    return (
      <Row label={field.label}>
        <Select value={value ?? ''} onChange={onChange} options={field.options ?? []} />
      </Row>
    )
  if (field.type === 'number')
    return (
      <Row label={field.label}>
        <NumberInput
          suffix=""
          value={value != null ? String(value) : ''}
          onChange={(v) => onChange(v === '' ? undefined : Number(v))}
          placeholder={field.placeholder}
        />
      </Row>
    )
  if (field.type === 'boolean')
    return (
      <Row label={field.label}>
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          onClick={() => onChange(!value)}
          className={cn(
            'relative h-5 w-9 shrink-0 rounded-full transition',
            value ? 'bg-brand-600' : 'bg-ink-700',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-4 rounded-full bg-white transition-all',
              value ? 'left-[18px]' : 'left-0.5',
            )}
          />
        </button>
      </Row>
    )
  if (field.type === 'color')
    return (
      <Row label={field.label}>
        <ColorInput value={value} onChange={onChange} />
      </Row>
    )
  if (field.type === 'image')
    return <ImageField label={field.label} value={value} onChange={onChange} placeholder={field.placeholder} />
  return (
    <Row label={field.label}>
      <TextInput value={value ?? ''} onChange={onChange} placeholder={field.placeholder} />
    </Row>
  )
}

/** Ancestor path of the selected node — click any crumb to select that parent. */
function Breadcrumb({ doc, nodeId }: { doc: Node; nodeId: string }) {
  const ids = [...(pathTo(doc, nodeId) ?? []), nodeId]
  if (ids.length <= 1) return null
  return (
    <div className="nova-scroll flex items-center gap-0.5 overflow-x-auto border-b border-ink-800 px-3 py-1.5">
      {ids.map((id, i) => {
        const n = findNode(doc, id)
        const label = id === doc.id ? 'Page' : (n ? getBlock(n.type)?.name ?? n.type : '?')
        const isLast = i === ids.length - 1
        return (
          <Fragment key={id}>
            {i > 0 && <ChevronRight className="size-3 shrink-0 text-ink-600" />}
            <button
              disabled={isLast}
              onClick={() => useEditor.getState().select(id)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] transition',
                isLast ? 'font-semibold text-brand-300' : 'text-ink-400 hover:bg-ink-800 hover:text-ink-100',
              )}
            >
              {label}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}

function ImageField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const onFile = (file: File | undefined) => {
    if (!file) return
    if (file.size > 3_000_000) {
      alert('Please choose an image under 3 MB (it is embedded directly in your page).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
  }
  const isData = typeof value === 'string' && value.startsWith('data:')
  return (
    <div>
      <div className="mb-1.5 text-[11px] text-ink-400">{label}</div>
      <div className="flex items-center gap-2.5">
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-ink-700 bg-ink-850">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[9px] text-ink-500">none</span>
          )}
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="nova-focus flex items-center gap-1.5 rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1.5 text-[11px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:text-white"
        >
          <ImagePlus className="size-3.5 text-brand-400" />
          Browse
        </button>
        <label className="nova-focus cursor-pointer rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1.5 text-[11px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:text-white">
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {pickerOpen && <ImagePicker onPick={onChange} onClose={() => setPickerOpen(false)} />}
      <input
        className="nova-focus mt-2 w-full rounded-md border border-ink-700 bg-ink-850 px-2 py-1 text-[12px] text-ink-100 placeholder:text-ink-500"
        value={isData ? '' : value ?? ''}
        placeholder={isData ? 'Uploaded image ✓' : placeholder ?? 'https://…'}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function BackgroundControl({ s, set }: { s: CSSProperties; set: (p: CSSProperties) => void }) {
  const bg = typeof s.background === 'string' ? s.background : ''
  const isGradient = bg.includes('gradient')
  const m = /linear-gradient\(\s*(-?\d+)deg\s*,\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/i.exec(bg)
  const angle = m ? m[1] : '135'
  const from = m ? m[2].trim() : (s.backgroundColor as string) || '#7c3aed'
  const to = m ? m[3].trim() : '#4f46e5'

  const setGradient = (next: { angle?: string; from?: string; to?: string }) => {
    const a = next.angle ?? angle
    const f = next.from ?? from
    const t = next.to ?? to
    set({ background: `linear-gradient(${a}deg, ${f}, ${t})`, backgroundColor: undefined })
  }

  return (
    <>
      <Row label="Type">
        <SegmentedControl
          value={isGradient ? 'gradient' : 'solid'}
          onChange={(v) =>
            v === 'gradient'
              ? setGradient({ from: (s.backgroundColor as string) || from })
              : set({ background: undefined, backgroundColor: from })
          }
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'gradient', label: 'Gradient' },
          ]}
        />
      </Row>
      {isGradient ? (
        <>
          <Row label="From">
            <ColorInput value={from} onChange={(v) => setGradient({ from: v })} />
          </Row>
          <Row label="To">
            <ColorInput value={to} onChange={(v) => setGradient({ to: v })} />
          </Row>
          <Row label="Angle">
            <NumberInput suffix="°" value={angle} onChange={(v) => setGradient({ angle: v || '0' })} placeholder="135" />
          </Row>
        </>
      ) : (
        <Row label="Color">
          <ColorInput value={s.backgroundColor as string} onChange={(v) => set({ backgroundColor: v })} />
        </Row>
      )}
    </>
  )
}

function BoxControl({
  label,
  side,
  s,
  set,
}: {
  label: string
  side: 'padding' | 'margin'
  s: CSSProperties
  set: (p: CSSProperties) => void
}) {
  const sides = ['Top', 'Right', 'Bottom', 'Left'] as const
  return (
    <div>
      <div className="mb-1 text-[11px] text-ink-400">{label}</div>
      <div className="grid grid-cols-4 gap-1.5">
        {sides.map((sd) => {
          const key = `${side}${sd}` as keyof CSSProperties
          return (
            <NumberInput
              key={sd}
              value={s[key] as string}
              onChange={(v) => set({ [key]: v } as CSSProperties)}
              placeholder={sd[0]}
            />
          )
        })}
      </div>
    </div>
  )
}

function opt(...vals: string[]) {
  return vals.map((v) => ({ label: v, value: v }))
}

function colCount(s: CSSProperties): number {
  const m = /repeat\((\d+)/.exec((s.gridTemplateColumns as string) ?? '')
  return m ? parseInt(m[1]) : 3
}

const SHADOWS: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px rgba(15,23,42,0.08)',
  md: '0 6px 16px -4px rgba(15,23,42,0.12)',
  lg: '0 18px 40px -12px rgba(15,23,42,0.22)',
  xl: '0 30px 60px -18px rgba(15,23,42,0.30)',
}
function shadowPreset(v: string | undefined): string {
  const found = Object.entries(SHADOWS).find(([, val]) => val === v)
  return found ? found[0] : v ? 'md' : 'none'
}
