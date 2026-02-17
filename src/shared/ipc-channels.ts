// Type-safe IPC channel definitions
// Each channel maps to a handler in the main process

export const IPC_CHANNELS = {
  // Cards
  CARDS_GET_DUE: 'cards:get-due',
  CARDS_GET_BY_TOPIC: 'cards:get-by-topic',
  CARDS_CREATE: 'cards:create',
  CARDS_UPDATE: 'cards:update',
  CARDS_DELETE: 'cards:delete',
  CARDS_COUNT: 'cards:count',

  // Review
  REVIEW_PROCESS_RATING: 'review:process-rating',
  REVIEW_GET_SESSION: 'review:get-session',

  // Notes / Topics
  TOPICS_GET_ALL: 'topics:get-all',
  TOPICS_GET_BY_DOMAIN: 'topics:get-by-domain',
  TOPICS_GET: 'topics:get',
  DOMAINS_GET_ALL: 'domains:get-all',
  DOMAINS_GET_BY_PILLAR: 'domains:get-by-pillar',
  PILLARS_GET_ALL: 'pillars:get-all',

  // Graph
  GRAPH_GET_NODES: 'graph:get-nodes',
  GRAPH_GET_EDGES: 'graph:get-edges',

  // Search
  SEARCH_QUERY: 'search:query',

  // Dashboard
  DASHBOARD_GET_DATA: 'dashboard:get-data',
  DASHBOARD_GET_STREAK: 'dashboard:get-streak',

  // Stats
  STATS_RECORD_REVIEW: 'stats:record-review',
  STATS_GET_DAILY: 'stats:get-daily',
  STATS_GET_RANGE: 'stats:get-range'
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
