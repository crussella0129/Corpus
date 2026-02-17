import { create } from 'zustand'
import type { Card, Rating } from '@shared/types'

interface UndoEntry {
  card: Card
  rating: Rating
  durationMs: number
}

interface ReviewState {
  cards: Card[]
  currentIndex: number
  isFlipped: boolean
  cardStartTime: number
  sessionStartTime: number
  results: { cardId: number; rating: Rating; durationMs: number }[]
  isLoading: boolean
  isComplete: boolean
  undoEntry: UndoEntry | null
  canUndo: boolean

  startSession: (cards: Card[]) => void
  flipCard: () => void
  rateCard: (rating: Rating) => void
  nextCard: () => void
  setUndoEntry: (entry: UndoEntry) => void
  clearUndo: () => void
  undoLastRating: () => void
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
  undoEntry: null,
  canUndo: false,

  startSession: (cards) =>
    set({
      cards,
      currentIndex: 0,
      isFlipped: false,
      cardStartTime: Date.now(),
      sessionStartTime: Date.now(),
      results: [],
      isLoading: false,
      isComplete: false,
      undoEntry: null,
      canUndo: false
    }),

  flipCard: () => set({ isFlipped: true }),

  rateCard: (rating) => {
    const state = get()
    const currentCard = state.cards[state.currentIndex]
    if (!currentCard) return

    const durationMs = Date.now() - state.cardStartTime
    const result = { cardId: currentCard.id, rating, durationMs }

    set((s) => ({
      results: [...s.results, result],
      undoEntry: { card: { ...currentCard }, rating, durationMs },
      canUndo: true
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

  setUndoEntry: (entry) => set({ undoEntry: entry, canUndo: true }),

  clearUndo: () => set({ undoEntry: null, canUndo: false }),

  undoLastRating: () => {
    const state = get()
    if (!state.undoEntry) return

    const undoneCard = state.undoEntry.card

    // Remove the last result
    const newResults = state.results.slice(0, -1)

    if (state.isComplete) {
      // Was on completion screen — go back to last card
      set({
        results: newResults,
        isComplete: false,
        currentIndex: state.cards.length - 1,
        isFlipped: false,
        cardStartTime: Date.now(),
        undoEntry: null,
        canUndo: false,
        // Replace the card in the array with its pre-review state
        cards: state.cards.map((c) => (c.id === undoneCard.id ? undoneCard : c))
      })
    } else {
      // Go back one card
      set({
        results: newResults,
        currentIndex: Math.max(0, state.currentIndex - 1),
        isFlipped: false,
        cardStartTime: Date.now(),
        undoEntry: null,
        canUndo: false,
        cards: state.cards.map((c) => (c.id === undoneCard.id ? undoneCard : c))
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
      isComplete: false,
      undoEntry: null,
      canUndo: false
    })
}))
