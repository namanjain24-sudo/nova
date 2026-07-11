import './blocks' // registers all blocks
import { Canvas } from './editor/Canvas'
import { Inspector } from './editor/Inspector'
import { LeftPanel } from './editor/LeftPanel'
import { TopBar } from './editor/TopBar'
import { DndProvider } from './dnd/Dnd'
import { useShortcuts } from './lib/useShortcuts'

export default function App() {
  useShortcuts()
  return (
    <DndProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-ink-950 text-ink-100">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <LeftPanel />
          <Canvas />
          <Inspector />
        </div>
      </div>
    </DndProvider>
  )
}
