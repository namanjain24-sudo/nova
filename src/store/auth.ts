import { create } from 'zustand'
import { authApi, setToken, getToken, type User } from '../api/client'

interface AuthState {
  user: User | null
  ready: boolean // finished the initial token check
  busy: boolean

  // which cloud project the current editor site maps to
  currentProjectId: string | null
  currentProjectName: string | null

  // modal visibility
  authModalOpen: boolean
  projectsOpen: boolean
  submissionsOpen: boolean

  init: () => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setAuthModalOpen: (open: boolean) => void
  setProjectsOpen: (open: boolean) => void
  setSubmissionsOpen: (open: boolean) => void
  setCurrentProject: (id: string | null, name: string | null) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  busy: false,
  currentProjectId: null,
  currentProjectName: null,
  authModalOpen: false,
  projectsOpen: false,
  submissionsOpen: false,

  init: async () => {
    if (!getToken()) {
      set({ ready: true })
      return
    }
    try {
      const { user } = await authApi.me()
      set({ user, ready: true })
    } catch {
      setToken(null)
      set({ user: null, ready: true })
    }
  },

  signup: async (email, password) => {
    set({ busy: true })
    try {
      const { token, user } = await authApi.signup(email, password)
      setToken(token)
      set({ user, authModalOpen: false })
    } finally {
      set({ busy: false })
    }
  },

  login: async (email, password) => {
    set({ busy: true })
    try {
      const { token, user } = await authApi.login(email, password)
      setToken(token)
      set({ user, authModalOpen: false })
    } finally {
      set({ busy: false })
    }
  },

  logout: () => {
    setToken(null)
    set({ user: null, currentProjectId: null, currentProjectName: null, projectsOpen: false, submissionsOpen: false })
  },

  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setProjectsOpen: (open) => set({ projectsOpen: open }),
  setSubmissionsOpen: (open) => set({ submissionsOpen: open }),
  setCurrentProject: (id, name) => set({ currentProjectId: id, currentProjectName: name }),
}))
