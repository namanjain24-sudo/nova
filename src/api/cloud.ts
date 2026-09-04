import { getSite, getSitePages, getSiteFonts, useEditor } from '../store/editor'
import { buildSiteFiles } from '../export/toHtml'
import { projectsApi, type ProjectSummary } from './client'
import { useAuth } from '../store/auth'

/** Save the current editor site to the cloud (create or update). Returns project id. */
export async function saveToCloud(): Promise<string> {
  const { currentProjectId, currentProjectName } = useAuth.getState()
  const site = getSite()
  const name = site.pages[0]?.name || currentProjectName || 'Untitled site'
  if (currentProjectId) {
    await projectsApi.update(currentProjectId, { name, data: site })
    useAuth.getState().setCurrentProject(currentProjectId, name)
    return currentProjectId
  }
  const { project } = await projectsApi.create(name, site)
  useAuth.getState().setCurrentProject(project.id, project.name)
  return project.id
}

/** Load a cloud project into the editor. */
export async function openCloudProject(id: string) {
  const { project } = await projectsApi.get(id)
  if (project.data) useEditor.getState().loadSite(project.data)
  useAuth.getState().setCurrentProject(project.id, project.name)
}

/** Save + build static files + publish. Returns the absolute live URL. */
export async function publishToCloud(): Promise<string> {
  const id = await saveToCloud()
  // Published sites are served by our backend, so forms POST to a same-origin path.
  const files = buildSiteFiles(getSitePages(), getSiteFonts(), `/api/f/${id}`)
  const { url } = await projectsApi.publish(id, files)
  return new URL(url, window.location.origin).href
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const { projects } = await projectsApi.list()
  return projects
}

export async function deleteProject(id: string) {
  await projectsApi.remove(id)
  if (useAuth.getState().currentProjectId === id) {
    useAuth.getState().setCurrentProject(null, null)
  }
}
