import type { Pillar } from './types'

export const PILLARS: Pillar[] = [
  {
    id: 'technical-mastery',
    name: 'Technical Mastery',
    icon: 'Code2',
    color: '#6366f1',
    sortOrder: 1
  },
  {
    id: 'financial-intelligence',
    name: 'Financial Intelligence',
    icon: 'TrendingUp',
    color: '#22c55e',
    sortOrder: 2
  },
  {
    id: 'ai-symbiosis',
    name: 'AI Symbiosis',
    icon: 'Brain',
    color: '#a855f7',
    sortOrder: 3
  },
  {
    id: 'cognitive-performance',
    name: 'Cognitive Performance',
    icon: 'Lightbulb',
    color: '#f59e0b',
    sortOrder: 4
  },
  {
    id: 'professional-excellence',
    name: 'Professional Excellence',
    icon: 'Briefcase',
    color: '#3b82f6',
    sortOrder: 5
  },
  {
    id: 'physical-wellbeing',
    name: 'Physical & Mental Wellbeing',
    icon: 'Heart',
    color: '#ef4444',
    sortOrder: 6
  }
]

export const FSRS_DEFAULTS = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  w: [
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26,
    0.29, 2.61
  ]
}

export const TIER_LABELS: Record<number, string> = {
  1: 'Deep Mastery',
  2: 'Working Reference',
  3: 'Curated Links'
}

export const REVIEW_LIMITS = {
  newCardsPerDay: 20,
  maxReviewsPerDay: 200
}
