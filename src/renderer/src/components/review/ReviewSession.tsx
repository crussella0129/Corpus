import { useState, useEffect, useCallback } from 'react'
import { CardFront } from './CardFront'
import { CardBack } from './CardBack'
import { RatingButtons } from './RatingButtons'
import { useReviewStore } from '../../stores/reviewStore'
import { useNavigationStore } from '../../stores/navigationStore'
import { Rating } from '@shared/types'
import type { Card } from '@shared/types'

export function ReviewSession(): React.JSX.Element {
  const {
    cards,
    currentIndex,
    isFlipped,
    results,
    isComplete,
    startSession,
    flipCard,
    rateCard,
    nextCard,
    reset
  } = useReviewStore()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigationStore((s) => s.navigate)

  useEffect(() => {
    setLoading(true)
    window.api
      .getCardsForReview(50)
      .then((dueCards: Card[]) => {
        if (dueCards.length > 0) {
          startSession(dueCards)
        }
      })
      .finally(() => setLoading(false))

    return () => reset()
  }, [])

  const handleRate = useCallback(
    async (rating: Rating) => {
      const currentCard = cards[currentIndex]
      if (!currentCard) return

      rateCard(rating)

      const startTime = useReviewStore.getState().cardStartTime
      const durationMs = Date.now() - startTime

      try {
        await window.api.processRating(currentCard.id, rating, durationMs)
      } catch (err) {
        console.error('Failed to process rating:', err)
      }

      nextCard()
    },
    [cards, currentIndex, rateCard, nextCard]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isFlipped) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          flipCard()
        }
        return
      }

      switch (e.key) {
        case '1':
          handleRate(Rating.Again)
          break
        case '2':
          handleRate(Rating.Hard)
          break
        case '3':
          handleRate(Rating.Good)
          break
        case '4':
          handleRate(Rating.Easy)
          break
      }
    },
    [isFlipped, flipCard, handleRate]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading review session...</div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-xl font-bold text-text-primary">All caught up!</h2>
        <p className="text-text-muted">No cards due for review right now.</p>
        <button
          onClick={() => navigate('dashboard')}
          className="bg-accent hover:bg-accent-hover text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (isComplete) {
    const totalTime = results.reduce((sum, r) => sum + r.durationMs, 0)
    const avgTime = results.length > 0 ? totalTime / results.length : 0
    const goodOrEasy = results.filter(
      (r) => r.rating === Rating.Good || r.rating === Rating.Easy
    ).length
    const accuracy = results.length > 0 ? Math.round((goodOrEasy / results.length) * 100) : 0

    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-6xl">✅</div>
        <h2 className="text-xl font-bold text-text-primary">Session Complete!</h2>

        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{results.length}</div>
            <div className="text-xs text-text-muted">Cards Reviewed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{accuracy}%</div>
            <div className="text-xs text-text-muted">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">
              {Math.round(avgTime / 1000)}s
            </div>
            <div className="text-xs text-text-muted">Avg per Card</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('dashboard')}
            className="bg-bg-secondary border border-border hover:border-accent text-text-primary rounded-lg py-2 px-4 text-sm font-medium transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              reset()
              setLoading(true)
              window.api
                .getCardsForReview(50)
                .then((dueCards: Card[]) => {
                  if (dueCards.length > 0) startSession(dueCards)
                })
                .finally(() => setLoading(false))
            }}
            className="bg-accent hover:bg-accent-hover text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors"
          >
            Continue Reviewing
          </button>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 pt-8">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 bg-bg-tertiary rounded-full h-1.5">
          <div
            className="bg-accent rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-text-muted">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full bg-bg-secondary border border-border rounded-xl p-8 min-h-[300px] flex flex-col justify-center cursor-pointer select-none"
        onClick={() => !isFlipped && flipCard()}
      >
        {!isFlipped ? (
          <CardFront front={currentCard.front} />
        ) : (
          <CardBack front={currentCard.front} back={currentCard.back} />
        )}
      </div>

      {/* Actions */}
      {!isFlipped ? (
        <button
          onClick={flipCard}
          className="bg-accent hover:bg-accent-hover text-white rounded-lg py-2.5 px-6 font-medium transition-colors"
        >
          Show Answer
          <span className="ml-2 text-xs opacity-70">[Space]</span>
        </button>
      ) : (
        <RatingButtons onRate={handleRate} />
      )}

      {/* Keyboard hint */}
      <p className="text-[10px] text-text-muted">
        {isFlipped
          ? 'Press 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)'
          : 'Press Space or Enter to reveal'}
      </p>
    </div>
  )
}
