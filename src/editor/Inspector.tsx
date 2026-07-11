import type { CSSProperties } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  MousePointer2,
} from 'lucide-react'
import { getBlock, resolveStyle, type FieldDef } from '../core/schema'
import { findNode } from '../lib/tree'
import { useEditor } from '../store/editor'
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

      <div className="nova-scroll flex-1 overflow-y-auto">
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
            <Row label="Color">
              <ColorInput
                value={s.backgroundColor as string}
                onChange={(v) => set({ backgroundColor: v })}
              />
            </Row>
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
  if (field.type === 'color')
    return (
      <Row label={field.label}>
        <ColorInput value={value} onChange={onChange} />
      </Row>
    )
  return (
    <Row label={field.label}>
      <TextInput value={value ?? ''} onChange={onChange} placeholder={field.placeholder} />
    </Row>
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
