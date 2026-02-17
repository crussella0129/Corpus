// ─── Knowledge Taxonomy ───────────────────────────────────────

export interface Pillar {
  id: string
  name: string
  icon: string
  color: string
  sortOrder: number
}

export interface Domain {
  id: string
  pillarId: string
  name: string
  tier: 1 | 2 | 3
  sortOrder: number
}

export interface Topic {
  id: string
  domainId: string
  name: string
  contentPath: string | null
  sortOrder: number
}

// ─── Flashcards & FSRS ───────────────────────────────────────

export enum CardState {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3
}

export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4
}

export interface Card {
  id: number
  topicId: string
  front: string
  back: string
  cardType: 'basic' | 'cloze'
  imageUrl: string | null
  createdAt: string
  // FSRS state
  stability: number
  difficulty: number
  due: string | null
  lastReview: string | null
  reps: number
  lapses: number
  state: CardState
  elapsedDays: number
  scheduledDays: number
}

export interface ReviewLog {
  id: number
  cardId: number
  rating: Rating
  reviewAt: string
  elapsedDays: number
  scheduledDays: number
  state: CardState
  durationMs: number
}

// ─── Knowledge Graph ──────────────────────────────────────────

export type LinkRelation = 'related' | 'prerequisite' | 'builds-on' | 'applies'

export interface Link {
  id: number
  sourceId: string
  targetId: string
  relation: LinkRelation
  weight: number
}

// ─── Content Ingestion ────────────────────────────────────────

export type SourceOrigin = 'github-star' | 'manual' | 'web-import'
export type SourceStatus = 'pending' | 'ingested' | 'skipped'

export interface Source {
  id: number
  url: string
  title: string | null
  origin: SourceOrigin
  starList: string | null
  ingestedAt: string | null
  status: SourceStatus
}

// ─── User Progress ────────────────────────────────────────────

export interface DailyStats {
  date: string
  cardsReviewed: number
  cardsNew: number
  timeSpentMs: number
  domainsTouched: string[]
}

// ─── Review Session ───────────────────────────────────────────

export interface ReviewSessionState {
  cards: Card[]
  currentIndex: number
  isFlipped: boolean
  startTime: number
  cardStartTime: number
  results: { cardId: number; rating: Rating; durationMs: number }[]
}

// ─── Dashboard ────────────────────────────────────────────────

export interface DashboardData {
  dueToday: number
  newAvailable: number
  reviewedToday: number
  streak: number
  pillarProgress: { pillarId: string; total: number; mastered: number }[]
  recentActivity: DailyStats[]
}

// ─── Navigation ───────────────────────────────────────────────

export type ViewType =
  | 'dashboard'
  | 'review'
  | 'pillar'
  | 'domain'
  | 'topic'
  | 'graph'
  | 'ingest'
  | 'search'
  | 'stats'

export interface NavigationState {
  view: ViewType
  pillarId?: string
  domainId?: string
  topicId?: string
}
