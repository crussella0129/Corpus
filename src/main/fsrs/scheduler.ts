import { fsrs, createEmptyCard, generatorParameters, type Card as FSRSCard, type CardInput, Rating, State, type RecordLogItem } from 'ts-fsrs'
import { getDb } from '../db/connection'
import { FSRS_DEFAULTS } from '../../shared/constants'
import type { Card, ReviewLog } from '../../shared/types'
import { CardState, Rating as AppRating } from '../../shared/types'

const params = generatorParameters({
  request_retention: FSRS_DEFAULTS.requestRetention,
  maximum_interval: FSRS_DEFAULTS.maximumInterval
})

const f = fsrs(params)

function dbCardToFSRS(card: Card): CardInput {
  return {
    due: card.due ? new Date(card.due) : new Date(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    learning_steps: 0,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as unknown as State,
    last_review: card.lastReview ? new Date(card.lastReview) : undefined
  }
}

function ratingToFSRS(rating: AppRating): Rating {
  switch (rating) {
    case AppRating.Again:
      return Rating.Again
    case AppRating.Hard:
      return Rating.Hard
    case AppRating.Good:
      return Rating.Good
    case AppRating.Easy:
      return Rating.Easy
  }
}

export function processReview(
  cardId: number,
  rating: AppRating,
  durationMs: number
): { updatedCard: Card; log: ReviewLog } {
  const db = getDb()
  const now = new Date()

  // Fetch the card
  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId) as Record<string, unknown>
  if (!row) throw new Error(`Card ${cardId} not found`)

  const card = rowToCard(row)
  const fsrsCard = dbCardToFSRS(card)
  const fsrsRating = ratingToFSRS(rating)

  // Run FSRS scheduling
  const result: RecordLogItem = f.repeat(fsrsCard, now)[fsrsRating]
  const scheduled = result.card

  // Update card in DB
  const updateStmt = db.prepare(`
    UPDATE cards SET
      stability = ?,
      difficulty = ?,
      due = ?,
      last_review = ?,
      reps = ?,
      lapses = ?,
      state = ?,
      elapsed_days = ?,
      scheduled_days = ?
    WHERE id = ?
  `)

  updateStmt.run(
    scheduled.stability,
    scheduled.difficulty,
    scheduled.due.toISOString(),
    now.toISOString(),
    scheduled.reps,
    scheduled.lapses,
    scheduled.state,
    scheduled.elapsed_days,
    scheduled.scheduled_days,
    cardId
  )

  // Insert review log
  const logStmt = db.prepare(`
    INSERT INTO review_logs (card_id, rating, review_at, elapsed_days, scheduled_days, state, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const logResult = logStmt.run(
    cardId,
    rating,
    now.toISOString(),
    scheduled.elapsed_days,
    scheduled.scheduled_days,
    card.state,
    durationMs
  )

  // Update daily stats
  const today = now.toISOString().split('T')[0]
  const isNew = card.state === CardState.New
  db.prepare(`
    INSERT INTO daily_stats (date, cards_reviewed, cards_new, time_spent_ms, domains_touched)
    VALUES (?, 1, ?, ?, '[]')
    ON CONFLICT(date) DO UPDATE SET
      cards_reviewed = cards_reviewed + 1,
      cards_new = cards_new + ?,
      time_spent_ms = time_spent_ms + ?
  `).run(today, isNew ? 1 : 0, durationMs, isNew ? 1 : 0, durationMs)

  const updatedCard: Card = {
    ...card,
    stability: scheduled.stability,
    difficulty: scheduled.difficulty,
    due: scheduled.due.toISOString(),
    lastReview: now.toISOString(),
    reps: scheduled.reps,
    lapses: scheduled.lapses,
    state: scheduled.state as unknown as CardState,
    elapsedDays: scheduled.elapsed_days,
    scheduledDays: scheduled.scheduled_days
  }

  const log: ReviewLog = {
    id: logResult.lastInsertRowid as number,
    cardId,
    rating,
    reviewAt: now.toISOString(),
    elapsedDays: scheduled.elapsed_days,
    scheduledDays: scheduled.scheduled_days,
    state: card.state,
    durationMs
  }

  return { updatedCard, log }
}

export function getDueCards(limit: number = 50): Card[] {
  const db = getDb()
  const now = new Date().toISOString()

  const rows = db
    .prepare(
      `
    SELECT * FROM cards
    WHERE (due IS NULL AND state = 0) OR (due <= ?)
    ORDER BY
      CASE WHEN state = 0 THEN 1 ELSE 0 END,
      due ASC
    LIMIT ?
  `
    )
    .all(now, limit) as Record<string, unknown>[]

  return rows.map(rowToCard)
}

export function undoReview(cardId: number): Card | null {
  const db = getDb()

  // Find the most recent review log for this card
  const lastLog = db
    .prepare('SELECT * FROM review_logs WHERE card_id = ? ORDER BY review_at DESC LIMIT 1')
    .get(cardId) as Record<string, unknown> | undefined

  if (!lastLog) return null

  const logId = lastLog.id as number
  const logState = lastLog.state as number // state *before* the review
  const durationMs = lastLog.duration_ms as number
  const reviewDate = (lastLog.review_at as string).split('T')[0]

  // Find the previous review log (if any) to restore card to that state
  const prevLog = db
    .prepare('SELECT * FROM review_logs WHERE card_id = ? AND id < ? ORDER BY review_at DESC LIMIT 1')
    .get(cardId, logId) as Record<string, unknown> | undefined

  if (prevLog) {
    // Restore card to the state after the previous review by re-fetching
    // Since we stored the pre-review state in the log, we need the card's state from before *this* review
    // The simplest reliable approach: restore card to the state captured in the log
    db.prepare(`
      UPDATE cards SET
        state = ?,
        stability = 0,
        difficulty = 0,
        due = ?,
        last_review = ?,
        reps = CASE WHEN reps > 0 THEN reps - 1 ELSE 0 END,
        lapses = CASE WHEN ? IN (3) AND lapses > 0 THEN lapses - 1 ELSE lapses END,
        elapsed_days = 0,
        scheduled_days = 0
      WHERE id = ?
    `).run(
      logState,
      prevLog.review_at as string,
      prevLog.review_at as string,
      logState,
      cardId
    )
  } else {
    // No previous review — card was New before this review, reset to New state
    db.prepare(`
      UPDATE cards SET
        state = 0, stability = 0, difficulty = 0,
        due = NULL, last_review = NULL, reps = 0, lapses = 0,
        elapsed_days = 0, scheduled_days = 0
      WHERE id = ?
    `).run(cardId)
  }

  // Delete the review log
  db.prepare('DELETE FROM review_logs WHERE id = ?').run(logId)

  // Decrement daily stats
  const isNewCard = logState === CardState.New
  db.prepare(`
    UPDATE daily_stats SET
      cards_reviewed = CASE WHEN cards_reviewed > 0 THEN cards_reviewed - 1 ELSE 0 END,
      cards_new = CASE WHEN ? AND cards_new > 0 THEN cards_new - 1 ELSE cards_new END,
      time_spent_ms = CASE WHEN time_spent_ms > ? THEN time_spent_ms - ? ELSE 0 END
    WHERE date = ?
  `).run(isNewCard ? 1 : 0, durationMs, durationMs, reviewDate)

  // Return the updated card
  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId) as Record<string, unknown>
  return row ? rowToCard(row) : null
}

export function getNewCardForFSRS(): FSRSCard {
  return createEmptyCard()
}

function rowToCard(row: Record<string, unknown>): Card {
  return {
    id: row.id as number,
    topicId: row.topic_id as string,
    front: row.front as string,
    back: row.back as string,
    cardType: (row.card_type as 'basic' | 'cloze') || 'basic',
    imageUrl: (row.image_url as string) || null,
    createdAt: row.created_at as string,
    stability: (row.stability as number) || 0,
    difficulty: (row.difficulty as number) || 0,
    due: (row.due as string) || null,
    lastReview: (row.last_review as string) || null,
    reps: (row.reps as number) || 0,
    lapses: (row.lapses as number) || 0,
    state: (row.state as CardState) || CardState.New,
    elapsedDays: (row.elapsed_days as number) || 0,
    scheduledDays: (row.scheduled_days as number) || 0
  }
}
