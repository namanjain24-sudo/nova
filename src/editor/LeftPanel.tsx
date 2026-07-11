import { useState } from 'react'
import { Blocks, Layers } from 'lucide-react'
import { BlockPanel } from './BlockPanel'
import { LayersPanel } from './LayersPanel'
import { cn } from '../lib/cn'

type Tab = 'blocks' | 'layers'

export function LeftPanel() {
  const [tab, setTab] = useState<Tab>('blocks')

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900">
      <div className="flex items-center gap-1 border-b border-ink-800 px-2 pt-2">
        <TabButton active={tab === 'blocks'} onClick={() => setTab('blocks')} icon={Blocks}>
          Blocks
        </TabButton>
        <TabButton active={tab === 'layers'} onClick={() => setTab('layers')} icon={Layers}>
          Layers
        </TabButton>
      </div>
      {tab === 'blocks' ? <BlockPanel /> : <LayersPanel />}
    </aside>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Blocks
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-[12px] font-medium transition',
        active ? 'text-ink-100' : 'text-ink-400 hover:text-ink-200',
      )}
    >
      <Icon className="size-3.5" />
      {children}
      {active && (
        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" />
      )}
    </button>
  )
}
