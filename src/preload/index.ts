import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS } from '../shared/ipc-channels'

const corpusApi = {
  // Cards
  getCardsForReview: (limit?: number) => ipcRenderer.invoke(IPC_CHANNELS.REVIEW_GET_SESSION, limit),
  getCardsByTopic: (topicId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CARDS_GET_BY_TOPIC, topicId),
  createCard: (data: { topicId: string; front: string; back: string; cardType?: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.CARDS_CREATE, data),
  updateCard: (id: number, data: Partial<{ front: string; back: string; topicId: string }>) =>
    ipcRenderer.invoke(IPC_CHANNELS.CARDS_UPDATE, id, data),
  deleteCard: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.CARDS_DELETE, id),
  getCardCount: () => ipcRenderer.invoke(IPC_CHANNELS.CARDS_COUNT),

  // Review
  processRating: (cardId: number, rating: number, durationMs: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.REVIEW_PROCESS_RATING, cardId, rating, durationMs),
  undoReview: (cardId: number) => ipcRenderer.invoke(IPC_CHANNELS.REVIEW_UNDO, cardId),

  // Navigation
  getPillars: () => ipcRenderer.invoke(IPC_CHANNELS.PILLARS_GET_ALL),
  getDomains: (pillarId?: string) =>
    pillarId
      ? ipcRenderer.invoke(IPC_CHANNELS.DOMAINS_GET_BY_PILLAR, pillarId)
      : ipcRenderer.invoke(IPC_CHANNELS.DOMAINS_GET_ALL),
  getTopics: (domainId?: string) =>
    domainId
      ? ipcRenderer.invoke(IPC_CHANNELS.TOPICS_GET_BY_DOMAIN, domainId)
      : ipcRenderer.invoke(IPC_CHANNELS.TOPICS_GET_ALL),
  getTopic: (topicId: string) => ipcRenderer.invoke(IPC_CHANNELS.TOPICS_GET, topicId),

  // Graph
  getGraphNodes: (pillarFilter?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GRAPH_GET_NODES, pillarFilter),
  getGraphEdges: (pillarFilter?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GRAPH_GET_EDGES, pillarFilter),

  // Search
  search: (query: string, limit?: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.SEARCH_QUERY, query, limit),

  // Dashboard
  getDashboardData: () => ipcRenderer.invoke(IPC_CHANNELS.DASHBOARD_GET_DATA),
  getStreak: () => ipcRenderer.invoke(IPC_CHANNELS.DASHBOARD_GET_STREAK),
  getDailyStats: (date: string) => ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_DAILY, date),
  getStatsRange: (start: string, end: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_RANGE, start, end)
}

export type CorpusApi = typeof corpusApi

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', corpusApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = corpusApi
}
