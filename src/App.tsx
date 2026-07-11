import './blocks' // registers all blocks
import { BlockPanel } from './editor/BlockPanel'
import { Canvas } from './editor/Canvas'
import { Inspector } from './editor/Inspector'
import { TopBar } from './editor/TopBar'
import { useShortcuts } from './lib/useShortcuts'

export default function App() {
  useShortcuts()
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-ink-950 text-ink-100">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <BlockPanel />
        <Canvas />
        <Inspector />
      </div>
    </div>
  )
}
