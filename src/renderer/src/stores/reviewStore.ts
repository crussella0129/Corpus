import { create } from 'zustand'
import type { Card, Rating } from '@shared/types'

interface ReviewState {
  cards: Card[]
  currentIndex: number
  isFlipped: boolean
  cardStartTime: number
  sessionStartTime: number
  results: { cardId: number; rating: Rating; durationMs: number }[]
  isLoading: boolean
  isComplete: boolean

  startSession: (cards: Card[]) => void
  flipCard: () => void
  rateCard: (rating: Rating) => void
  nextCard: () => void
  reset: () => void
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  cardStartTime: 0,
  sessionStartTime: 0,
  results: [],
  isLoading: false,
  isComplete: false,

  startSession: (cards) =>
    set({
      cards,
      currentIndex: 0,
      isFlipped: false,
      cardStartTime: Date.now(),
      sessionStartTime: Date.now(),
      results: [],
      isLoading: false,
      isComplete: false
    }),

  flipCard: () => set({ isFlipped: true }),

  rateCard: (rating) => {
    const state = get()
    const currentCard = state.cards[state.currentIndex]
    if (!currentCard) return

    const durationMs = Date.now() - state.cardStartTime
    const result = { cardId: currentCard.id, rating, durationMs }

    set((s) => ({
      results: [...s.results, result]
    }))
  },

  nextCard: () => {
    const state = get()
    const nextIndex = state.currentIndex + 1

    if (nextIndex >= state.cards.length) {
      set({ isComplete: true })
    } else {
      set({
        currentIndex: nextIndex,
        isFlipped: false,
        cardStartTime: Date.now()
      })
    }
  },

  reset: () =>
    set({
      cards: [],
      currentIndex: 0,
      isFlipped: false,
      cardStartTime: 0,
      sessionStartTime: 0,
      results: [],
      isLoading: false,
      isComplete: false
    })
}))
