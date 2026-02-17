import { create } from 'zustand'
import type { ViewType } from '@shared/types'

interface NavigationState {
  view: ViewType
  pillarId: string | null
  domainId: string | null
  topicId: string | null
  navigate: (view: ViewType, ids?: { pillarId?: string; domainId?: string; topicId?: string }) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: 'dashboard',
  pillarId: null,
  domainId: null,
  topicId: null,
  navigate: (view, ids) =>
    set({
      view,
      pillarId: ids?.pillarId ?? null,
      domainId: ids?.domainId ?? null,
      topicId: ids?.topicId ?? null
    })
}))
