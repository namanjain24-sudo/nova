import { useEffect } from 'react'
import './blocks' // registers all blocks
import { Canvas } from './editor/Canvas'
import { Inspector } from './editor/Inspector'
import { LeftPanel } from './editor/LeftPanel'
import { TopBar } from './editor/TopBar'
import { PagesBar } from './editor/PagesBar'
import { TemplateGallery } from './editor/TemplateGallery'
import { AuthModal } from './editor/AuthModal'
import { ProjectsModal } from './editor/ProjectsModal'
import { SubmissionsModal } from './editor/SubmissionsModal'
import { CmsModal } from './editor/CmsModal'
import { CommandPalette } from './editor/CommandPalette'
import { SectionLibrary } from './editor/SectionLibrary'
import { PreviewBar } from './editor/PreviewBar'
import { DndProvider } from './dnd/Dnd'
import { useShortcuts } from './lib/useShortcuts'
import { useCustomFonts } from './lib/useCustomFonts'
import { useAuth } from './store/auth'
import { useEditor } from './store/editor'
import { Check, Component } from 'lucide-react'

export default function App() {
  useShortcuts()
  useCustomFonts()

  // Restore any saved session on load (validates the stored token against the backend).
  useEffect(() => {
    void useAuth.getState().init()
  }, [])

  return (
    <DndProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-ink-950 text-ink-100">
        <TopBar />
        <ComponentEditBanner />
        <PagesBar />
        <div className="flex min-h-0 flex-1">
          <LeftPanel />
          <Canvas />
          <Inspector />
        </div>
      </div>
      <TemplateGallery />
      <AuthModal />
      <ProjectsModal />
      <SubmissionsModal />
      <CmsModal />
      <CommandPalette />
      <SectionLibrary />
      <PreviewBar />
    </DndProvider>
  )
}

function ComponentEditBanner() {
  const editingId = useEditor((s) => s.editingComponentId)
  const name = useEditor((s) => (s.editingComponentId ? s.components[s.editingComponentId]?.name : null))
  if (!editingId) return null
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-brand-500/30 bg-brand-500/10 px-4 text-[12.5px]">
      <Component className="size-3.5 text-brand-400" />
      <span className="font-semibold text-brand-200">Editing component</span>
      <span className="text-brand-300/80">· {name}</span>
      <span className="text-ink-400">— changes apply to every instance</span>
      <button
        onClick={() => useEditor.getState().exitComponent()}
        className="nova-focus ml-auto flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-brand-500"
      >
        <Check className="size-3.5" />
        Done
      </button>
    </div>
  )
}
